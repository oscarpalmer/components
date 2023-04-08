"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var cancel = cancelAnimationFrame != null ? cancelAnimationFrame : function(id) {
  clearTimeout == null ? void 0 : clearTimeout(id);
};
var request = requestAnimationFrame != null ? requestAnimationFrame : function(callback) {
  var _a;
  return (_a = setTimeout == null ? void 0 : setTimeout(() => {
    callback(Date.now());
  }, milliseconds)) != null ? _a : -1;
};
var Timed = class {
  constructor(callback, time, count) {
    __publicField(this, "callback");
    __publicField(this, "count");
    __publicField(this, "frame");
    __publicField(this, "running", false);
    __publicField(this, "time");
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
    this.callback = callback;
    this.count = count;
    this.time = time;
  }
  /**
   * Is the timer active?
   */
  get active() {
    return this.running;
  }
  static run(timed) {
    timed.running = true;
    let count = 0;
    let start;
    function step(timestamp) {
      if (!timed.running) {
        return;
      }
      start != null ? start : start = timestamp;
      const elapsed = timestamp - start;
      const elapsedMinimum = elapsed - milliseconds;
      const elapsedMaximum = elapsed + milliseconds;
      if (elapsedMinimum < timed.time && timed.time < elapsedMaximum) {
        if (timed.running) {
          timed.callback(timed instanceof Repeated ? count : void 0);
        }
        count += 1;
        if (timed instanceof Repeated && count < timed.count) {
          start = void 0;
        } else {
          timed.stop();
          return;
        }
      }
      timed.frame = request(step);
    }
    timed.frame = request(step);
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
    if (this.running) {
      return this;
    }
    Timed.run(this);
    return this;
  }
  /**
   * Stop timer
   */
  stop() {
    this.running = false;
    if (typeof this.frame === "undefined") {
      return this;
    }
    cancel(this.frame);
    this.frame = void 0;
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
function wait(callback, time) {
  return new Waited(callback, time).start();
}

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
function defineProperty(obj, key, value) {
  Object.defineProperty(obj, key, {
    value,
    writable: false
  });
}
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
  var _a;
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(focusableSelector));
  for (const element of elements) {
    const style = (_a = globalThis.getComputedStyle) == null ? void 0 : _a.call(globalThis, element);
    if (style == null || style.display !== "none" && style.visibility !== "hidden") {
      focusable.push(element);
    }
  }
  return focusable;
}
function isNullOrWhitespace(value) {
  if (value == null) {
    return true;
  }
  return value.trim().length === 0;
}
function setAttribute(element, attribute2, value) {
  if (value == null) {
    element.removeAttribute(attribute2);
  } else {
    element.setAttribute(attribute2, String(value));
  }
}
function setProperty(element, property, value) {
  element.setAttribute(property, String(typeof value === "boolean" ? value : false));
}

// src/helpers/floated.ts
var positions = ["above", "above-left", "above-right", "below", "below-left", "below-right", "horizontal", "left", "right", "vertical"];
var Floated = class {
  static update(elements, position) {
    const { anchor, floater, parent } = elements;
    function update() {
      var _a;
      if (floater.hidden) {
        anchor.insertAdjacentElement("afterend", floater);
        return;
      }
      const floatedPosition = Floated.getPosition((_a = (parent != null ? parent : anchor).getAttribute(position.attribute)) != null ? _a : "", position.value);
      floater.setAttribute("position", floatedPosition);
      const rectangles = {
        anchor: anchor.getBoundingClientRect(),
        floater: floater.getBoundingClientRect()
      };
      const top = Floated.getTop(rectangles, floatedPosition);
      const left = Floated.getLeft(rectangles, floatedPosition);
      const matrix = `matrix(1, 0, 0, 1, ${left}, ${top})`;
      floater.style.position = "fixed";
      floater.style.inset = "0 auto auto 0";
      floater.style.transform = matrix;
      wait(update, 0);
    }
    document.body.appendChild(floater);
    floater.hidden = false;
    wait(update, 0);
  }
  static getLeft(rectangles, position) {
    const { left, right } = rectangles.anchor;
    const { width } = rectangles.floater;
    switch (position) {
      case "above":
      case "below":
      case "vertical":
        return left + rectangles.anchor.width / 2 - width / 2;
      case "above-left":
      case "below-left":
        return left;
      case "above-right":
      case "below-right":
        return right - width;
      case "horizontal":
        return right + width > globalThis.innerWidth ? left - width < 0 ? right : left - width : right;
      case "left":
        return left - width;
      case "right":
        return right;
      default:
        return 0;
    }
  }
  static getTop(rectangles, position) {
    const { bottom, top } = rectangles.anchor;
    const { height } = rectangles.floater;
    switch (position) {
      case "above":
      case "above-left":
      case "above-right":
        return top - height;
      case "below":
      case "below-left":
      case "below-right":
        return bottom;
      case "horizontal":
      case "left":
      case "right":
        return top + rectangles.anchor.height / 2 - height / 2;
      case "vertical":
        return bottom + height > globalThis.innerHeight ? top - height < 0 ? bottom : top - height : bottom;
      default:
        return 0;
    }
  }
  static getPosition(currentPosition, defaultPosition) {
    var _a;
    if (currentPosition == null) {
      return defaultPosition;
    }
    const normalized = currentPosition.trim().toLowerCase();
    const index2 = positions.indexOf(normalized);
    return index2 > -1 ? (_a = positions[index2]) != null ? _a : defaultPosition : defaultPosition;
  }
};

