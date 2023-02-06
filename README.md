# alfred
Some of my [Alfred](https://www.alfredapp.com/) custom workflows

The only dependency of workflows in this repo is [zx](https://github.com/google/zx) installed [with homebrew](https://formulae.brew.sh/formula/zx).

## pj
Parse and explore JSON data from clipboard without leaving Alfred

![demo](./img/pj2.gif)

### How does it work?
* Type `pj [property path]` and hit enter to list keys from JSON data currently copeied into clipboard. Just skip path to list the root level properties. Path is the standard JavaScript accessor syntax and is processed with [lodash.get](https://www.npmjs.com/package/lodash.get).
* Arrays and Objects will be further expanded, primitive values can be copied back to the clipboard directly.
* Hold Cmd ⌘ to copy the property path insted of the value.

## repo
Browse git repos on your local machine and open them with your preferred app. A modern, minimalistic rewrite of [this thingy](https://github.com/deanishe/alfred-repos).

![demo](./img/repo.gif)

### How doeas it work?
* Type `repo [filter]` to search for git repositories in your [specified directories](https://schwarzkopfb.codes/alfred/blob/5d890f0a576e460a4fa5e5497b13516dadc416cf/repo/src/settings.json#L9).
* Use modifier keys to open repo in different apps.
* Type `reposettings` to open & edit [`settings.json`](https://schwarzkopfb.codes/alfred/blob/main/repo/src/settings.json) to hack it for your specific purposes.
* Put additional application icons to [`app_icons`](https://schwarzkopfb.codes/alfred/tree/5d890f0a576e460a4fa5e5497b13516dadc416cf/repo/src/app_icons) folder if needed.
