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
function findParent(element, match) {
  const matchIsSelector = typeof match === "string";
  if (matchIsSelector ? element.matches(match) : match(element)) {
    return element;
  }
  let parent = element == null ? void 0 : element.parentElement;
  while (parent != null) {
    if (parent === document.body) {
      return;
    }
    if (matchIsSelector ? parent.matches(match) : match(parent)) {
      break;
    }
    parent = parent.parentElement;
  }
  return parent != null ? parent : void 0;
}
function getFocusableElements(context) {
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(getFocusableSelector()));
  for (const element of elements) {
    const style = getComputedStyle == null ? void 0 : getComputedStyle(element);
    if (style == null || style.display !== "none" && style.visibility !== "hidden") {
      focusable.push(element);
    }
  }
  return focusable;
}
function getFocusableSelector() {
  const context = globalThis;
  if (context.focusableSelector == null) {
    context.focusableSelector = [
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
    ].map((selector6) => `${selector6}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
  }
  return context.focusableSelector;
}
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function getTextDirection(element) {
  const { direction } = getComputedStyle == null ? void 0 : getComputedStyle(element);
  return direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value != null ? value : "").trim().length === 0;
}

// src/accordion.ts
var keys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
  var _a, _b, _c;
  if (((_a = document.activeElement) == null ? void 0 : _a.tagName) !== "SUMMARY" || !keys.includes(event.key)) {
    return;
  }
  const stored = store.get(component);
  if (stored == null || stored.elements.length === 0) {
    return;
  }
  const current = stored.elements.indexOf(document.activeElement.parentElement);
  if (current === -1) {
    return;
  }
  event.preventDefault();
  let destination = -1;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      destination = current + 1;
      break;
    case "ArrowLeft":
    case "ArrowUp":
      destination = current - 1;
      break;
    case "End":
      destination = stored.elements.length - 1;
      break;
    case "Home":
      destination = 0;
      break;
  }
  if (destination < 0) {
    destination = stored.elements.length - 1;
  } else if (destination >= stored.elements.length) {
    destination = 0;
  }
  if (destination === current) {
    return;
  }
  const summary = (_b = stored.elements[destination]) == null ? void 0 : _b.querySelector(":scope > summary");
  if (summary != null) {
    (_c = summary.focus) == null ? void 0 : _c.call(summary);
  }
}
function onToggle(component, element) {
  if (element.open && !component.multiple) {
    toggleDetails(component, element);
  }
}
function setDetails(component) {
  const stored = store.get(component);
  if (stored == null) {
    return;
  }
  stored.elements = [...component.querySelectorAll(":scope > details")];
  for (const element of stored.elements) {
    element.addEventListener("toggle", () => onToggle(component, element));
  }
}
function toggleDetails(component, active) {
  const stored = store.get(component);
  if (stored == null) {
    return;
  }
  for (const element of stored.elements) {
    if (element !== active && element.open) {
      element.open = false;
    }
  }
}
var PalmerAccordion = class extends HTMLElement {
  get multiple() {
    return this.getAttribute("multiple") !== "false";
  }
  set multiple(multiple) {
    if (typeof multiple === "boolean") {
      this.setAttribute("multiple", multiple);
    }
  }
  constructor() {
    super();
    const stored = {
      elements: [],
      observer: new MutationObserver((_) => setDetails(this))
    };
    store.set(this, stored);
    setDetails(this);
    this.addEventListener("keydown", (event) => onKeydown(this, event), eventOptions.active);
    if (!this.multiple) {
      toggleDetails(this, stored.elements.find((details) => details.open));
    }
  }
  attributeChangedCallback(name) {
    var _a;
    if (name === "multiple" && !this.multiple) {
      toggleDetails(this, (_a = store.get(this)) == null ? void 0 : _a.elements.find((details) => details.open));
    }
  }
  connectedCallback() {
    var _a;
    (_a = store.get(this)) == null ? void 0 : _a.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  disconnectedCallback() {
    var _a;
    (_a = store.get(this)) == null ? void 0 : _a.observer.disconnect();
  }
};
__publicField(PalmerAccordion, "observedAttributes", ["max", "min", "value"]);
customElements.define("palmer-accordion", PalmerAccordion);

// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var request = requestAnimationFrame != null ? requestAnimationFrame : function(callback) {
  var _a;
  return (_a = setTimeout == null ? void 0 : setTimeout(() => {
    callback(Date.now());
  }, milliseconds)) != null ? _a : -1;
};
var Timed = class {
  constructor(callback, time, count, afterCallback) {
    __publicField(this, "callbacks");
    __publicField(this, "configuration");
    __publicField(this, "state", {
      active: false,
      finished: false
    });
    const isRepeated = this instanceof Repeated;
    const type = isRepeated ? "repeated" : "waited";
    if (typeof callback !== "function") {
      throw new Error(`A ${type} timer must have a callback function`);
    }
    if (typeof time !== "number" || time < 0) {
      throw new Error(`A ${type} timer must have a non-negative number as its time`);
    }
    if (isRepeated && (typeof count !== "number" || count < 2)) {
      throw new Error("A repeated timer must have a number above 1 as its repeat count");
    }
    if (isRepeated && afterCallback != null && typeof afterCallback !== "function") {
      throw new Error("A repeated timer's after-callback must be a function");
    }
    this.configuration = { count, time };
    this.callbacks = {
      after: afterCallback,
      default: callback
    };
  }
  /**
   * Is the timer active?
   */
  get active() {
    return this.state.active;
  }
  /**
   * Has the timer finished?
   */
  get finished() {
    return !this.state.active && this.state.finished;
  }
  static run(timed) {
    timed.state.active = true;
    timed.state.finished = false;
    const isRepeated = timed instanceof Repeated;
    let count = 0;
    let start;
    function step(timestamp) {
      if (!timed.state.active) {
        return;
      }
      start != null ? start : start = timestamp;
      const elapsed = timestamp - start;
      const elapsedMinimum = elapsed - milliseconds;
      const elapsedMaximum = elapsed + milliseconds;
      if (elapsedMinimum < timed.configuration.time && timed.configuration.time < elapsedMaximum) {
        if (timed.state.active) {
          timed.callbacks.default(isRepeated ? count : void 0);
        }
        count += 1;
        if (isRepeated && count < timed.configuration.count) {
          start = void 0;
        } else {
          timed.state.finished = true;
          timed.stop();
          return;
        }
      }
      timed.state.frame = request(step);
    }
    timed.state.frame = request(step);
  }
  /**
   * Restart timer
   */
  restart() {
    this.stop();
    Timed.run(this);
    return this;
  }
  /**
   * Start timer
   */
  start() {
    if (!this.state.active) {
      Timed.run(this);
    }
    return this;
  }
  /**
   * Stop timer
   */
  stop() {
    var _a, _b, _c;
    this.state.active = false;
    if (typeof this.state.frame === "undefined") {
      return this;
    }
    (_a = cancelAnimationFrame != null ? cancelAnimationFrame : clearTimeout) == null ? void 0 : _a(this.state.frame);
    (_c = (_b = this.callbacks).after) == null ? void 0 : _c.call(_b, this.finished);
    this.state.frame = void 0;
    return this;
  }
};
var Repeated = class extends Timed {
};
var Waited = class extends Timed {
  constructor(callback, time) {
    super(callback, time, 1);
  }
};
function repeat(callback, time, count, afterCallback) {
  return new Repeated(callback, time, count, afterCallback).start();
}
function wait(callback, time) {
  return new Waited(callback, time).start();
}

// src/details.ts
var selector = "palmer-details";
var store2 = /* @__PURE__ */ new WeakMap();
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (!(element instanceof HTMLDetailsElement)) {
      throw new Error(`An element with the '${selector}'-attribute must be a <details>-element`);
    }
    if (element.getAttribute(selector) == null) {
      PalmerDetails.destroy(element);
    } else {
      PalmerDetails.create(element);
    }
  }
}
var PalmerDetails = class {
  constructor(element) {
    __publicField(this, "callbacks");
    __publicField(this, "details");
    __publicField(this, "summary");
    var _a;
    this.details = element;
    this.summary = (_a = element.querySelector(":scope > summary")) != null ? _a : void 0;
    this.callbacks = {
      onKeydown: this.onKeydown.bind(this),
      onToggle: this.onToggle.bind(this)
    };
    this.details.addEventListener("toggle", this.callbacks.onToggle, eventOptions.passive);
  }
  onKeydown(event) {
    if (event.key !== "Escape" || !this.details.open) {
      return;
    }
    const children = [...this.details.querySelectorAll(`[${selector}][open]`)];
    if (children.some((child) => child.contains(document.activeElement)) || !this.details.contains(document.activeElement)) {
      return;
    }
    this.details.open = false;
    wait(() => {
      var _a;
      return (_a = this.summary) == null ? void 0 : _a.focus();
    }, 0);
  }
  onToggle() {
    var _a;
    (_a = document[this.details.open ? "addEventListener" : "removeEventListener"]) == null ? void 0 : _a.call(document, "keydown", this.callbacks.onKeydown, eventOptions.passive);
  }
  static create(element) {
    if (!store2.has(element)) {
      store2.set(element, new PalmerDetails(element));
    }
  }
  static destroy(element) {
    store2.delete(element);
  }
};
var observer = new MutationObserver(observe);
observer.observe(document, {
  attributeFilter: [selector],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const elements = Array.from(document.querySelectorAll(`[${selector}]`));
  for (const element of elements) {
    element.setAttribute(selector, "");
  }
}, 0);

// src/focus-trap.ts
var selector2 = "palmer-focus-trap";
var store3 = /* @__PURE__ */ new WeakMap();
function handleEvent(event, focusTrap, element) {
  var _a;
  const elements = getFocusableElements(focusTrap);
  if (element === focusTrap) {
    wait(() => {
      var _a2;
      ((_a2 = elements[event.shiftKey ? elements.length - 1 : 0]) != null ? _a2 : focusTrap).focus();
    }, 0);
    return;
  }
  const index3 = elements.indexOf(element);
  let target = focusTrap;
  if (index3 > -1) {
    let position = index3 + (event.shiftKey ? -1 : 1);
    if (position < 0) {
      position = elements.length - 1;
    } else if (position >= elements.length) {
      position = 0;
    }
    target = (_a = elements[position]) != null ? _a : focusTrap;
  }
  wait(() => {
    target.focus();
  }, 0);
}
function observe2(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(selector2) == null) {
      FocusTrap.destroy(element);
    } else {
      FocusTrap.create(element);
    }
  }
}
function onKeydown2(event) {
  if (event.key !== "Tab") {
    return;
  }
  const eventTarget = event.target;
  const focusTrap = findParent(eventTarget, `[${selector2}]`);
  if (focusTrap == null) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  handleEvent(event, focusTrap, eventTarget);
}
var FocusTrap = class {
  constructor(element) {
    __publicField(this, "tabIndex");
    this.tabIndex = element.tabIndex;
    element.tabIndex = -1;
  }
  static create(element) {
    if (!store3.has(element)) {
      store3.set(element, new FocusTrap(element));
    }
  }
  static destroy(element) {
    const focusTrap = store3.get(element);
    if (focusTrap == null) {
      return;
    }
    element.tabIndex = focusTrap.tabIndex;
    store3.delete(element);
  }
};
(() => {
  const context = globalThis;
  if (context.palmerFocusTrap != null) {
    return;
  }
  context.palmerFocusTrap = 1;
  const observer3 = new MutationObserver(observe2);
  observer3.observe(document, {
    attributeFilter: [selector2],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  });
  wait(() => {
    const elements = Array.from(document.querySelectorAll(`[${selector2}]`));
    for (const element of elements) {
      element.setAttribute(selector2, "");
    }
  }, 0);
  document.addEventListener("keydown", onKeydown2, eventOptions.active);
})();

// src/helpers/floated.ts
var allPositions = [
  "above",
  "above-left",
  "above-right",
  "any",
  "below",
  "below-left",
  "below-right",
  "horizontal",
  "horizontal-bottom",
  "horizontal-top",
  "left",
  "left-bottom",
  "left-top",
  "right",
  "right-bottom",
  "right-top",
  "vertical",
  "vertical-left",
  "vertical-right"
];
var domRectKeys = ["bottom", "height", "left", "right", "top", "width"];
var horizontalPositions = ["left", "horizontal", "right"];
var transformedPositions = ["above", "any", "below", "vertical", ...horizontalPositions];
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
  if (position !== "any") {
    const left2 = getLeft(rectangles, position, rightToLeft);
    const top2 = getTop(rectangles, position, preferAbove);
    return { top: top2, left: left2 };
  }
  const { anchor, floater } = rectangles;
  const left = getAbsolute(anchor.right, anchor.left, floater.width, innerWidth, rightToLeft);
  const top = getAbsolute(anchor.top, anchor.bottom, floater.height, innerHeight, preferAbove);
  return { left, top };
}
function getAbsolute(start, end, offset, max, preferMin) {
  const maxPosition = end + offset;
  const minPosition = start - offset;
  if (preferMin) {
    return minPosition < 0 ? maxPosition > max ? minPosition : end : minPosition;
  }
  return maxPosition > max ? minPosition < 0 ? end : minPosition : end;
}
function getActualPosition(original, rectangles, values) {
  if (!transformedPositions.includes(original)) {
    return original;
  }
  const { anchor, floater } = rectangles;
  const isHorizontal = horizontalPositions.includes(original);
  const prefix = isHorizontal ? values.left === anchor.right ? "right" : values.left === anchor.left - floater.width ? "left" : null : values.top === anchor.bottom ? "below" : values.top === anchor.top - floater.height ? "above" : null;
  const suffix = isHorizontal ? values.top === anchor.top ? "top" : values.top === anchor.bottom - floater.height ? "bottom" : null : values.left === anchor.left ? "left" : values.left === anchor.right - floater.width ? "right" : null;
  return [prefix, suffix].filter((value) => value != null).join("-");
}
function getLeft(rectangles, position, rightToLeft) {
  const { anchor, floater } = rectangles;
  switch (position) {
    case "above":
    case "below":
    case "vertical":
      return anchor.left + anchor.width / 2 - floater.width / 2;
    case "above-left":
    case "below-left":
    case "vertical-left":
      return anchor.left;
    case "above-right":
    case "below-right":
    case "vertical-right":
      return anchor.right - floater.width;
    case "horizontal":
    case "horizontal-bottom":
    case "horizontal-top": {
      return getAbsolute(anchor.left, anchor.right, floater.width, innerWidth, rightToLeft);
    }
    case "left":
    case "left-bottom":
    case "left-top":
      return anchor.left - floater.width;
    case "right":
    case "right-bottom":
    case "right-top":
      return anchor.right;
    default:
      return anchor.left;
  }
}
function getOriginalPosition(currentPosition, defaultPosition) {
  var _a;
  if (currentPosition == null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index3 = allPositions.indexOf(normalized);
  return index3 > -1 ? (_a = allPositions[index3]) != null ? _a : defaultPosition : defaultPosition;
}
function getTop(rectangles, position, preferAbove) {
  const { anchor, floater } = rectangles;
  switch (position) {
    case "above":
    case "above-left":
    case "above-right":
      return anchor.top - floater.height;
    case "horizontal":
    case "left":
    case "right":
      return anchor.top + anchor.height / 2 - floater.height / 2;
    case "below":
    case "below-left":
    case "below-right":
      return anchor.bottom;
    case "horizontal-bottom":
    case "left-bottom":
    case "right-bottom":
      return anchor.bottom - floater.height;
    case "horizontal-top":
    case "left-top":
    case "right-top":
      return anchor.top;
    case "vertical":
    case "vertical-left":
    case "vertical-right": {
      return getAbsolute(anchor.top, anchor.bottom, floater.height, innerHeight, preferAbove);
    }
    default:
      return anchor.bottom;
  }
}
function updateFloated(parameters) {
  const { anchor, floater, parent } = parameters.elements;
  const rightToLeft = getTextDirection(floater) === "rtl";
  let previousPosition;
  let previousRectangle;
  function afterRepeat() {
    anchor.insertAdjacentElement("afterend", floater);
  }
  function onRepeat() {
    var _a;
    const currentPosition = getOriginalPosition((_a = (parent != null ? parent : anchor).getAttribute(parameters.position.attribute)) != null ? _a : "", parameters.position.defaultValue);
    const currentRectangle = anchor.getBoundingClientRect();
    if (previousPosition === currentPosition && domRectKeys.every((key) => (previousRectangle == null ? void 0 : previousRectangle[key]) === currentRectangle[key])) {
      return;
    }
    previousPosition = currentPosition;
    previousRectangle = currentRectangle;
    const rectangles = {
      anchor: currentRectangle,
      floater: floater.getBoundingClientRect()
    };
    const values = calculatePosition(currentPosition, rectangles, rightToLeft, parameters.position.preferAbove);
    const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;
    if (floater.style.transform === matrix) {
      return;
    }
    floater.style.position = "fixed";
    floater.style.inset = "0 auto auto 0";
    floater.style.transform = matrix;
    floater.setAttribute("position", getActualPosition(currentPosition, rectangles, values));
  }
  document.body.appendChild(floater);
  floater.hidden = false;
  return repeat(onRepeat, 0, Infinity, afterRepeat);
}

// src/popover.ts
var selector3 = "palmer-popover";
var store4 = /* @__PURE__ */ new WeakMap();
var index = 0;
function afterToggle(component, active) {
  var _a, _b, _c;
  handleCallbacks(component, active);
  if (active && component.content) {
    ((_b = (_a = getFocusableElements(component.content)) == null ? void 0 : _a[0]) != null ? _b : component.content).focus();
  } else {
    (_c = component.button) == null ? void 0 : _c.focus();
  }
}
function handleCallbacks(component, add) {
  const callbacks = store4.get(component);
  if (callbacks == null) {
    return;
  }
  const method = add ? "addEventListener" : "removeEventListener";
  document[method]("click", callbacks.click, eventOptions.passive);
  document[method]("keydown", callbacks.keydown, eventOptions.passive);
}
function handleGlobalEvent(event, component, target) {
  const { button, content } = component;
  if (button == null || content == null) {
    return;
  }
  const floater = findParent(target, `[${selector3}-content]`);
  if (floater == null) {
    handleToggle(component, false);
    return;
  }
  event.stopPropagation();
  const children = Array.from(document.body.children);
  const difference = children.indexOf(floater) - children.indexOf(content);
  if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
    handleToggle(component, false);
  }
}
function handleToggle(component, expand) {
  var _a, _b;
  const expanded = typeof expand === "boolean" ? !expand : component.open;
  component.button.setAttribute("aria-expanded", !expanded);
  if (expanded) {
    component.content.hidden = true;
    (_a = component.timer) == null ? void 0 : _a.stop();
    afterToggle(component, false);
  } else {
    (_b = component.timer) == null ? void 0 : _b.stop();
    component.timer = updateFloated({
      elements: {
        anchor: component.button,
        floater: component.content,
        parent: component
      },
      position: {
        attribute: "position",
        defaultValue: "vertical",
        preferAbove: false
      }
    });
    wait(() => {
      afterToggle(component, true);
    }, 50);
  }
  component.dispatchEvent(new Event("toggle"));
}
function initialise(component, button, content) {
  content.hidden = true;
  if (isNullOrWhitespace(component.id)) {
    component.id = `palmer_popover_${++index}`;
  }
  if (isNullOrWhitespace(button.id)) {
    button.id = `${component.id}_button`;
  }
  if (isNullOrWhitespace(content.id)) {
    content.id = `${component.id}_content`;
  }
  button.setAttribute("aria-controls", content.id);
  button.ariaExpanded = "false";
  button.ariaHasPopup = "dialog";
  if (!(button instanceof HTMLButtonElement)) {
    button.tabIndex = 0;
  }
  content.setAttribute(selector2, "");
  content.role = "dialog";
  content.ariaModal = "false";
  store4.set(component, {
    click: onClick.bind(component),
    keydown: onKeydown3.bind(component)
  });
  button.addEventListener("click", toggle.bind(component), eventOptions.passive);
}
function isButton(node) {
  if (node == null) {
    return false;
  }
  if (node instanceof HTMLButtonElement) {
    return true;
  }
  return node instanceof HTMLElement && node.getAttribute("role") === "button";
}
function onClick(event) {
  if (this.open) {
    handleGlobalEvent(event, this, event.target);
  }
}
function onKeydown3(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function toggle(expand) {
  handleToggle(this, expand);
}
var PalmerPopover = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "button");
    __publicField(this, "content");
    __publicField(this, "timer");
    const button = this.querySelector(`:scope > [${selector3}-button]`);
    const content = this.querySelector(`:scope > [${selector3}-content]`);
    if (!isButton(button)) {
      throw new Error(`<${selector3}> must have a <button>-element (or button-like element) with the attribute '${selector3}-button`);
    }
    if (content == null || !(content instanceof HTMLElement)) {
      throw new Error(`<${selector3}> must have an element with the attribute '${selector3}-content'`);
    }
    this.button = button;
    this.content = content;
    initialise(this, button, content);
  }
  get open() {
    var _a;
    return ((_a = this.button) == null ? void 0 : _a.getAttribute("aria-expanded")) === "true";
  }
  set open(open) {
    toggle.call(this, open);
  }
  toggle() {
    if (this.button && this.content) {
      toggle.call(this);
    }
  }
};
customElements.define(selector3, PalmerPopover);

