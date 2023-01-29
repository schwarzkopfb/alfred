import get from "lodash.get";
import toPath from "lodash.topath";

const RX_PURE_KEY = /^[a-z0-9_]+$/i;

export default function displaySuggestions(clipboard, path) {
  try {
    const data = JSON.parse(clipboard);

    return displayValue(data, path);
  } catch (e) {
    return displayError("Clipboard content is not valid JSON");
  }
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
      return displayKeys(data, undefined, lastPart);
    }

    const parentPath = pathFromArray(parts);
    value = get(data, parentPath);
    const parentType = getType(value);

    if (parentType === "array" || parentType === "object") {
      return displayKeys(value, parentPath, lastPart);
    } else {
      return displayError("No such property");
    }
  }

  const type = getType(value);

  if (type === "object" || type === "array") {
    if (type === "array" && value.length === 0) {
      return displayEmptyArray();
    } else if (type === "object" && isEmptyObject(value)) {
      return displayEmptyObject();
    } else {
      return displayKeys(value, path);
    }
  } else {
    value = formatValue(value, type);

    return displayItems([
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
    return displayError("No such property");
    return;
  }

  return displayItems(
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
  return JSON.stringify({ items });
}

function displayEmptyArray() {
  return displayItems([
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
  return displayItems([
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
  return JSON.stringify({
    "items": [
      {
        "title": message,
        valid: false,
        "icon": {
          "path": "./icons/error.png",
        },
      },
    ],
  });
}
