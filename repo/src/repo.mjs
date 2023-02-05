import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

function resolvePath(path) {
  if (process.platform === "win32") {
    return path;
  } else {
    return path.replace("~", homedir());
  }
}

export function openWithApp(path, app) {
  if (app.toLowerCase() === "terminal") {
    $`./open-in-terminal.sh ${path}`;
  } else {
    $`open -a ${app} ${path}`;
  }
}

async function isGitRepo(path) {
  const { stdout } = await $`git -C ${path} rev-parse --is-inside-work-tree`;
  return stdout.trim() === "true";
}

async function searchRepos(filter = "", dirs = []) {
  const results = await Promise.all(dirs.map(async (dir) => {
    const path = resolvePath(dir);

    try {
      const entries = await readdir(path, { withFileTypes: true });
      const matching = entries.filter((e) =>
        e.isDirectory() && e.name.includes(filter)
      ).map(({ name }) => ({
        basename: name,
        path: join(path, name),
      }));
      const gitRepos = await Promise.all(
        matching.map(async (p) => {
          const isRepo = await isGitRepo(p.path);
          return isRepo ? p : null;
        }),
      );

      return gitRepos.filter((p) => p);
    } catch (e) {
      // most likely a permission error or non-existent path
      console.error(e);
      process.exit(1);
    }
  }));

  return results.flat();
}

function generateModsConfig(arg, apps) {
  const mods = {};

  for (const [key, { name, icon }] of Object.entries(apps)) {
    mods[key] = {
      subtitle: `Open in ${name}`,
      arg: JSON.stringify({ path: arg, app: name }),
      icon: {
        path: (icon && `app_icons/${icon}`) || "icon.png",
      },
    };
  }

  return mods;
}

function createItem({ basename, path }, apps) {
  const { base: { name, icon } } = apps;

  return {
    uid: path,
    title: basename,
    subtitle: `Open in ${name}`,
    autocomplete: basename,
    arg: JSON.stringify({ path, app: apps.base.name }),
    icon: {
      path: (icon && `app_icons/${icon}`) || "icon.png",
    },
    mods: generateModsConfig(path, apps),
  };
}

export default async function displaySuggestions(filter, { apps, dirs }) {
  const entries = await searchRepos(filter, dirs);
  const items = entries.map((e) => createItem(e, apps));

  return JSON.stringify({ items });
}
