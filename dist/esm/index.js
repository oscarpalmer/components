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
function getFocusableElements(context) {
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(getFocusableSelector()));
  for (const element of elements) {
    const style = getComputedStyle?.(element);
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
    ].map((selector3) => `${selector3}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
  }
  return context.focusableSelector;
}
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function getTextDirection(element) {
  const { direction } = getComputedStyle?.(element);
  return direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/accordion.ts
var keys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
  if (document.activeElement?.tagName !== "SUMMARY" || !keys.includes(event.key)) {
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
  const summary = stored.elements[destination]?.querySelector(":scope > summary");
  if (summary != null) {
    summary.focus?.();
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
var AccurateAccordion = class extends HTMLElement {
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
    if (name === "multiple" && !this.multiple) {
      toggleDetails(this, store.get(this)?.elements.find((details) => details.open));
    }
  }
  connectedCallback() {
    store.get(this)?.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  disconnectedCallback() {
    store.get(this)?.observer.disconnect();
  }
};
__publicField(AccurateAccordion, "observedAttributes", ["max", "min", "value"]);
customElements.define("accurate-accordion", AccurateAccordion);

// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var request = requestAnimationFrame ?? function(callback) {
  return setTimeout?.(() => {
    callback(Date.now());
  }, milliseconds) ?? -1;
};
var Timed = class {
  callbacks;
  configuration;
  state = {
    active: false,
    finished: false
  };
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
  constructor(callback, time, count, afterCallback) {
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
      start ??= timestamp;
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
    this.state.active = false;
    if (typeof this.state.frame === "undefined") {
      return this;
    }
    (cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
    this.callbacks.after?.(this.finished);
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
var selector = "delicious-details";
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
    const children = [...this.details.querySelectorAll(`[${selector}][open]`)];
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
    if (!store2.has(element)) {
      store2.set(element, new DeliciousDetails(element));
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
var selector2 = "formal-focus-trap";
var store3 = /* @__PURE__ */ new WeakMap();
function handleEvent(event, focusTrap, element) {
  const elements = getFocusableElements(focusTrap);
  if (element === focusTrap) {
    wait(() => {
      (elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
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
  tabIndex;
  constructor(element) {
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
  if (context.formalFocusTrap != null) {
    return;
  }
  context.formalFocusTrap = 1;
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
  if (currentPosition == null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index3 = allPositions.indexOf(normalized);
  return index3 > -1 ? allPositions[index3] ?? defaultPosition : defaultPosition;
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
    const currentPosition = getOriginalPosition((parent ?? anchor).getAttribute(parameters.position.attribute) ?? "", parameters.position.defaultValue);
    const currentRectangle = anchor.getBoundingClientRect();
    if (previousPosition === currentPosition && domRectKeys.every((key) => previousRectangle?.[key] === currentRectangle[key])) {
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
var store4 = /* @__PURE__ */ new WeakMap();
var index = 0;
function afterToggle(component, active) {
  handleCallbacks(component, active);
  if (active && component.content) {
    (getFocusableElements(component.content)?.[0] ?? component.content).focus();
  } else {
    component.button?.focus();
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
  const expanded = typeof expand === "boolean" ? !expand : component.open;
  component.button.setAttribute("aria-expanded", !expanded);
  if (expanded) {
    component.content.hidden = true;
    component.timer?.stop();
    afterToggle(component, false);
  } else {
    component.timer?.stop();
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
  toggle() {
    if (this.button && this.content) {
      toggle.call(this);
    }
  }
};
customElements.define("polite-popover", PolitePopover);

// src/splitter.ts
var splitterTypes = ["horizontal", "vertical"];
var index2 = 0;
function createSeparator(splitter) {
  const separator = document.createElement("div");
  if (isNullOrWhitespace(splitter.primary.id)) {
    splitter.primary.id = `spiffy_splitter_primary_${++index2}`;
  }
  separator.setAttribute("aria-controls", splitter.primary.id);
  separator.role = "separator";
  separator.tabIndex = 0;
  let originalValue = splitter.getAttribute("value");
  if (isNullOrWhitespace(originalValue)) {
    originalValue = "50";
  }
  const originalNumber = getNumber(originalValue);
  splitter.values.original = typeof originalNumber === "number" ? originalNumber : 50;
  const maximum = splitter.getAttribute("max") ?? "";
  const minimum = splitter.getAttribute("min") ?? "";
  if (maximum.length === 0) {
    setAbsoluteValue(splitter, separator, "maximum", 100);
  }
  if (minimum.length === 0) {
    setAbsoluteValue(splitter, separator, "minimum", 0);
  }
  setFlexValue(splitter, separator, splitter.values.original, false);
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
  separator.setAttribute(key === "maximum" ? "aria-valuemax" : "aria-valuemin", actual);
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
  separator.ariaValueNow = actual;
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
  primary;
  secondary;
  separator;
  values = {
    current: -1,
    maximum: -1,
    minimum: -1,
    original: -1
  };
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
    const type = this.getAttribute("type") ?? "horizontal";
    return splitterTypes.includes(type) ? type : "horizontal";
  }
  set type(type) {
    if (splitterTypes.includes(type)) {
      this.setAttribute("type", type);
    }
  }
  get value() {
    return this.values.current;
  }
  set value(value) {
    setFlexValue(this, this.separator, value, true);
  }
  constructor() {
    super();
    if (this.children.length < 2) {
      throw new Error("A <spffy-splitter> must have at least two direct children");
    }
    this.primary = this.children[0];
    this.secondary = [...this.children].slice(1);
    this.separator = createSeparator(this);
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
__publicField(SpiffySplitter, "observedAttributes", ["max", "min", "value"]);
customElements.define("spiffy-splitter", SpiffySplitter);

// src/switch.ts
function getLabel(id, content) {
  const label = document.createElement("span");
  label.ariaHidden = true;
  label.className = "swanky-switch__label";
  label.id = `${id}_label`;
  label.innerHTML = content;
  return label;
}
function getStatus() {
  const status = document.createElement("span");
  status.ariaHidden = true;
  status.className = "swanky-switch__status";
  const indicator = document.createElement("span");
  indicator.className = "swanky-switch__status__indicator";
  status.appendChild(indicator);
  return status;
}
function getText(on, off) {
  const text = document.createElement("span");
  text.ariaHidden = true;
  text.className = "swanky-switch__text";
  text.appendChild(getTextItem("off", off));
  text.appendChild(getTextItem("on", on));
  return text;
}
function getTextItem(type, content) {
  const item = document.createElement("span");
  item.className = `swanky-switch__text__${type}`;
  item.innerHTML = content;
  return item;
}
function initialise2(component, label, input) {
  label.parentElement?.removeChild(label);
  input.parentElement?.removeChild(input);
  component.setAttribute("aria-checked", input.checked || component.checked);
  component.setAttribute("aria-disabled", input.disabled || component.disabled);
  component.setAttribute("aria-labelledby", `${input.id}_label`);
  component.setAttribute("aria-readonly", input.readOnly || component.readonly);
  component.setAttribute("value", input.value);
  component.id = input.id;
  component.name = input.name ?? input.id;
  component.role = "switch";
  component.tabIndex = 0;
  let off = component.getAttribute("swanky-switch-off");
  let on = component.getAttribute("swanky-switch-on");
  if (isNullOrWhitespace(off)) {
    off = "Off";
  }
  if (isNullOrWhitespace(on)) {
    on = "On";
  }
  component.insertAdjacentElement("beforeend", getLabel(component.id, label.innerHTML));
  component.insertAdjacentElement("beforeend", getStatus());
  component.insertAdjacentElement("beforeend", getText(on, off));
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
var SwankySwitch = class extends HTMLElement {
  internals;
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
    return this.internals?.form ?? void 0;
  }
  get labels() {
    return this.internals?.labels;
  }
  get name() {
    return this.getAttribute("name") ?? "";
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
    return this.internals?.validationMessage ?? "";
  }
  get validity() {
    return this.internals?.validity;
  }
  get value() {
    return this.getAttribute("value") ?? (this.checked ? "on" : "off");
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
customElements.define("swanky-switch", SwankySwitch);

// src/tooltip.ts
var attribute = "toasty-tooltip";
var contentAttribute = `${attribute}-content`;
var positionAttribute = `${attribute}-position`;
var store5 = /* @__PURE__ */ new WeakMap();
function observe3(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(attribute) == null) {
      Tooltip.destroy(element);
    } else {
      Tooltip.create(element);
    }
  }
}
var Tooltip = class {
  constructor(anchor) {
    this.anchor = anchor;
    this.focusable = anchor.matches(getFocusableSelector());
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
    if (!store5.has(anchor)) {
      store5.set(anchor, new Tooltip(anchor));
    }
  }
  static destroy(element) {
    const tooltip = store5.get(element);
    if (typeof tooltip === "undefined") {
      return;
    }
    tooltip.handleCallbacks(false);
    store5.delete(element);
  }
  static createFloater(anchor) {
    const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
    const element = id == null ? null : document.getElementById(id);
    if (element == null) {
      throw new Error(`A '${attribute}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
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
    const method = show ? "addEventListener" : "removeEventListener";
    document[method]("click", this.callbacks.click, eventOptions.passive);
    document[method]("keydown", this.callbacks.keydown, eventOptions.passive);
    if (show) {
      this.timer?.stop();
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
  attributeFilter: [attribute],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const elements = Array.from(document.querySelectorAll(`[${attribute}]`));
  for (const element of elements) {
    element.setAttribute(attribute, "");
  }
}, 0);
