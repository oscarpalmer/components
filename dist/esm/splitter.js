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
var isTouchy = (() => {
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (media != null && typeof media.matches === "boolean") {
        return media.matches;
      }
    }
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator?.msMaxTouchPoints ?? 0) > 0;
  } catch (_) {
    return false;
  }
})();
function getCoordinates(event) {
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  const x = event.touches[0]?.clientX;
  const y = event.touches[0]?.clientY;
  return x == null || y == null ? void 0 : { x, y };
}
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/splitter.ts
var pointerBeginEvent = isTouchy ? "touchstart" : "mousedown";
var pointerEndEvent = isTouchy ? "touchend" : "mouseup";
var pointerMoveEvent = isTouchy ? "touchmove" : "mousemove";
var selector = "palmer-splitter";
var splitterTypes = ["horizontal", "vertical"];
var store = /* @__PURE__ */ new WeakMap();
var index = 0;
function createHandle(component, className) {
  const handle = document.createElement("span");
  handle.className = `${className}__separator__handle`;
  handle.ariaHidden = "true";
  handle.textContent = component.type === "horizontal" ? "\u2195" : "\u2194";
  handle.addEventListener(pointerBeginEvent, () => onPointerBegin(component));
  return handle;
}
function createSeparator(component, values, className) {
  let actualValues = values ?? store.get(component)?.values;
  if (actualValues == null) {
    return null;
  }
  const separator = document.createElement("div");
  if (isNullOrWhitespace(component.primary.id)) {
    component.primary.id = `palmer_splitter_primary_panel_${++index}`;
  }
  separator.className = `${className}__separator`;
  separator.role = "separator";
  separator.tabIndex = 0;
  separator.setAttribute("aria-controls", component.primary.id);
  separator.setAttribute("aria-valuemax", "100");
  separator.setAttribute("aria-valuemin", "0");
  separator.setAttribute("aria-valuenow", "50");
  let original = component.getAttribute("value");
  if (isNullOrWhitespace(original)) {
    setFlexValue(component, separator, 50);
  }
  separator.appendChild(component.handle);
  separator.addEventListener("keydown", (event) => onSeparatorKeydown(component, event), eventOptions.passive);
  return separator;
}
function onDocumentKeydown(event) {
  if (event.key === "Escape") {
    setDragging(this, false);
  }
}
function onPointerBegin(component) {
  setDragging(component, true);
}
function onPointerEnd() {
  setDragging(this, false);
}
function onPointerMove(event) {
  const coordinates = getCoordinates(event);
  if (coordinates == null) {
    return;
  }
  const componentRectangle = this.getBoundingClientRect();
  let value = void 0;
  if (this.type === "horizontal") {
    value = (coordinates.y - componentRectangle.top) / componentRectangle.height;
  } else {
    value = (coordinates.x - componentRectangle.left) / componentRectangle.width;
  }
  setFlexValue(this, this.separator, value * 100);
}
function onSeparatorKeydown(component, event) {
  if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Escape", "Home"].includes(event.key)) {
    return;
  }
  const ignored = component.type === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowDown", "ArrowUp"];
  if (ignored.includes(event.key)) {
    return;
  }
  const values = store.get(component)?.values;
  if (values == null) {
    return;
  }
  let value;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
      value = Math.round(component.value + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1));
      break;
    case "End":
    case "Home":
      value = event.key === "End" ? values.maximum : values.minimum;
      break;
    case "Escape":
      value = values.initial ?? values.original;
      values.initial = void 0;
      break;
    default:
      break;
  }
  setFlexValue(component, component.separator, value, values);
}
function setAbsoluteValue(component, separator, key, value, setFlex, values) {
  let actualValues = values ?? store.get(component)?.values;
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
  if (setFlex && (key === "maximum" && actualValue < actualValues.current || key === "minimum" && actualValue > actualValues.current)) {
    setFlexValue(component, separator, actualValue, actualValues);
  }
}
function setDragging(component, active) {
  const stored = store.get(component);
  if (stored == null) {
    return;
  }
  if (active) {
    stored.values.initial = Number(stored.values.current);
  }
  const method = active ? "addEventListener" : "removeEventListener";
  document[method]("keydown", stored.callbacks.keydown, eventOptions.passive);
  document[method](pointerEndEvent, stored.callbacks.pointerEnd, eventOptions.passive);
  document[method](pointerMoveEvent, stored.callbacks.pointerMove, eventOptions.passive);
  stored.dragging = active;
}
function setFlexValue(component, separator, value, values, setOriginal) {
  let actualValues = values ?? store.get(component)?.values;
  let actualValue = getNumber(value);
  if (actualValues == null || Number.isNaN(actualValue) || actualValue === actualValues.current) {
    return;
  }
  if (actualValue < actualValues.minimum) {
    actualValue = actualValues.minimum;
  } else if (actualValue > actualValues.maximum) {
    actualValue = actualValues.maximum;
  }
  if (setOriginal ?? false) {
    actualValues.original = actualValue;
  }
  separator.ariaValueNow = actualValue;
  component.primary.style.flex = `${actualValue / 100}`;
  component.secondary.style.flex = `${(100 - actualValue) / 100}`;
  actualValues.current = actualValue;
  component.dispatchEvent(new CustomEvent("change", {
    detail: {
      value: actualValue
    }
  }));
}
var PalmerSplitter = class extends HTMLElement {
  handle;
  primary;
  secondary;
  separator;
  get max() {
    return store.get(this)?.values.maximum;
  }
  set max(max) {
    this.setAttribute("max", max);
  }
  get min() {
    return store.get(this)?.values.minimum;
  }
  set min(min) {
    this.setAttribute("min", min);
  }
  get type() {
    const type = this.getAttribute("type") ?? "vertical";
    return splitterTypes.includes(type) ? type : "vertical";
  }
  set type(type) {
    this.setAttribute("type", type);
  }
  get value() {
    return store.get(this)?.values.current;
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  constructor() {
    super();
    if (this.children.length !== 2) {
      throw new Error(`A <${selector}> must have exactly two direct children`);
    }
    const stored = {
      callbacks: {
        keydown: onDocumentKeydown.bind(this),
        pointerEnd: onPointerEnd.bind(this),
        pointerMove: onPointerMove.bind(this)
      },
      dragging: false,
      values: {
        current: -1,
        maximum: 100,
        minimum: 0,
        original: 50
      }
    };
    store.set(this, stored);
    this.primary = this.children[0];
    this.secondary = this.children[1];
    let className = this.getAttribute("className");
    if (isNullOrWhitespace(className)) {
      className = selector;
    }
    this.handle = createHandle(this, className);
    this.separator = createSeparator(this, stored.values, className);
    this.primary?.insertAdjacentElement("afterend", this.separator);
  }
  attributeChangedCallback(name, _, value) {
    switch (name) {
      case "max":
      case "min":
        setAbsoluteValue(this, this.separator, name === "max" ? "maximum" : "minimum", value, true);
        break;
      case "value":
        setFlexValue(this, this.separator, value, void 0, true);
        break;
      default:
        break;
    }
  }
};
__publicField(PalmerSplitter, "observedAttributes", ["max", "min", "value"]);
customElements.define(selector, PalmerSplitter);
