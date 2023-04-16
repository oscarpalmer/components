"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/helpers/index.ts
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
var focusableSelectors = [
  '[contenteditable]:not([contenteditable="false"])',
  "[href]",
  "[tabindex]:not(slot)",
  "audio[controls]",
  "button",
  "details",
  "details[open] > summary",
  "embed",
  "iframe",
  "input",
  "object",
  "select",
  "textarea",
  "video[controls]"
];
var focusableSelector = focusableSelectors.map((selector) => `${selector}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
function getAttribute(element, attribute, defaultValue) {
  const value = element.getAttribute(attribute);
  return value == null || value.trim().length === 0 ? defaultValue : value;
}
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function isNullOrWhitespace(value) {
  return (value != null ? value : "").trim().length === 0;
}
function setAttribute(element, attribute, value) {
  if (value == null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, String(value));
  }
}

// src/splitter.ts
var splitterTypes = ["horizontal", "vertical"];
var index = 0;
function createSeparator(splitter) {
  const separator = document.createElement("div");
  if (isNullOrWhitespace(splitter.primary.id)) {
    splitter.primary.id = `spiffy_splitter_primary_${++index}`;
  }
  setAttribute(separator, "aria-controls", splitter.primary.id);
  separator.role = "separator";
  separator.tabIndex = 0;
  const originalValue = getAttribute(splitter, "value", "50");
  const originalNumber = getNumber(originalValue);
  splitter.values.original = typeof originalNumber === "number" ? originalNumber : 50;
  const maximum = getAttribute(splitter, "max", "");
  const minimum = getAttribute(splitter, "min", "");
  if (maximum.length === 0) {
    setAbsoluteValue(splitter, separator, "maximum", 100);
  }
  if (minimum.length === 0) {
    setAbsoluteValue(splitter, separator, "minimum", 0);
  }
  setFlexValue(splitter, separator, splitter.values.original, false);
  separator.addEventListener("keydown", (event) => onKeydown(splitter, event), eventOptions.passive);
  return separator;
}
function onKeydown(splitter, event) {
  if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Escape", "Home"].includes(event.key)) {
    return;
  }
  const ignored = splitter.type === "vertical" ? ["ArrowLeft", "ArrowRight"] : ["ArrowDown", "ArrowUp"];
  if (ignored.includes(event.key)) {
    return;
  }
  let value;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
      value = splitter.value + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1);
      break;
    case "End":
    case "Home":
      value = event.key === "End" ? splitter.values.maximum : splitter.values.minimum;
      break;
    case "Escape":
      value = splitter.values.original;
      break;
    default:
      break;
  }
  setFlexValue(splitter, splitter.separator, value, true);
}
function setAbsoluteValue(splitter, separator, key, value) {
  let actual = getNumber(value);
  if (Number.isNaN(actual) || actual === splitter.values[key] || key === "maximum" && actual < splitter.values.minimum || key === "minimum" && actual > splitter.values.maximum) {
    return;
  }
  if (key === "maximum" && actual > 100) {
    actual = 100;
  } else if (key === "minimum" && actual < 0) {
    actual = 0;
  }
  splitter.values[key] = actual;
  setAttribute(separator, key === "maximum" ? "aria-valuemax" : "aria-valuemin", actual);
  if (key === "maximum" && actual < splitter.values.current || key === "minimum" && actual > splitter.values.current) {
    setFlexValue(splitter, separator, actual, true);
  }
}
function setFlexValue(splitter, separator, value, emit) {
  let actual = getNumber(value);
  if (Number.isNaN(actual) || actual === splitter.values.current) {
    return;
  }
  if (actual < splitter.values.minimum) {
    actual = splitter.values.minimum;
  } else if (actual > splitter.values.maximum) {
    actual = splitter.values.maximum;
  }
  separator.ariaValueNow = String(actual);
  splitter.primary.style.flex = `${actual / 100}`;
  splitter.values.current = actual;
  if (emit) {
    splitter.dispatchEvent(new CustomEvent("change", {
      detail: {
        value: actual
      }
    }));
  }
}
var SpiffySplitter = class extends HTMLElement {
  constructor() {
    var _a;
    super();
    __publicField(this, "primary");
    __publicField(this, "secondary");
    __publicField(this, "separator");
    __publicField(this, "values", {
      current: -1,
      maximum: -1,
      minimum: -1,
      original: -1
    });
    if (this.children.length < 2) {
      throw new Error("A <spffy-splitter> must have at least two direct children");
    }
    this.primary = this.children[0];
    this.secondary = [...this.children].slice(1);
    this.separator = createSeparator(this);
    (_a = this.primary) == null ? void 0 : _a.insertAdjacentElement("afterend", this.separator);
  }
  get max() {
    return this.values.maximum;
  }
  set max(max) {
    setAbsoluteValue(this, this.separator, "maximum", max);
  }
  get min() {
    return this.values.minimum;
  }
  set min(min) {
    setAbsoluteValue(this, this.separator, "minimum", min);
  }
  get type() {
    const type = getAttribute(this, "type", "horizontal");
    return splitterTypes.includes(type) ? type : "horizontal";
  }
  set type(type) {
    if (splitterTypes.includes(type)) {
      setAttribute(this, "type", type);
    }
  }
  get value() {
    return this.values.current;
  }
  set value(value) {
    setFlexValue(this, this.separator, value, true);
  }
  attributeChangedCallback(name, _, value) {
    switch (name) {
      case "max":
      case "min":
        setAbsoluteValue(this, this.separator, name === "max" ? "maximum" : "minimum", value);
        break;
      case "value":
        setFlexValue(this, this.separator, value, true);
        break;
      default:
        break;
    }
  }
};
__publicField(SpiffySplitter, "observedAttributes", ["max", "min", "value"]);
globalThis.customElements.define("spiffy-splitter", SpiffySplitter);