// src/splitter.ts
var selector4 = "palmer-splitter";
var splitterTypes = ["horizontal", "vertical"];
var store5 = /* @__PURE__ */ new WeakMap();
var index2 = 0;
function createSeparator(splitter, values) {
  var _a, _b;
  let actualValues = values != null ? values : store5.get(splitter);
  if (actualValues == null) {
    return null;
  }
  const separator = document.createElement("div");
  if (isNullOrWhitespace(splitter.primary.id)) {
    splitter.primary.id = `palmer_splitter_primary_panel_${++index2}`;
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
  const maximum = (_a = splitter.getAttribute("max")) != null ? _a : "";
  const minimum = (_b = splitter.getAttribute("min")) != null ? _b : "";
  if (maximum.length === 0) {
    setAbsoluteValue(splitter, separator, "maximum", 100);
  }
  if (minimum.length === 0) {
    setAbsoluteValue(splitter, separator, "minimum", 0);
  }
  setFlexValue(splitter, separator, actualValues.original, false);
  separator.addEventListener("keydown", (event) => onKeydown4(splitter, event), eventOptions.passive);
  return separator;
}
function onKeydown4(splitter, event) {
  if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Escape", "Home"].includes(event.key)) {
    return;
  }
  const ignored = splitter.type === "vertical" ? ["ArrowLeft", "ArrowRight"] : ["ArrowDown", "ArrowUp"];
  if (ignored.includes(event.key)) {
    return;
  }
  const values = store5.get(splitter);
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
  let actualValues = values != null ? values : store5.get(splitter);
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
  let actualValues = values != null ? values : store5.get(splitter);
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
  constructor() {
    var _a;
    super();
    __publicField(this, "primary");
    __publicField(this, "secondary");
    __publicField(this, "separator");
    if (this.children.length !== 2) {
      throw new Error(`A <${selector4}> must have exactly two direct children`);
    }
    const values = {
      current: -1,
      maximum: -1,
      minimum: -1,
      original: -1
    };
    store5.set(this, values);
    this.primary = this.children[0];
    this.secondary = this.children[1];
    this.separator = createSeparator(this, values);
    (_a = this.primary) == null ? void 0 : _a.insertAdjacentElement("afterend", this.separator);
  }
  get max() {
    var _a;
    return (_a = store5.get(this)) == null ? void 0 : _a.maximum;
  }
  set max(max) {
    setAbsoluteValue(this, this.separator, "maximum", max);
  }
  get min() {
    var _a;
    return (_a = store5.get(this)) == null ? void 0 : _a.minimum;
  }
  set min(min) {
    setAbsoluteValue(this, this.separator, "minimum", min);
  }
  get type() {
    var _a;
    const type = (_a = this.getAttribute("type")) != null ? _a : "horizontal";
    return splitterTypes.includes(type) ? type : "horizontal";
  }
  set type(type) {
    if (splitterTypes.includes(type)) {
      this.setAttribute("type", type);
    }
  }
  get value() {
    var _a;
    return (_a = store5.get(this)) == null ? void 0 : _a.current;
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
__publicField(PalmerSplitter, "observedAttributes", ["max", "min", "value"]);
customElements.define(selector4, PalmerSplitter);

// src/switch.ts
function getLabel(id, className, content) {
  const label = document.createElement("span");
  label.ariaHidden = true;
  label.className = `${className}__label`;
  label.id = `${id}_label`;
  label.innerHTML = content;
  return label;
}
function getStatus(className) {
  const status = document.createElement("span");
  status.ariaHidden = true;
  status.className = `${className}__status`;
  const indicator = document.createElement("span");
  indicator.className = `${className}__status__indicator`;
  status.appendChild(indicator);
  return status;
}
function getText(className, on, off) {
  const text = document.createElement("span");
  text.ariaHidden = true;
  text.className = `${className}__text`;
  text.appendChild(getTextItem("off", className, off));
  text.appendChild(getTextItem("on", className, on));
  return text;
}
function getTextItem(type, className, content) {
  const item = document.createElement("span");
  item.className = `${className}__text__${type}`;
  item.innerHTML = content;
  return item;
}
function initialise2(component, label, input) {
  var _a, _b, _c;
  (_a = label.parentElement) == null ? void 0 : _a.removeChild(label);
  (_b = input.parentElement) == null ? void 0 : _b.removeChild(input);
  component.setAttribute("aria-checked", input.checked || component.checked);
  component.setAttribute("aria-disabled", input.disabled || component.disabled);
  component.setAttribute("aria-labelledby", `${input.id}_label`);
  component.setAttribute("aria-readonly", input.readOnly || component.readonly);
  component.setAttribute("value", input.value);
  component.id = input.id;
  component.name = (_c = input.name) != null ? _c : input.id;
  component.role = "switch";
  component.tabIndex = 0;
  let className = component.getAttribute("classNames");
  let off = component.getAttribute("off");
  let on = component.getAttribute("on");
  if (isNullOrWhitespace(className)) {
    className = "palmer-switch";
  }
  if (isNullOrWhitespace(off)) {
    off = "Off";
  }
  if (isNullOrWhitespace(on)) {
    on = "On";
  }
  component.insertAdjacentElement("beforeend", getLabel(component.id, className, label.innerHTML));
  component.insertAdjacentElement("beforeend", getStatus(className));
  component.insertAdjacentElement("beforeend", getText(className, on, off));
  component.addEventListener("click", onToggle2.bind(component), eventOptions.passive);
  component.addEventListener("keydown", onKey.bind(component), eventOptions.active);
}
function onKey(event) {
  if (![" ", "Enter"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  toggle2(this);
}
function onToggle2() {
  toggle2(this);
}
function toggle2(component) {
  if (component.disabled || component.readonly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var PalmerSwitch = class extends HTMLElement {
  constructor() {
    var _a;
    super();
    __publicField(this, "internals");
    this.internals = (_a = this.attachInternals) == null ? void 0 : _a.call(this);
    const input = this.querySelector("[palmer-switch-input]");
    const label = this.querySelector("[palmer-switch-label]");
    if (typeof input === "undefined" || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new Error("<palmer-switch> must have an <input>-element with type 'checkbox' and the attribute 'palmer-switch-input'");
    }
    if (typeof label === "undefined" || !(label instanceof HTMLElement)) {
      throw new Error("<palmer-switch> must have an element with the attribute 'palmer-switch-label'");
    }
    initialise2(this, label, input);
  }
  get checked() {
    return this.getAttribute("aria-checked") === "true";
  }
  set checked(checked) {
    this.setAttribute("aria-checked", checked);
  }
  get disabled() {
    return this.getAttribute("aria-disabled") === "true";
  }
  set disabled(disabled) {
    this.setAttribute("aria-disabled", disabled);
  }
  get form() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.form) != null ? _b : void 0;
  }
  get labels() {
    var _a;
    return (_a = this.internals) == null ? void 0 : _a.labels;
  }
  get name() {
    var _a;
    return (_a = this.getAttribute("name")) != null ? _a : "";
  }
  set name(name) {
    this.setAttribute("name", name);
  }
  get readonly() {
    return this.getAttribute("aria-readonly") === "true";
  }
  set readonly(readonly) {
    this.setAttribute("aria-readonly", readonly);
  }
  get validationMessage() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.validationMessage) != null ? _b : "";
  }
  get validity() {
    var _a;
    return (_a = this.internals) == null ? void 0 : _a.validity;
  }
  get value() {
    var _a;
    return (_a = this.getAttribute("value")) != null ? _a : this.checked ? "on" : "off";
  }
  get willValidate() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.willValidate) != null ? _b : true;
  }
  checkValidity() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.checkValidity()) != null ? _b : true;
  }
  reportValidity() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.reportValidity()) != null ? _b : true;
  }
};
__publicField(PalmerSwitch, "formAssociated", true);
customElements.define("palmer-switch", PalmerSwitch);

