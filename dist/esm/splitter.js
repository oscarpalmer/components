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
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/splitter.ts
var selector = "palmer-splitter";
var splitterTypes = ["horizontal", "vertical"];
var store = /* @__PURE__ */ new WeakMap();
var index = 0;
function createSeparator(splitter, values) {
  let actualValues = values ?? store.get(splitter);
  if (actualValues == null) {
    return null;
  }
  const separator = document.createElement("div");
  if (isNullOrWhitespace(splitter.primary.id)) {
    splitter.primary.id = `palmer_splitter_primary_panel_${++index}`;
  }
  separator.setAttribute("aria-controls", splitter.primary.id);
  separator.role = "separator";
  separator.tabIndex = 0;
  let originalValue = splitter.getAttribute("value");
  if (isNullOrWhitespace(originalValue)) {
    originalValue = "50";
  }
  const originalNumber = getNumber(originalValue);
  actualValues.original = typeof originalNumber === "number" ? originalNumber : 50;
  const maximum = splitter.getAttribute("max") ?? "";
  const minimum = splitter.getAttribute("min") ?? "";
  if (maximum.length === 0) {
    setAbsoluteValue(splitter, separator, "maximum", 100);
  }
  if (minimum.length === 0) {
    setAbsoluteValue(splitter, separator, "minimum", 0);
  }
  setFlexValue(splitter, separator, actualValues.original, false);
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
  const values = store.get(splitter);
  if (values == null) {
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
      value = event.key === "End" ? values.maximum : values.minimum;
      break;
    case "Escape":
      value = values.original;
      break;
    default:
      break;
  }
  setFlexValue(splitter, splitter.separator, value, true);
}
function setAbsoluteValue(splitter, separator, key, value, values) {
  let actualValues = values ?? store.get(splitter);
  let actualValue = getNumber(value);
  if (actualValues == null || Number.isNaN(actualValue) || actualValue === actualValues[key] || key === "maximum" && actualValue < actualValues.minimum || key === "minimum" && actualValue > actualValues.maximum) {
    return;
  }
  if (key === "maximum" && actualValue > 100) {
    actualValue = 100;
  } else if (key === "minimum" && actualValue < 0) {
    actualValue = 0;
  }
  actualValues[key] = actualValue;
  separator.setAttribute(key === "maximum" ? "aria-valuemax" : "aria-valuemin", actualValue);
  if (key === "maximum" && actualValue < actualValues.current || key === "minimum" && actualValue > actualValues.current) {
    setFlexValue(splitter, separator, actualValues, true);
  }
}
function setFlexValue(splitter, separator, value, emit, values) {
  let actualValues = values ?? store.get(splitter);
  let actualValue = getNumber(value);
  if (actualValues == null || Number.isNaN(actualValue) || actualValue === actualValues.current) {
    return;
  }
  if (actualValue < actualValues.minimum) {
    actualValue = actualValues.minimum;
  } else if (actualValue > actualValues.maximum) {
    actualValue = actualValues.maximum;
  }
  separator.ariaValueNow = actualValue;
  splitter.primary.style.flex = `${actualValue / 100}`;
  splitter.secondary.style.flex = `${(100 - actualValue) / 100}`;
  actualValues.current = actualValue;
  if (emit) {
    splitter.dispatchEvent(new CustomEvent("change", {
      detail: {
        value: actualValue
      }
    }));
  }
}
var PalmerSplitter = class extends HTMLElement {
  primary;
  secondary;
  separator;
  get max() {
    return store.get(this)?.maximum;
  }
  set max(max) {
    setAbsoluteValue(this, this.separator, "maximum", max);
  }
  get min() {
    return store.get(this)?.minimum;
  }
  set min(min) {
    setAbsoluteValue(this, this.separator, "minimum", min);
  }
  get type() {
    const type = this.getAttribute("type") ?? "horizontal";
    return splitterTypes.includes(type) ? type : "horizontal";
  }
  set type(type) {
    if (splitterTypes.includes(type)) {
      this.setAttribute("type", type);
    }
  }
  get value() {
    return store.get(this)?.current;
  }
  set value(value) {
    setFlexValue(this, this.separator, value, true);
  }
  constructor() {
    super();
    if (this.children.length !== 2) {
      throw new Error(`A <${selector}> must have exactly two direct children`);
    }
    const values = {
      current: -1,
      maximum: -1,
      minimum: -1,
      original: -1
    };
    store.set(this, values);
    this.primary = this.children[0];
    this.secondary = this.children[1];
    this.separator = createSeparator(this, values);
    this.primary?.insertAdjacentElement("afterend", this.separator);
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
__publicField(PalmerSplitter, "observedAttributes", ["max", "min", "value"]);
customElements.define(selector, PalmerSplitter);
