#!/usr/bin/env zx
$.verbose = false;

import get from "lodash.get";
import toPath from "lodash.topath";

const RX_PURE_KEY = /^[a-z0-9_]+$/i;

const [, , , path] = process.argv;
const { stdout: clipboard } = await $`pbpaste`;

try {
  const data = JSON.parse(clipboard);

  displayValue(data, path);
} catch (e) {
  displayError("Clipboard content is not valid JSON");
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function pathFromArray(parts) {
  return parts.map((part, i) => {
    if (Number.isInteger(parseInt(part))) {
      return `[${part}]`;
    } else if (RX_PURE_KEY.test(part)) {
      return `${i > 0 ? "." : ""}${part}`;
    } else {
      return `["${part}"]`;
    }
  }).join("");
}

function normalizePath(path) {
  return pathFromArray(toPath(path));
}

function getType(value) {
  const type = typeof value;

  if (type === "object") {
    if (Array.isArray(value)) {
      return "array";
    } else if (value === null) {
      return "null";
    }
  }

  return type;
}

function getIcon(type) {
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "bool";
    case "null":
      return "null";
    case "array":
      return "array";
    case "object":
    default:
      return "object";
  }
}

function formatValue(value, type) {
  if (type === "string") {
    return `"${value}"`;
  } else if (type === "boolean") {
    return value ? "true" : "false";
  } else {
    return value;
  }
}

function getSubtitle(value, type) {
  if (type === "array") {
    return `Array (length: ${value.length})`;
  } else if (type === "object") {
    return `Object (keys: ${Object.keys(value).length})`;
  } else if (type === "string") {
    return `"${value}"`;
  } else if (type === "boolean") {
    return value ? "true" : "false";
  } else {
    return value;
  }
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

function createItem(
  title,
  subtitle,
  autocomplete,
  valid,
  arg,
  icon = "object",
) {
  return {
    title,
    subtitle,
    arg,
    autocomplete,
    valid,
    icon: {
      path: `./icons/${icon}.png`,
    },

    mods: {
      cmd: {
        subtitle: "Copy property path to clipboard",
        arg: normalizePath(autocomplete),
        icon: {
          path: "./icons/copy.png",
        },
      },
    },
  };
}

function displayValue(data, path) {
  let value = path ? get(data, path) : data;

  if (value === undefined) {
    const parts = toPath(path);
    const lastPart = parts.pop();

    if (parts.length === 0) {
      displayKeys(data, undefined, lastPart);
      return;
    }

    const parentPath = pathFromArray(parts);
    value = get(data, parentPath);
    const parentType = getType(value);

    if (parentType === "array" || parentType === "object") {
      displayKeys(value, parentPath, lastPart);
    } else {
      displayError("No such property");
    }

    return;
  }

  const type = getType(value);

  if (type === "object" || type === "array") {
    if (type === "array" && value.length === 0) {
      displayEmptyArray();
    } else if (type === "object" && isEmptyObject(value)) {
      displayEmptyObject();
    } else {
      displayKeys(value, path);
    }
  } else {
    value = formatValue(value, type);

    displayItems([
      createItem(
        value,
        `${type} - Copy to clipboard`,
        path,
        true,
        value,
        "copy",
      ),
    ]);
  }
}

function displayKeys(obj, path, filter = "") {
  const entries = Object.entries(obj).filter(([k]) => k.startsWith(filter));

  if (filter && entries.length === 0) {
    displayError("No such property");
    return;
  }

  displayItems(
    entries
      .map(([k, v]) => {
        const type = getType(v);
        return createItem(
          k,
          getSubtitle(v, type),
          getAutocomplete(path, k),
          false,
          undefined,
          getIcon(type),
        );
      }),
  );
}

function displayItems(items) {
  console.log(JSON.stringify({ items }));
}

function displayEmptyArray() {
  displayItems([
    createItem(
      "Empty",
      "Array (length: 0)",
      undefined,
      false,
      undefined,
      "array",
    ),
  ]);
}

function displayEmptyObject() {
  displayItems([
    createItem(
      "Empty",
      "Object (keys: 0)",
      undefined,
      false,
      undefined,
      "object",
    ),
  ]);
}

function displayError(message) {
  console.log(JSON.stringify({
    "items": [
      {
        "title": message,
        valid: false,
        "icon": {
          "path": "./icons/error.png",
        },
      },
    ],
  }));
}
