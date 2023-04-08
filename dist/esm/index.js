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
function repeat(callback, time, count) {
  return new Repeated(callback, time, count).start();
}
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
function getAttribute(element, attribute4, defaultValue) {
  const value = element.getAttribute(attribute4);
  return value == null || value.trim().length === 0 ? defaultValue : value;
}
function getFocusableElements(context) {
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(focusableSelector));
  for (const element of elements) {
    const style = globalThis.getComputedStyle?.(element);
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
function setAttribute(element, attribute4, value) {
  if (value == null) {
    element.removeAttribute(attribute4);
  } else {
    element.setAttribute(attribute4, String(value));
  }
}
function setProperty(element, property, value) {
  element.setAttribute(property, String(typeof value === "boolean" ? value : false));
}

// src/details.ts
var attribute = "delicious-details";
var store = /* @__PURE__ */ new WeakMap();
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (!(element instanceof HTMLDetailsElement)) {
      throw new Error(`An element with the '${attribute}'-attribute must be a <details>-element`);
    }
    if (element.getAttribute(attribute) == null) {
      DeliciousDetails.destroy(element);
    } else {
      DeliciousDetails.create(element);
    }
  }
}
var DeliciousDetails = class {
  callbacks;
  details;
  summary;
  constructor(element) {
    this.details = element;
    this.summary = element.querySelector(":scope > summary") ?? void 0;
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
    const children = [...this.details.querySelectorAll(`[${attribute}][open]`)];
    if (children.some((child) => child.contains(document.activeElement)) || !this.details.contains(document.activeElement)) {
      return;
    }
    this.details.open = false;
    wait(() => this.summary?.focus(), 0);
  }
  onToggle() {
    document[this.details.open ? "addEventListener" : "removeEventListener"]?.("keydown", this.callbacks.onKeydown, eventOptions.passive);
  }
  static create(element) {
    if (!store.has(element)) {
      store.set(element, new DeliciousDetails(element));
    }
  }
  static destroy(element) {
    store.delete(element);
  }
};
var observer = new MutationObserver(observe);
observer.observe(document, {
  attributeFilter: [attribute],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const details = Array.from(document.querySelectorAll(`[${attribute}]`));
  for (const detail of details) {
    detail.setAttribute(attribute, "");
  }
}, 0);