// src/focus-trap.ts
var attribute = "formal-focus-trap";
var store = /* @__PURE__ */ new WeakMap();
function handle(event, focusTrap, element) {
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
    if (element.getAttribute(attribute) == null) {
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
  const focusTrap = findParent(eventTarget, `[${attribute}]`);
  if (focusTrap == null) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  handle(event, focusTrap, eventTarget);
}
var FocusTrap = class {
  constructor(element) {
    __publicField(this, "tabIndex");
    this.tabIndex = element.tabIndex;
    setAttribute(element, "tabindex", "-1");
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
    setAttribute(element, "tabindex", focusTrap.tabIndex);
    store.delete(element);
  }
};
(() => {
  if (typeof globalThis._formalFocusTrap !== "undefined") {
    return;
  }
  globalThis._formalFocusTrap = null;
  const observer = new MutationObserver(observe);
  observer.observe(document, {
    attributeFilter: [attribute],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  });
  wait(() => {
    const focusTraps = Array.from(document.querySelectorAll(`[${attribute}]`));
    for (const focusTrap of focusTraps) {
      focusTrap.setAttribute(attribute, "");
    }
  }, 0);
  document.addEventListener("keydown", onKeydown, eventOptions.active);
})();

// src/popover.ts
var clickCallbacks = /* @__PURE__ */ new WeakMap();
var keydownCallbacks = /* @__PURE__ */ new WeakMap();
var index = 0;
function afterToggle(popover, active) {
  var _a, _b, _c;
  handleCallbacks(popover, active);
  if (active && popover.content) {
    ((_b = (_a = getFocusableElements(popover.content)) == null ? void 0 : _a[0]) != null ? _b : popover.content).focus();
  } else {
    (_c = popover.button) == null ? void 0 : _c.focus();
  }
}
function handleCallbacks(popover, add) {
  const clickCallback = clickCallbacks.get(popover);
  const keydownCallback = keydownCallbacks.get(popover);
  if (clickCallback == null || keydownCallback == null) {
    return;
  }
  const method = add ? "addEventListener" : "removeEventListener";
  document[method]("click", clickCallback, eventOptions.passive);
  document[method]("keydown", keydownCallback, eventOptions.passive);
}
function handleGlobalEvent(event, popover, target) {
  const { button, content } = popover;
  if (button == null || content == null) {
    return;
  }
  const floater = findParent(target, "[polite-popover-content]");
  if (floater == null) {
    handleToggle(popover, false);
    return;
  }
  event.stopPropagation();
  const children = Array.from(document.body.children);
  const difference = children.indexOf(floater) - children.indexOf(content);
  if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
    handleToggle(popover, false);
  }
}
function handleToggle(popover, expand) {
  const expanded = typeof expand === "boolean" ? !expand : popover.open;
  setProperty(popover.button, "aria-expanded", !expanded);
  if (expanded) {
    popover.content.hidden = true;
    afterToggle(popover, false);
  } else {
    Floated.update({
      anchor: popover.button,
      floater: popover.content,
      parent: popover
    }, {
      attribute: "position",
      value: "below-left"
    });
    wait(() => {
      afterToggle(popover, true);
    }, 0);
  }
  popover.dispatchEvent(new Event("toggle"));
}
function initialise(popover, button, content) {
  content.hidden = true;
  if (isNullOrWhitespace(popover.id)) {
    setAttribute(popover, "id", `polite_popover_${++index}`);
  }
  if (isNullOrWhitespace(button.id)) {
    setAttribute(button, "id", `${popover.id}_button`);
  }
  if (isNullOrWhitespace(content.id)) {
    setAttribute(content, "id", `${popover.id}_content`);
  }
  setAttribute(button, "aria-controls", content.id);
  setProperty(button, "aria-expanded", false);
  setAttribute(button, "aria-haspopup", "dialog");
  if (!(button instanceof HTMLButtonElement)) {
    setAttribute(button, "tabindex", "0");
  }
  setAttribute(content, attribute, "");
  setAttribute(content, "role", "dialog");
  setAttribute(content, "aria-modal", "false");
  clickCallbacks.set(popover, onClick.bind(popover));
  keydownCallbacks.set(popover, onKeydown2.bind(popover));
  button.addEventListener("click", toggle.bind(popover), eventOptions.passive);
}
function onClick(event) {
  if (this instanceof PolitePopover && this.open) {
    handleGlobalEvent(event, this, event.target);
  }
}
function onKeydown2(event) {
  if (this instanceof PolitePopover && this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function toggle(expand) {
  if (this instanceof PolitePopover) {
    handleToggle(this, expand);
  }
}
var PolitePopover = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "button");
    __publicField(this, "content");
    const button = this.querySelector(":scope > [polite-popover-button]");
    const content = this.querySelector(":scope > [polite-popover-content]");
    if (button == null || !(button instanceof HTMLButtonElement || button instanceof HTMLElement && button.getAttribute("role") === "button")) {
      throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");
    }
    if (content == null || !(content instanceof HTMLElement)) {
      throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");
    }
    defineProperty(this, "button", button);
    defineProperty(this, "content", content);
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
globalThis.customElements.define("polite-popover", PolitePopover);
