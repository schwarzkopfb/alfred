#!/usr/bin/env zx
$.verbose = false;

import displaySuggestions from "./pj.mjs";

const [, , , path] = process.argv;
const { stdout: clipboard } = await $`pbpaste`;

console.log(displaySuggestions(clipboard, path));