// src/focus-trap.ts
var attribute2 = "formal-focus-trap";
var store2 = /* @__PURE__ */ new WeakMap();
function handle(event, focusTrap, element) {
  const elements = getFocusableElements(focusTrap);
  if (element === focusTrap) {
    wait(() => {
      (elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
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
    target = elements[position] ?? focusTrap;
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
    if (element.getAttribute(attribute2) == null) {
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
  const focusTrap = findParent(eventTarget, `[${attribute2}]`);
  if (focusTrap == null) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  handle(event, focusTrap, eventTarget);
}
var FocusTrap = class {
  tabIndex;
  constructor(element) {
    this.tabIndex = element.tabIndex;
    setAttribute(element, "tabindex", "-1");
  }
  static create(element) {
    if (!store2.has(element)) {
      store2.set(element, new FocusTrap(element));
    }
  }
  static destroy(element) {
    const focusTrap = store2.get(element);
    if (focusTrap == null) {
      return;
    }
    setAttribute(element, "tabindex", focusTrap.tabIndex);
    store2.delete(element);
  }
};
(() => {
  if (typeof globalThis._formalFocusTrap !== "undefined") {
    return;
  }
  globalThis._formalFocusTrap = null;
  const observer3 = new MutationObserver(observe2);
  observer3.observe(document, {
    attributeFilter: [attribute2],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  });
  wait(() => {
    const focusTraps = Array.from(document.querySelectorAll(`[${attribute2}]`));
    for (const focusTrap of focusTraps) {
      focusTrap.setAttribute(attribute2, "");
    }
  }, 0);
  document.addEventListener("keydown", onKeydown, eventOptions.active);
})();

// src/helpers/floated.ts
var positions = ["above", "above-left", "above-right", "below", "below-left", "below-right", "horizontal", "left", "right", "vertical"];
function getLeft(rectangles, position) {
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
function getTop(rectangles, position) {
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
function getPosition(currentPosition, defaultPosition) {
  if (currentPosition == null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index2 = positions.indexOf(normalized);
  return index2 > -1 ? positions[index2] ?? defaultPosition : defaultPosition;
}
function updateFloated(elements, position) {
  const { anchor, floater, parent } = elements;
  document.body.appendChild(floater);
  floater.hidden = false;
  return repeat(() => {
    if (floater.hidden) {
      anchor.insertAdjacentElement("afterend", floater);
      return;
    }
    const floatedPosition = getPosition((parent ?? anchor).getAttribute(position.attribute) ?? "", position.value);
    floater.setAttribute("position", floatedPosition);
    const rectangles = {
      anchor: anchor.getBoundingClientRect(),
      floater: floater.getBoundingClientRect()
    };
    const top = getTop(rectangles, floatedPosition);
    const left = getLeft(rectangles, floatedPosition);
    const matrix = `matrix(1, 0, 0, 1, ${left}, ${top})`;
    floater.style.position = "fixed";
    floater.style.inset = "0 auto auto 0";
    floater.style.transform = matrix;
  }, 0, Infinity);
}

// src/popover.ts
var clickCallbacks = /* @__PURE__ */ new WeakMap();
var keydownCallbacks = /* @__PURE__ */ new WeakMap();
var index = 0;
function afterToggle(popover, active) {
  handleCallbacks(popover, active);
  if (active && popover.content) {
    (getFocusableElements(popover.content)?.[0] ?? popover.content).focus();
  } else {
    popover.button?.focus();
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
    popover.timer?.stop();
    afterToggle(popover, false);
  } else {
    popover.timer?.stop();
    popover.timer = updateFloated({
      anchor: popover.button,
      floater: popover.content,
      parent: popover
    }, {
      attribute: "position",
      value: "below-left"
    });
    wait(() => {
      afterToggle(popover, true);
    }, 50);
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
  setAttribute(content, attribute2, "");
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
  button;
  content;
  timer;
  get open() {
    return this.button?.getAttribute("aria-expanded") === "true";
  }
  set open(open) {
    toggle.call(this, open);
  }
  constructor() {
    super();
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
  toggle() {
    if (this.button && this.content) {
      toggle.call(this);
    }
  }
};
globalThis.customElements.define("polite-popover", PolitePopover);

// src/switch.ts
function initialise2(component, label, input) {
  label.parentElement?.removeChild(label);
  input.parentElement?.removeChild(input);
  setProperty(component, "aria-checked", input.checked || component.checked);
  setProperty(component, "aria-disabled", input.disabled || component.disabled);
  setProperty(component, "aria-readonly", input.readOnly || component.readonly);
  component.setAttribute("aria-labelledby", `${input.id}_label`);
  component.setAttribute("id", input.id);
  component.setAttribute("name", input.name ?? input.id);
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
  if (component.disabled || component.readonly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var SwankySwitch = class extends HTMLElement {
  internals;
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
  get form() {
    return this.internals?.form ?? void 0;
  }
  get labels() {
    return this.internals?.labels;
  }
  get name() {
    return this.getAttribute("name") ?? "";
  }
  set name(name) {
    setAttribute(this, "name", name);
  }
  get readonly() {
    return this.getAttribute("aria-readonly") === "true";
  }
  set readonly(readonly) {
    setProperty(this, "aria-readonly", readonly);
  }
  get validationMessage() {
    return this.internals?.validationMessage ?? "";
  }
  get validity() {
    return this.internals?.validity;
  }
  get value() {
    return this.getAttribute("value") ?? this.checked ? "on" : "off";
  }
  get willValidate() {
    return this.internals?.willValidate ?? true;
  }
  constructor() {
    super();
    this.internals = this.attachInternals?.();
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
  checkValidity() {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity() {
    return this.internals?.reportValidity() ?? true;
  }
};
__publicField(SwankySwitch, "formAssociated", true);
globalThis.customElements.define("swanky-switch", SwankySwitch);

// src/tooltip.ts
var attribute3 = "toasty-tooltip";
var contentAttribute = `${attribute3}-content`;
var positionAttribute = `${attribute3}-position`;
var store3 = /* @__PURE__ */ new WeakMap();
function observe3(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(attribute3) == null) {
      Tooltip.destroy(element);
    } else {
      Tooltip.create(element);
    }
  }
}
var Tooltip = class {
  constructor(anchor) {
    this.anchor = anchor;
    this.focusable = anchor.matches(focusableSelector);
    this.floater = Tooltip.createFloater(anchor);
    this.handleCallbacks(true);
  }
  callbacks = {
    click: this.onClick.bind(this),
    hide: this.onHide.bind(this),
    keydown: this.onKeyDown.bind(this),
    show: this.onShow.bind(this)
  };
  floater;
  focusable;
  timer;
  static create(anchor) {
    if (!store3.has(anchor)) {
      store3.set(anchor, new Tooltip(anchor));
    }
  }
  static destroy(element) {
    const tooltip = store3.get(element);
    if (typeof tooltip === "undefined") {
      return;
    }
    tooltip.handleCallbacks(false);
    store3.delete(element);
  }
  static createFloater(anchor) {
    const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
    const element = id == null ? null : document.getElementById(id);
    if (element == null) {
      throw new Error(`A '${attribute3}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
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
      this.timer?.stop();
      this.timer = updateFloated(this, {
        attribute: positionAttribute,
        value: "above"
      });
    } else {
      this.floater.hidden = true;
      this.timer?.stop();
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
  attributeFilter: [attribute3],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const tooltips = Array.from(document.querySelectorAll(`[${attribute3}]`));
  for (const tooltip of tooltips) {
    tooltip.setAttribute(attribute3, "");
  }
}, 0);
