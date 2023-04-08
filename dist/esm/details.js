var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var cancel = cancelAnimationFrame ?? function(id) {
  clearTimeout?.(id);
};
var request = requestAnimationFrame ?? function(callback) {
  return setTimeout?.(() => {
    callback(Date.now());
  }, milliseconds) ?? -1;
};
var Timed = class {
  callback;
  count;
  frame;
  running = false;
  time;
  /**
   * Is the timer active?
   */
  get active() {
    return this.running;
  }
  constructor(callback, time, count) {
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
  static run(timed) {
    timed.running = true;
    let count = 0;
    let start;
    function step(timestamp) {
      if (!timed.running) {
        return;
      }
      start ??= timestamp;
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
function findParent(element, match) {
  const matchIsSelector = typeof match === "string";
  if (matchIsSelector ? element.matches(match) : match(element)) {
    return element;
  }
  let parent = element?.parentElement;
  while (parent != null) {
    if (parent === document.body) {
      return;
    }
    if (matchIsSelector ? parent.matches(match) : match(parent)) {
      break;
    }
    parent = parent.parentElement;
  }
  return parent ?? void 0;
}
function getAttribute(element, attribute, defaultValue) {
  const value = element.getAttribute(attribute);
  return value == null || value.trim().length === 0 ? defaultValue : value;
}
function setAttribute(element, attribute, value) {
  if (value == null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, String(value));
  }
}

// src/details.ts
var Manager = class {
  static destroyList(component) {
    const { children, observer, open } = Store.list;
    children.delete(component);
    open.delete(component);
    observer.get(component)?.disconnect();
    observer.delete(component);
  }
  static getChildren(component) {
    return Array.from(component.querySelectorAll(":scope > delicious-details > details, :scope > details"));
  }
  static initializeList(component) {
    const { children, observer, open } = Store.list;
    children.set(component, Manager.getChildren(component));
    open.set(component, []);
    observer.set(component, new MutationObserver((records) => {
      Observer.callback(component, records);
    }));
    observer.get(component)?.observe(component, Observer.options);
    Manager.open(component, getAttribute(component, "open", ""));
  }
  static onGlobalKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }
    const { containers } = Store.details;
    const parent = findParent(document.activeElement, (element) => containers.has(element) && (containers.get(element)?.open ?? true));
    if (parent instanceof DeliciousDetails) {
      Manager.onToggle.call(parent, false);
    }
  }
  static onLocalKeydown(event) {
    if (event.isComposing || event.key !== "ArrowDown" && event.key !== "ArrowUp" || !(this instanceof DeliciousDetailsList)) {
      return;
    }
    const { target } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const children = Store.list.children.get(this) ?? [];
    const parent = target.parentElement;
    const index = children.indexOf(parent);
    if (index === -1) {
      return;
    }
    let position = index + (event.key === "ArrowDown" ? 1 : -1);
    if (position < 0) {
      position = children.length - 1;
    } else if (position >= children.length) {
      position = 0;
    }
    const details = children[position];
    const summary = details?.querySelector(":scope > summary");
    summary?.focus();
  }
  static onToggle(open) {
    if (!(this instanceof DeliciousDetails)) {
      return;
    }
    const { buttons, containers } = Store.details;
    const container = containers.get(this);
    if (container == null) {
      return;
    }
    container.open = open ?? !container.open;
    if (!container.open) {
      buttons.get(this)?.focus();
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
    const parts = value.length > 0 ? value.split(",").filter((index) => index.trim().length > 0).map((index) => Number.parseInt(index, 10)) : [];
    Manager.update(component, parts);
  }
  static update(component, selection) {
    if (typeof selection === "undefined") {
      return;
    }
    const { children, observer, open } = Store.list;
    let sorted = selection.filter((value, index, array) => array.indexOf(value) === index).sort((first, second) => first - second);
    if (!component.multiple) {
      sorted = sorted.length > 0 && sorted[0] != null ? sorted.length > 1 ? [sorted[0]] : sorted : [];
    }
    const current = component.open;
    if (sorted.length === current.length && sorted.every((value, index) => current[index] === value)) {
      return;
    }
    observer.get(component)?.disconnect();
    const elements = children.get(component) ?? [];
    for (const element of elements) {
      if (sorted.includes(elements.indexOf(element)) !== element.open) {
        element.open = !element.open;
      }
    }
    wait(() => {
      open.set(component, sorted);
      setAttribute(component, "open", sorted.length === 0 ? null : sorted);
      component.dispatchEvent(new Event("toggle"));
      wait(() => observer.get(component)?.observe(component, Observer.options), 0);
    }, 0);
  }
};
var Observer = class {
  static callback(component, records) {
    if (records.length === 0) {
      return;
    }
    const { children } = Store.list;
    const record = records[0];
    const added = Array.from(record?.addedNodes ?? []);
    const removed = Array.from(record?.removedNodes ?? []);
    if (added.concat(removed).some((element2) => element2.parentElement === component)) {
      children.set(component, Manager.getChildren(component));
      return;
    }
    if (record?.type !== "attributes" || !(record?.target instanceof HTMLDetailsElement)) {
      return;
    }
    const element = record.target;
    const elements = children.get(component) ?? [];
    const index = elements.indexOf(element);
    if (index === -1) {
      return;
    }
    let selection = [];
    if (component.multiple) {
      selection = element.open ? component.open.concat([index]) : component.open.filter((v) => v !== index);
    } else {
      selection = element.open ? [index] : [];
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
    return Store.details.containers.get(this)?.open ?? false;
  }
  set open(open) {
    Manager.onToggle.call(this, open);
  }
  connectedCallback() {
    const details = this.querySelector(":scope > details");
    const summary = details?.querySelector(":scope > summary");
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
    return Store.list.open.get(this) ?? [];
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
