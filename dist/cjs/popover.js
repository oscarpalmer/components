"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
    ].map((selector2) => `${selector2}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
  }
  return context.focusableSelector;
}
function getTextDirection(element) {
  const { direction } = getComputedStyle == null ? void 0 : getComputedStyle(element);
  return direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value != null ? value : "").trim().length === 0;
}

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
  const index2 = allPositions.indexOf(normalized);
  return index2 > -1 ? (_a = allPositions[index2]) != null ? _a : defaultPosition : defaultPosition;
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

// src/focus-trap.ts
var selector = "formal-focus-trap";
var store = /* @__PURE__ */ new WeakMap();
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
  const index2 = elements.indexOf(element);
  let target = focusTrap;
  if (index2 > -1) {
    let position = index2 + (event.shiftKey ? -1 : 1);
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
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(selector) == null) {
      FocusTrap.destroy(element);
    } else {
      FocusTrap.create(element);
    }
  }
}
function onKeydown(event) {
  if (event.key !== "Tab") {
    return;
  }
  const eventTarget = event.target;
  const focusTrap = findParent(eventTarget, `[${selector}]`);
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
    if (!store.has(element)) {
      store.set(element, new FocusTrap(element));
    }
  }
  static destroy(element) {
    const focusTrap = store.get(element);
    if (focusTrap == null) {
      return;
    }
    element.tabIndex = focusTrap.tabIndex;
    store.delete(element);
  }
};
(() => {
  const context = globalThis;
  if (context.formalFocusTrap != null) {
    return;
  }
  context.formalFocusTrap = 1;
  const observer = new MutationObserver(observe);
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
  document.addEventListener("keydown", onKeydown, eventOptions.active);
})();

// src/popover.ts
var store2 = /* @__PURE__ */ new WeakMap();
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
  const callbacks = store2.get(component);
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
  const floater = findParent(target, "[polite-popover-content]");
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
    component.id = `polite_popover_${++index}`;
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
  content.setAttribute(selector, "");
  content.role = "dialog";
  content.ariaModal = "false";
  store2.set(component, {
    click: onClick.bind(component),
    keydown: onKeydown2.bind(component)
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
function onKeydown2(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function toggle(expand) {
  handleToggle(this, expand);
}
var PolitePopover = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "button");
    __publicField(this, "content");
    __publicField(this, "timer");
    const button = this.querySelector(":scope > [polite-popover-button]");
    const content = this.querySelector(":scope > [polite-popover-content]");
    if (!isButton(button)) {
      throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");
    }
    if (content == null || !(content instanceof HTMLElement)) {
      throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");
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
customElements.define("polite-popover", PolitePopover);
