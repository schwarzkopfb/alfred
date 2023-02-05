#!/usr/bin/env zx
$.verbose = false;

import { openWithApp } from "./repo.mjs";

const [, , , arg] = process.argv;
const { path, app } = JSON.parse(arg);

await openWithApp(path, app);
