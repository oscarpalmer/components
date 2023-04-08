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
function getAttribute(element, attribute3, defaultValue) {
  const value = element.getAttribute(attribute3);
  return value == null || value.trim().length === 0 ? defaultValue : value;
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
function setAttribute(element, attribute3, value) {
  if (value == null) {
    element.removeAttribute(attribute3);
  } else {
    element.setAttribute(attribute3, String(value));
  }
}
function setProperty(element, property, value) {
  element.setAttribute(property, String(typeof value === "boolean" ? value : false));
}

// src/details.ts
var Manager = class {
  static destroyList(component) {
    var _a;
    const { children, observer: observer2, open } = Store.list;
    children.delete(component);
    open.delete(component);
    (_a = observer2.get(component)) == null ? void 0 : _a.disconnect();
    observer2.delete(component);
  }
  static getChildren(component) {
    return Array.from(component.querySelectorAll(":scope > delicious-details > details, :scope > details"));
  }
  static initializeList(component) {
    var _a;
    const { children, observer: observer2, open } = Store.list;
    children.set(component, Manager.getChildren(component));
    open.set(component, []);
    observer2.set(component, new MutationObserver((records) => {
      Observer.callback(component, records);
    }));
    (_a = observer2.get(component)) == null ? void 0 : _a.observe(component, Observer.options);
    Manager.open(component, getAttribute(component, "open", ""));
  }
  static onGlobalKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }
    const { containers } = Store.details;
    const parent = findParent(document.activeElement, (element) => {
      var _a, _b;
      return containers.has(element) && ((_b = (_a = containers.get(element)) == null ? void 0 : _a.open) != null ? _b : true);
    });
    if (parent instanceof DeliciousDetails) {
      Manager.onToggle.call(parent, false);
    }
  }
  static onLocalKeydown(event) {
    var _a;
    if (event.isComposing || event.key !== "ArrowDown" && event.key !== "ArrowUp" || !(this instanceof DeliciousDetailsList)) {
      return;
    }
    const { target } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const children = (_a = Store.list.children.get(this)) != null ? _a : [];
    const parent = target.parentElement;
    const index2 = children.indexOf(parent);
    if (index2 === -1) {
      return;
    }
    let position = index2 + (event.key === "ArrowDown" ? 1 : -1);
    if (position < 0) {
      position = children.length - 1;
    } else if (position >= children.length) {
      position = 0;
    }
    const details = children[position];
    const summary = details == null ? void 0 : details.querySelector(":scope > summary");
    summary == null ? void 0 : summary.focus();
  }
  static onToggle(open) {
    var _a;
    if (!(this instanceof DeliciousDetails)) {
      return;
    }
    const { buttons, containers } = Store.details;
    const container = containers.get(this);
    if (container == null) {
      return;
    }
    container.open = open != null ? open : !container.open;
    if (!container.open) {
      (_a = buttons.get(this)) == null ? void 0 : _a.focus();
    }
  }
  static open(component, value) {
    if (value == null) {
      Manager.update(component, []);
      return;
    }
    if (value.length > 0 && !/^[\s\d,]+$/.test(value)) {
      throw new Error("The 'selected'-attribute of a 'delicious-details-list'-element must be a comma-separated string of numbers, e.g. '', '0' or '0,1,2'");
    }
    const parts = value.length > 0 ? value.split(",").filter((index2) => index2.trim().length > 0).map((index2) => Number.parseInt(index2, 10)) : [];
    Manager.update(component, parts);
  }
  static update(component, selection) {
    var _a, _b;
    if (typeof selection === "undefined") {
      return;
    }
    const { children, observer: observer2, open } = Store.list;
    let sorted = selection.filter((value, index2, array) => array.indexOf(value) === index2).sort((first, second) => first - second);
    if (!component.multiple) {
      sorted = sorted.length > 0 && sorted[0] != null ? sorted.length > 1 ? [sorted[0]] : sorted : [];
    }
    const current = component.open;
    if (sorted.length === current.length && sorted.every((value, index2) => current[index2] === value)) {
      return;
    }
    (_a = observer2.get(component)) == null ? void 0 : _a.disconnect();
    const elements = (_b = children.get(component)) != null ? _b : [];
    for (const element of elements) {
      if (sorted.includes(elements.indexOf(element)) !== element.open) {
        element.open = !element.open;
      }
    }
    wait(() => {
      open.set(component, sorted);
      setAttribute(component, "open", sorted.length === 0 ? null : sorted);
      component.dispatchEvent(new Event("toggle"));
      wait(() => {
        var _a2;
        return (_a2 = observer2.get(component)) == null ? void 0 : _a2.observe(component, Observer.options);
      }, 0);
    }, 0);
  }
};
var Observer = class {
  static callback(component, records) {
    var _a, _b, _c;
    if (records.length === 0) {
      return;
    }
    const { children } = Store.list;
    const record = records[0];
    const added = Array.from((_a = record == null ? void 0 : record.addedNodes) != null ? _a : []);
    const removed = Array.from((_b = record == null ? void 0 : record.removedNodes) != null ? _b : []);
    if (added.concat(removed).some((element2) => element2.parentElement === component)) {
      children.set(component, Manager.getChildren(component));
      return;
    }
    if ((record == null ? void 0 : record.type) !== "attributes" || !((record == null ? void 0 : record.target) instanceof HTMLDetailsElement)) {
      return;
    }
    const element = record.target;
    const elements = (_c = children.get(component)) != null ? _c : [];
    const index2 = elements.indexOf(element);
    if (index2 === -1) {
      return;
    }
    let selection = [];
    if (component.multiple) {
      selection = element.open ? component.open.concat([index2]) : component.open.filter((v) => v !== index2);
    } else {
      selection = element.open ? [index2] : [];
    }
    Manager.update(component, selection);
  }
};
__publicField(Observer, "options", {
  attributeFilter: ["open"],
  attributes: true,
  childList: true,
  subtree: true
});
var Store = class {
};
__publicField(Store, "details", {
  buttons: /* @__PURE__ */ new WeakMap(),
  containers: /* @__PURE__ */ new WeakMap()
});
__publicField(Store, "list", {
  children: /* @__PURE__ */ new WeakMap(),
  observer: /* @__PURE__ */ new WeakMap(),
  open: /* @__PURE__ */ new WeakMap()
});
var DeliciousDetails = class extends HTMLElement {
  get open() {
    var _a, _b;
    return (_b = (_a = Store.details.containers.get(this)) == null ? void 0 : _a.open) != null ? _b : false;
  }
  set open(open) {
    Manager.onToggle.call(this, open);
  }
  connectedCallback() {
    const details = this.querySelector(":scope > details");
    const summary = details == null ? void 0 : details.querySelector(":scope > summary");
    Store.details.buttons.set(this, summary);
    Store.details.containers.set(this, details);
  }
  disconnectedCallback() {
    Store.details.buttons.delete(this);
    Store.details.containers.delete(this);
  }
  toggle() {
    Manager.onToggle.call(this);
  }
};
var DeliciousDetailsList = class extends HTMLElement {
  static get observedAttributes() {
    return ["multiple", "open"];
  }
  get multiple() {
    return this.getAttribute("multiple") != null;
  }
  set multiple(multiple) {
    setAttribute(this, "multiple", multiple ? "" : null);
  }
  get open() {
    var _a;
    return (_a = Store.list.open.get(this)) != null ? _a : [];
  }
  set open(indices) {
    Manager.update(this, indices);
  }
  constructor() {
    super();
    this.addEventListener("keydown", Manager.onLocalKeydown.bind(this), eventOptions.passive);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "multiple":
        Manager.open(this, getAttribute(this, "open", ""));
        break;
      case "open":
        Manager.open(this, newValue);
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    Manager.initializeList(this);
  }
  disconnectedCallback() {
    Manager.destroyList(this);
  }
};
globalThis.addEventListener("keydown", Manager.onGlobalKeydown, eventOptions.passive);
globalThis.customElements.define("delicious-details", DeliciousDetails);
globalThis.customElements.define("delicious-details-list", DeliciousDetailsList);

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
  const observer2 = new MutationObserver(observe);
  observer2.observe(document, {
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

// src/switch.ts
function initialise2(component, label, input) {
  var _a, _b, _c;
  (_a = label.parentElement) == null ? void 0 : _a.removeChild(label);
  (_b = input.parentElement) == null ? void 0 : _b.removeChild(input);
  setProperty(component, "aria-checked", input.checked || component.checked);
  setProperty(component, "aria-disabled", input.disabled || component.disabled);
  setProperty(component, "aria-readonly", input.readOnly || component.readOnly);
  component.setAttribute("aria-labelledby", `${input.id}_label`);
  component.setAttribute("id", input.id);
  component.setAttribute("name", (_c = input.name) != null ? _c : input.id);
  component.setAttribute("role", "switch");
  component.setAttribute("tabindex", "0");
  component.setAttribute("value", input.value);
  const off = getAttribute(component, "swanky-switch-off", "Off");
  const on = getAttribute(component, "swanky-switch-on", "On");
  component.insertAdjacentHTML("afterbegin", render(input.id, label, off, on));
  component.addEventListener("click", onToggle.bind(component), eventOptions.passive);
  component.addEventListener("keydown", onKey.bind(component), eventOptions.passive);
}
function onKey(event) {
  if ((event.key === " " || event.key === "Enter") && this instanceof SwankySwitch) {
    toggle2(this);
  }
}
function onToggle() {
  if (this instanceof SwankySwitch) {
    toggle2(this);
  }
}
function render(id, label, off, on) {
  return `<swanky-switch-label id="${id}_label">${label.innerHTML}</swanky-switch-label>
<swanky-switch-status aria-hidden="true">
	<swanky-switch-status-indicator></swanky-switch-status-indicator>
</swanky-switch-status>
<swanky-switch-text aria-hidden="true">
	<swanky-switch-text-off>${off}</swanky-switch-text-off>
	<swanky-switch-text-on>${on}</swanky-switch-text-on>
</swanky-switch-text>`;
}
function toggle2(component) {
  if (component.disabled || component.readOnly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var SwankySwitch = class extends HTMLElement {
  get checked() {
    return this.getAttribute("aria-checked") === "true";
  }
  set checked(checked) {
    setProperty(this, "aria-checked", checked);
  }
  get disabled() {
    return this.getAttribute("aria-disabled") === "true";
  }
  set disabled(disabled) {
    setProperty(this, "aria-disabled", disabled);
  }
  get readOnly() {
    return this.getAttribute("aria-readonly") === "true";
  }
  set readOnly(readonly) {
    setProperty(this, "aria-readonly", readonly);
  }
  get value() {
    return this.checked ? "on" : "off";
  }
  constructor() {
    super();
    const input = this.querySelector("[swanky-switch-input]");
    const label = this.querySelector("[swanky-switch-label]");
    if (typeof input === "undefined" || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");
    }
    if (typeof label === "undefined" || !(label instanceof HTMLElement)) {
      throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");
    }
    initialise2(this, label, input);
  }
};
globalThis.customElements.define("swanky-switch", SwankySwitch);

// src/tooltip.ts
var attribute2 = "toasty-tooltip";
var contentAttribute = `${attribute2}-content`;
var positionAttribute = `${attribute2}-position`;
var store2 = /* @__PURE__ */ new WeakMap();
function observe2(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(attribute2) == null) {
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
    this.focusable = anchor.matches(focusableSelector);
    this.floater = Tooltip.createFloater(anchor);
    this.handleCallbacks(true);
  }
  static create(anchor) {
    if (!store2.has(anchor)) {
      store2.set(anchor, new Tooltip(anchor));
    }
  }
  static destroy(element) {
    const tooltip = store2.get(element);
    if (typeof tooltip === "undefined") {
      return;
    }
    tooltip.handleCallbacks(false);
    store2.delete(element);
  }
  static createFloater(anchor) {
    var _a;
    const id = (_a = anchor.getAttribute("aria-describedby")) != null ? _a : anchor.getAttribute("aria-labelledby");
    const element = id == null ? null : document.getElementById(id);
    if (element == null) {
      throw new Error(`A '${attribute2}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
    }
    element.hidden = true;
    setAttribute(element, contentAttribute, "");
    setAttribute(element, "role", "tooltip");
    setProperty(element, "aria-hidden", true);
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
    const method = show ? "addEventListener" : "removeEventListener";
    document[method]("click", this.callbacks.click, eventOptions.passive);
    document[method]("keydown", this.callbacks.keydown, eventOptions.passive);
    if (show) {
      Floated.update(this, {
        attribute: positionAttribute,
        value: "above"
      });
    } else {
      this.floater.hidden = true;
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
var observer = new MutationObserver(observe2);
observer.observe(document, {
  attributeFilter: [attribute2],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const tooltips = Array.from(document.querySelectorAll(`[${attribute2}]`));
  for (const tooltip of tooltips) {
    tooltip.setAttribute(attribute2, "");
  }
}, 0);
