#!/Users/schwarzkopfb/.nvm/versions/node/v18.12.1/bin/node /Users/schwarzkopfb/.nvm/versions/node/v18.12.1/bin/zx
$.verbose = false;

import get from "lodash.get";

const RX_PURE_KEY = /^[a-z0-9_]+$/i;

const [, , , path] = process.argv;
const { stdout: clipboard } = await $`pbpaste`;

try {
  const data = JSON.parse(clipboard);
  const result = path ? get(data, path) : data;

  displayValue(result, path);
} catch (e) {
  displayError("Clipboard content is not valid JSON");
}

function getAutocomplete(path, key) {
  const isInteger = Number.isInteger(parseInt(key));
  const useBrackets = isInteger || !RX_PURE_KEY.test(key);

  if (isInteger) {
    key = `[${key}]`;
  } else if (useBrackets) {
    key = `["${key}"]`;
  }

  if (!path) {
    return key;
  } else {
    return `${path}${useBrackets ? "" : "."}${key}`;
  }
}

function createItem(title, subtitle, autocomplete, valid, arg, icon = "curly_brackets") {
  return {
    title,
    subtitle,
    arg,
    autocomplete,
    valid,
    icon: {
        path: `./${icon}.png`,
    },
  };
}

function displayValue(value, path) {
  if (typeof value === "object") {
    displayKeys(value, path);
  } else {
    const type = typeof value;
    displayItems([
      createItem(value, type, path, true, value, "copy"),
    ]);
  }
}

function displayKeys(obj, path) {
  displayItems(
    Object.entries(obj).map(([k, v]) =>
      createItem(k, typeof v, getAutocomplete(path, k), false)
    ),
  );
}

function displayItems(items) {
  console.log(JSON.stringify({ items }));
}

function displayError(message) {
  console.log(JSON.stringify({
    "items": [
      {
        "title": message,
        "icon": {
          "path": "./error.png",
        },
      },
    ],
  }));
}
