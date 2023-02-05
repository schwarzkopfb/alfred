# alfred
Some of my Alfred.app custom workflows

## pj
Parse and explore JSON data from clipboard without leaving Alfred

![demo](./img/pj2.gif)

### How does it work?

* Type `pr [property path]` and hit enter to list keys from JSON data currently copeied into clipboard. Just skip path to list the root level properties. Path is the standard JavaScript accessor syntax and is processed with [lodash.get](https://www.npmjs.com/package/lodash.get).
* Arrays and Objects will be further expanded, primitive values can be copied back to the clipboard directly.
* Hold Cmd ⌘ to copy the property path insted of the value.

## repo

Browse git repos on your local machine and open them with your preferred app. A modern, minimalistic rewrite of [this thingy](https://github.com/deanishe/alfred-repos).

![demo](./img/repo.gif)

Use modifier keys to open in a different app instead. Check out the source and `settings.json` to hack it for your specific purposes.

## Requirements
* [zx](https://github.com/google/zx) installed [with homebrew](https://formulae.brew.sh/formula/zx)