// src/tooltip.ts
var selector5 = "palmer-tooltip";
var contentAttribute = `${selector5}-content`;
var positionAttribute = `${selector5}-position`;
var store6 = /* @__PURE__ */ new WeakMap();
function observe3(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(selector5) == null) {
      Tooltip.destroy(element);
    } else {
      Tooltip.create(element);
    }
  }
}
var Tooltip = class {
  constructor(anchor) {
    this.anchor = anchor;
    __publicField(this, "callbacks", {
      click: this.onClick.bind(this),
      hide: this.onHide.bind(this),
      keydown: this.onKeyDown.bind(this),
      show: this.onShow.bind(this)
    });
    __publicField(this, "floater");
    __publicField(this, "focusable");
    __publicField(this, "timer");
    this.focusable = anchor.matches(getFocusableSelector());
    this.floater = Tooltip.createFloater(anchor);
    this.handleCallbacks(true);
  }
  static create(anchor) {
    if (!store6.has(anchor)) {
      store6.set(anchor, new Tooltip(anchor));
    }
  }
  static destroy(element) {
    const tooltip = store6.get(element);
    if (typeof tooltip === "undefined") {
      return;
    }
    tooltip.handleCallbacks(false);
    store6.delete(element);
  }
  static createFloater(anchor) {
    var _a;
    const id = (_a = anchor.getAttribute("aria-describedby")) != null ? _a : anchor.getAttribute("aria-labelledby");
    const element = id == null ? null : document.getElementById(id);
    if (element == null) {
      throw new Error(`A '${selector5}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
    }
    element.hidden = true;
    element.setAttribute(contentAttribute, "");
    element.ariaHidden = "true";
    element.role = "tooltip";
    return element;
  }
  onClick(event) {
    if (findParent(event.target, (element) => [this.anchor, this.floater].includes(element)) == null) {
      this.toggle(false);
    }
  }
  onHide() {
    this.toggle(false);
  }
  onKeyDown(event) {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      this.toggle(false);
    }
  }
  onShow() {
    this.toggle(true);
  }
  toggle(show) {
    var _a, _b;
    const method = show ? "addEventListener" : "removeEventListener";
    document[method]("click", this.callbacks.click, eventOptions.passive);
    document[method]("keydown", this.callbacks.keydown, eventOptions.passive);
    if (show) {
      (_a = this.timer) == null ? void 0 : _a.stop();
      this.timer = updateFloated({
        elements: {
          anchor: this.anchor,
          floater: this.floater
        },
        position: {
          attribute: positionAttribute,
          defaultValue: "vertical",
          preferAbove: true
        }
      });
    } else {
      this.floater.hidden = true;
      (_b = this.timer) == null ? void 0 : _b.stop();
    }
  }
  handleCallbacks(add) {
    const { anchor, floater, focusable } = this;
    const method = add ? "addEventListener" : "removeEventListener";
    for (const element of [anchor, floater]) {
      element[method]("mouseenter", this.callbacks.show, eventOptions.passive);
      element[method]("mouseleave", this.callbacks.hide, eventOptions.passive);
      element[method]("touchstart", this.callbacks.show, eventOptions.passive);
    }
    if (focusable) {
      anchor[method]("blur", this.callbacks.hide, eventOptions.passive);
      anchor[method]("focus", this.callbacks.show, eventOptions.passive);
    }
  }
};
var observer2 = new MutationObserver(observe3);
observer2.observe(document, {
  attributeFilter: [selector5],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const elements = Array.from(document.querySelectorAll(`[${selector5}]`));
  for (const element of elements) {
    element.setAttribute(selector5, "");
  }
}, 0);
