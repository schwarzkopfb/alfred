#!/usr/bin/env zx
$.verbose = false;

import displaySuggestions from "./repo.mjs";
import settings from "./settings.json" assert { type: "json" };

const [, , , filter] = process.argv;

console.log(await displaySuggestions(filter, settings));
