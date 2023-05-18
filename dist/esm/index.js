var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/helpers/index.js
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
function isTouchScreen() {
  if (typeof globalThis.oscarpalmer_components_isTouchScreen === "boolean") {
    return globalThis.oscarpalmer_components_isTouchScreen;
  }
  let isTouchScreen2 = false;
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (typeof media?.matches === "boolean") {
        isTouchScreen2 = media.matches;
      }
    }
    if (!isTouchScreen2) {
      isTouchScreen2 = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints ?? 0) > 0;
    }
  } catch {
    isTouchScreen2 = false;
  }
  globalThis.oscarpalmer_components_isTouchScreen = isTouchScreen2;
  return isTouchScreen2;
}
function findParent(element, match) {
  const matchIsSelector = typeof match === "string";
  if (matchIsSelector ? element.matches(match) : match(element)) {
    return element;
  }
  let parent = element?.parentElement;
  while (parent !== null) {
    if (parent === document.body) {
      return void 0;
    }
    if (matchIsSelector ? parent.matches(match) : match(parent)) {
      break;
    }
    parent = parent.parentElement;
  }
  return parent ?? void 0;
}
function getCoordinates(event) {
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  const x = event.touches[0]?.clientX;
  const y = event.touches[0]?.clientY;
  return x === null || y === null ? void 0 : { x, y };
}
function getFocusableElements(context) {
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(getFocusableSelector()));
  for (const element of elements) {
    const style = getComputedStyle?.(element);
    if (style === null || style.display !== "none" && style.visibility !== "hidden") {
      focusable.push(element);
    }
  }
  return focusable;
}
function getFocusableSelector() {
  if (globalThis.oscapalmer_components_focusableSelector === null) {
    globalThis.oscapalmer_components_focusableSelector = [
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
    ].map(
      (selector6) => `${selector6}:not([disabled]):not([hidden]):not([tabindex="-1"])`
    ).join(",");
  }
  return globalThis.oscapalmer_components_focusableSelector;
}
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function getTextDirection(element) {
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/accordion.js
var keys = /* @__PURE__ */ new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home"
]);
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
  if (document.activeElement?.tagName !== "SUMMARY" || !keys.has(event.key)) {
    return;
  }
  const stored = store.get(component);
  if ((stored?.elements?.length ?? 0) === 0) {
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
    case "ArrowRight": {
      destination = current + 1;
      break;
    }
    case "ArrowLeft":
    case "ArrowUp": {
      destination = current - 1;
      break;
    }
    case "End": {
      destination = stored.elements.length - 1;
      break;
    }
    case "Home": {
      destination = 0;
      break;
    }
    default: {
      return;
    }
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
  summary?.focus?.();
}
function onToggle(component, element) {
  if (element.open && !component.multiple) {
    toggleDetails(component, element);
  }
}
function setDetails(component) {
  const stored = store.get(component);
  if (stored === void 0) {
    return;
  }
  stored.elements = [...component.querySelectorAll(":scope > details")];
  for (const element of stored.elements) {
    element.addEventListener("toggle", () => onToggle(component, element));
  }
}
function toggleDetails(component, active) {
  const stored = store.get(component);
  if (stored === void 0) {
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
    this.addEventListener(
      "keydown",
      (event) => onKeydown(this, event),
      eventOptions.active
    );
    if (!this.multiple) {
      toggleDetails(
        this,
        stored.elements.find((details) => details.open)
      );
    }
  }
  attributeChangedCallback(name) {
    if (name === "multiple" && !this.multiple) {
      toggleDetails(
        this,
        store.get(this)?.elements.find((details) => details.open)
      );
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
__publicField(PalmerAccordion, "observedAttributes", ["max", "min", "value"]);
customElements.define("palmer-accordion", PalmerAccordion);

// node_modules/@oscarpalmer/timer/dist/timer.js
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => {
  __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var milliseconds = Math.round(1e3 / 60);
var request = globalThis.requestAnimationFrame ?? function(callback) {
  return setTimeout?.(() => {
    callback(Date.now());
  }, milliseconds);
};
function run(timed) {
  timed.state.active = true;
  timed.state.finished = false;
  const isRepeated = timed instanceof Repeated;
  let index3 = 0;
  let start;
  function step(timestamp) {
    if (!timed.state.active) {
      return;
    }
    start ?? (start = timestamp);
    const elapsed = timestamp - start;
    const elapsedMinimum = elapsed - milliseconds;
    const elapsedMaximum = elapsed + milliseconds;
    if (elapsedMinimum < timed.configuration.time && timed.configuration.time < elapsedMaximum) {
      if (timed.state.active) {
        timed.callbacks.default(isRepeated ? index3 : void 0);
      }
      index3 += 1;
      if (isRepeated && index3 < timed.configuration.count) {
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
var Timed = class {
  /**
   * @param {RepeatedCallback} callback
   * @param {number} time
   * @param {number} count
   * @param {AfterCallback|undefined} afterCallback
   */
  constructor(callback, time, count, afterCallback) {
    __publicField2(this, "callbacks");
    __publicField2(this, "configuration");
    __publicField2(this, "state");
    const isRepeated = this instanceof Repeated;
    const type = isRepeated ? "repeated" : "waited";
    if (typeof callback !== "function") {
      throw new TypeError(`A ${type} timer must have a callback function`);
    }
    if (typeof time !== "number" || time < 0) {
      throw new TypeError(
        `A ${type} timer must have a non-negative number as its time`
      );
    }
    if (isRepeated && (typeof count !== "number" || count < 2)) {
      throw new TypeError(
        "A repeated timer must have a number above 1 as its repeat count"
      );
    }
    if (isRepeated && afterCallback !== void 0 && typeof afterCallback !== "function") {
      throw new TypeError(
        "A repeated timer's after-callback must be a function"
      );
    }
    this.configuration = { count, time };
    this.callbacks = {
      after: afterCallback,
      default: callback
    };
    this.state = {
      active: false,
      finished: false,
      frame: null
    };
  }
  /** */
  get active() {
    return this.state.active;
  }
  get finished() {
    return !this.active && this.state.finished;
  }
  restart() {
    this.stop();
    run(this);
    return this;
  }
  start() {
    if (!this.state.active) {
      run(this);
    }
    return this;
  }
  stop() {
    this.state.active = false;
    if (this.state.frame === void 0) {
      return this;
    }
    (globalThis.cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
    this.callbacks.after?.(this.finished);
    this.state.frame = void 0;
    return this;
  }
};
var Repeated = class extends Timed {
};
var Waited = class extends Timed {
  /**
   * @param {Function} callback
   * @param {number} time
   */
  constructor(callback, time) {
    super(callback, time, 1, null);
  }
};
function wait(callback, time) {
  return new Waited(callback, time).start();
}

// src/details.js
var selector = "palmer-details";
var store2 = /* @__PURE__ */ new WeakMap();
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (!(record.target instanceof HTMLDetailsElement)) {
      throw new TypeError(
        `An element with the '${selector}'-attribute must be a <details>-element`
      );
    }
    if (record.target.getAttribute(selector) === void 0) {
      PalmerDetails.destroy(record.target);
    } else {
      PalmerDetails.create(record.target);
    }
  }
}
var PalmerDetails = class {
  constructor(element) {
    /**
     * @readonly
     * @type {{onKeydown: (event: KeyboardEvent) => void; onToggle: () => void}}
     */
    __publicField(this, "callbacks");
    /**
     * @readonly
     * @type {HTMLDetailsElement}
     */
    __publicField(this, "details");
    /**
     * @readonly
     * @type {HTMLElement?}
     */
    __publicField(this, "summary");
    this.details = element;
    this.summary = element.querySelector(":scope > summary") ?? void 0;
    this.callbacks = {
      onKeydown: this.onKeydown.bind(this),
      onToggle: this.onToggle.bind(this)
    };
    this.details.addEventListener(
      "toggle",
      this.callbacks.onToggle,
      eventOptions.passive
    );
  }
  onKeydown(event) {
    if (event.key !== "Escape" || !this.details.open) {
      return;
    }
    const children = [...this.details.querySelectorAll(`[${selector}][open]`)];
    if (children.some((child) => child.contains(globalThis.document.activeElement)) || !this.details.contains(globalThis.document.activeElement)) {
      return;
    }
    this.details.open = false;
    wait(() => this.summary?.focus(), 0);
  }
  onToggle() {
    globalThis.document[this.details.open ? "addEventListener" : "removeEventListener"]?.("keydown", this.callbacks.onKeydown, eventOptions.passive);
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
observer.observe(globalThis.document, {
  attributeFilter: [selector],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const elements = Array.from(
    globalThis.document.querySelectorAll(`[${selector}]`)
  );
  for (const element of elements) {
    element.setAttribute(selector, "");
  }
}, 0);

// src/focus-trap.js
var selector2 = "palmer-focus-trap";
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
    if (record.target.getAttribute(selector2) === void 0) {
      FocusTrap.destroy(record.target);
    } else {
      FocusTrap.create(record.target);
    }
  }
}
function onKeydown2(event) {
  if (event.key !== "Tab") {
    return;
  }
  const focusTrap = findParent(event.target, `[${selector2}]`);
  if (focusTrap === void 0) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  handleEvent(event, focusTrap, event.target);
}
var FocusTrap = class {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    /**
     * @readonly
     * @type {number}
     */
    __publicField(this, "tabIndex");
    this.tabIndex = element.tabIndex;
    element.tabIndex = -1;
  }
  /**
   * @param {HTMLElement} element
   */
  static create(element) {
    if (!store3.has(element)) {
      store3.set(element, new FocusTrap(element));
    }
  }
  /**
   * @param {HTMLElement} element
   */
  static destroy(element) {
    const focusTrap = store3.get(element);
    if (focusTrap === void 0) {
      return;
    }
    element.tabIndex = focusTrap.tabIndex;
    store3.delete(element);
  }
};
(() => {
  if (globalThis.oscarpalmer_components_focusTrap !== null) {
    return;
  }
  globalThis.oscarpalmer_components_focusTrap = 1;
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

// src/helpers/floated.js
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
var horizontalPositions = /* @__PURE__ */ new Set(["left", "horizontal", "right"]);
var transformedPositions = /* @__PURE__ */ new Set([
  "above",
  "any",
  "below",
  "vertical",
  ...Array.from(horizontalPositions.values)
]);
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
  if (position !== "any") {
    const left2 = getLeft(rectangles, position, rightToLeft);
    const top2 = getTop(rectangles, position, preferAbove);
    return { top: top2, left: left2 };
  }
  const { anchor, floater } = rectangles;
  const left = getAbsolute(
    anchor.right,
    anchor.left,
    floater.width,
    innerWidth,
    rightToLeft
  );
  const top = getAbsolute(
    anchor.top,
    anchor.bottom,
    floater.height,
    innerHeight,
    preferAbove
  );
  return { left, top };
}
function getAbsolute(parameters) {
  const maxPosition = parameters.end + parameters.offset;
  const minPosition = parameters.start - parameters.offset;
  if (parameters.preferMin) {
    return minPosition < 0 ? maxPosition > parameters.max ? minPosition : parameters.end : minPosition;
  }
  return maxPosition > parameters.max ? minPosition < 0 ? parameters.end : minPosition : parameters.end;
}
function getActualPosition(original, rectangles, values) {
  if (!transformedPositions.has(original)) {
    return original;
  }
  const isHorizontal = horizontalPositions.has(original);
  return [
    getPrefix(rectangles, values, isHorizontal),
    getSuffix(rectangles, values, isHorizontal)
  ].filter((value) => value !== void 0).join("-");
}
function getLeft(rectangles, position, rightToLeft) {
  const { anchor, floater } = rectangles;
  switch (position) {
    case "above":
    case "below":
    case "vertical": {
      return anchor.left + anchor.width / 2 - floater.width / 2;
    }
    case "above-left":
    case "below-left":
    case "vertical-left": {
      return anchor.left;
    }
    case "above-right":
    case "below-right":
    case "vertical-right": {
      return anchor.right - floater.width;
    }
    case "horizontal":
    case "horizontal-bottom":
    case "horizontal-top": {
      return getAbsolute(
        anchor.left,
        anchor.right,
        floater.width,
        innerWidth,
        rightToLeft
      );
    }
    case "left":
    case "left-bottom":
    case "left-top": {
      return anchor.left - floater.width;
    }
    case "right":
    case "right-bottom":
    case "right-top": {
      return anchor.right;
    }
    default: {
      return anchor.left;
    }
  }
}
function getOriginalPosition(currentPosition, defaultPosition) {
  if (currentPosition === null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index3 = allPositions.indexOf(normalized);
  return index3 > -1 ? allPositions[index3] ?? defaultPosition : defaultPosition;
}
function getPrefix(rectangles, values, isHorizontal) {
  if (isHorizontal) {
    if (values.left === rectangles.anchor.right) {
      return "right";
    }
    return values.left === rectangles.anchor.left - rectangles.floater.width ? "left" : void 0;
  }
  if (values.top === rectangles.anchor.bottom) {
    return "below";
  }
  return values.top === rectangles.anchor.top - rectangles.floater.height ? "above" : void 0;
}
function getSuffix(rectangles, values, isHorizontal) {
  if (isHorizontal) {
    if (values.top === rectangles.anchor.top) {
      return "top";
    }
    return values.top === rectangles.anchor.bottom - rectangles.floater.height ? "bottom" : void 0;
  }
  if (values.left === rectangles.anchor.left) {
    return "left";
  }
  return values.left === rectangles.anchor.right - rectangles.floater.width ? "right" : void 0;
}
function getTop(rectangles, position, preferAbove) {
  const { anchor, floater } = rectangles;
  switch (position) {
    case "above":
    case "above-left":
    case "above-right": {
      return anchor.top - floater.height;
    }
    case "horizontal":
    case "left":
    case "right": {
      return anchor.top + anchor.height / 2 - floater.height / 2;
    }
    case "below":
    case "below-left":
    case "below-right": {
      return anchor.bottom;
    }
    case "horizontal-bottom":
    case "left-bottom":
    case "right-bottom": {
      return anchor.bottom - floater.height;
    }
    case "horizontal-top":
    case "left-top":
    case "right-top": {
      return anchor.top;
    }
    case "vertical":
    case "vertical-left":
    case "vertical-right": {
      return getAbsolute(
        anchor.top,
        anchor.bottom,
        floater.height,
        innerHeight,
        preferAbove
      );
    }
    default: {
      return anchor.bottom;
    }
  }
}
function updateFloated(parameters) {
  const { anchor, floater, parent } = parameters.elements;
  const rightToLeft = getTextDirection(floater) === "rtl";
  let previousPosition;
  let previousRectangle;
  function afterRepeat() {
    anchor.after("afterend", floater);
  }
  function onRepeat() {
    const currentPosition = getOriginalPosition(
      (parent ?? anchor).getAttribute(parameters.position.attribute) ?? "",
      parameters.position.defaultValue
    );
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
    const values = calculatePosition(
      currentPosition,
      rectangles,
      rightToLeft,
      parameters.position.preferAbove
    );
    const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;
    if (floater.style.transform === matrix) {
      return;
    }
    floater.style.position = "fixed";
    floater.style.inset = "0 auto auto 0";
    floater.style.transform = matrix;
    floater.setAttribute(
      "position",
      getActualPosition(currentPosition, rectangles, values)
    );
  }
  document.body.append(floater);
  floater.hidden = false;
  return new Repeated(
    onRepeat,
    0,
    Number.POSITIVE_INFINITY,
    afterRepeat
  ).start();
}

// src/popover.js
var selector3 = "palmer-popover";
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
  if (callbacks === void 0) {
    return;
  }
  const method = add ? "addEventListener" : "removeEventListener";
  document[method]("click", callbacks.click, eventOptions.passive);
  document[method]("keydown", callbacks.keydown, eventOptions.passive);
}
function handleGlobalEvent(event, component, target) {
  const { button, content } = component;
  if (button === void 0 || content === void 0) {
    return;
  }
  const floater = findParent(target, `[${selector3}-content]`);
  if (floater === void 0) {
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
  button.addEventListener(
    "click",
    toggle.bind(component),
    eventOptions.passive
  );
}
function isButton(node) {
  if (node === null) {
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
    /**
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "button");
    /**
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "content");
    /**
     * @private
     * @type {import('@oscarpalmer/timer').Repeated|undefined}
     */
    __publicField(this, "timer");
    const button = this.querySelector(`:scope > [${selector3}-button]`);
    const content = this.querySelector(`:scope > [${selector3}-content]`);
    if (!isButton(button)) {
      throw new Error(
        `<${selector3}> must have a <button>-element (or button-like element) with the attribute '${selector3}-button`
      );
    }
    if (content === null || !(content instanceof HTMLElement)) {
      throw new Error(
        `<${selector3}> must have an element with the attribute '${selector3}-content'`
      );
    }
    this.button = button;
    this.content = content;
    initialise(this, button, content);
  }
  get open() {
    return this.button?.getAttribute("aria-expanded") === "true";
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

// src/splitter.js
var pointerBeginEvent = isTouchScreen() ? "touchstart" : "mousedown";
var pointerEndEvent = isTouchScreen() ? "touchend" : "mouseup";
var pointerMoveEvent = isTouchScreen() ? "touchmove" : "mousemove";
var selector4 = "palmer-splitter";
var splitterTypes = /* @__PURE__ */ new Set(["horizontal", "vertical"]);
var store5 = /* @__PURE__ */ new WeakMap();
var index2 = 0;
function createHandle(component, className) {
  const handle = document.createElement("span");
  handle.className = `${className}__separator__handle`;
  handle.ariaHidden = "true";
  handle.textContent = component.type === "horizontal" ? "\u2195" : "\u2194";
  handle.addEventListener(pointerBeginEvent, () => onPointerBegin(component));
  return handle;
}
function createSeparator(component, values, className) {
  const actualValues = values ?? store5.get(component)?.values;
  if (actualValues === void 0) {
    return void 0;
  }
  const separator = document.createElement("div");
  if (isNullOrWhitespace(component.primary.id)) {
    component.primary.id = `palmer_splitter_primary_panel_${++index2}`;
  }
  separator.className = `${className}__separator`;
  separator.role = "separator";
  separator.tabIndex = 0;
  separator.setAttribute("aria-controls", component.primary.id);
  separator.setAttribute("aria-valuemax", "100");
  separator.setAttribute("aria-valuemin", "0");
  separator.setAttribute("aria-valuenow", "50");
  const original = component.getAttribute("value");
  if (isNullOrWhitespace(original)) {
    setFlexValue(component, separator, 50);
  }
  separator.append(component.handle);
  separator.addEventListener(
    "keydown",
    (event) => onSeparatorKeydown(component, event),
    eventOptions.passive
  );
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
  if (coordinates === void 0) {
    return;
  }
  const componentRectangle = this.getBoundingClientRect();
  const value = this.type === "horizontal" ? (coordinates.y - componentRectangle.top) / componentRectangle.height : (coordinates.x - componentRectangle.left) / componentRectangle.width;
  setFlexValue(this, this.separator, value * 100);
}
function onSeparatorKeydown(component, event) {
  if (![
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "End",
    "Escape",
    "Home"
  ].includes(event.key)) {
    return;
  }
  const ignored = component.type === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowDown", "ArrowUp"];
  if (ignored.includes(event.key)) {
    return;
  }
  const { values } = store5.get(component);
  if (values === void 0) {
    return;
  }
  let value;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp": {
      value = Math.round(component.value + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1));
      break;
    }
    case "End":
    case "Home": {
      value = event.key === "End" ? values.maximum : values.minimum;
      break;
    }
    case "Escape": {
      value = values.initial ?? values.original;
      values.initial = void 0;
      break;
    }
    default: {
      break;
    }
  }
  setFlexValue(component, component.separator, value, values);
}
function setAbsoluteValue(component, parameters) {
  const { key, separator, setFlex } = parameters;
  const values = parameters.values ?? store5.get(component)?.values;
  let value = getNumber(parameters.value);
  if (values === void 0 || Number.isNaN(value) || value === values[key] || key === "maximum" && value < values.minimum || key === "minimum" && value > values.maximum) {
    return;
  }
  if (key === "maximum" && value > 100) {
    value = 100;
  } else if (key === "minimum" && value < 0) {
    value = 0;
  }
  values[parameters.key] = value;
  separator.setAttribute(
    key === "maximum" ? "aria-valuemax" : "aria-valuemin",
    value
  );
  if (setFlex && (key === "maximum" && value < values.current || key === "minimum" && value > values.current)) {
    setFlexValue(component, separator, value, values);
  }
}
function setDragging(component, active) {
  const stored = store5.get(component);
  if (stored === void 0) {
    return;
  }
  if (active) {
    stored.values.initial = Number(stored.values.current);
  }
  const method = active ? "addEventListener" : "removeEventListener";
  document[method]("keydown", stored.callbacks.keydown, eventOptions.passive);
  document[method](
    pointerEndEvent,
    stored.callbacks.pointerEnd,
    eventOptions.passive
  );
  document[method](
    pointerMoveEvent,
    stored.callbacks.pointerMove,
    eventOptions.passive
  );
  stored.dragging = active;
}
function setFlexValue(component, parameters) {
  const { separator } = parameters;
  const values = parameters.values ?? store5.get(component)?.values;
  let value = getNumber(parameters.value);
  if (values === void 0 || Number.isNaN(value) || value === values.current) {
    return;
  }
  if (value < values.minimum) {
    value = values.minimum;
  } else if (value > values.maximum) {
    value = values.maximum;
  }
  if (parameters.setOriginal ?? false) {
    values.original = value;
  }
  separator.ariaValueNow = value;
  component.primary.style.flex = `${value / 100}`;
  component.secondary.style.flex = `${(100 - value) / 100}`;
  values.current = value;
  component.dispatchEvent(new CustomEvent("change", { detail: { value } }));
}
var PalmerSplitter = class extends HTMLElement {
  constructor() {
    super();
    /**
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "handle");
    /**
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "primary");
    /**
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "secondary");
    /**
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "separator");
    if (this.children.length !== 2) {
      throw new Error(`A <${selector4}> must have exactly two direct children`);
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
    store5.set(this, stored);
    this.primary = this.children[0];
    this.secondary = this.children[1];
    let className = this.getAttribute("className");
    if (isNullOrWhitespace(className)) {
      className = selector4;
    }
    this.handle = createHandle(this, className);
    this.separator = createSeparator(this, stored.values, className);
    this.primary?.insertAdjacentElement("afterend", this.separator);
  }
  get max() {
    return store5.get(this)?.values.maximum;
  }
  set max(max) {
    this.setAttribute("max", max);
  }
  get min() {
    return store5.get(this)?.values.minimum;
  }
  set min(min) {
    this.setAttribute("min", min);
  }
  get type() {
    const type = this.getAttribute("type") ?? "vertical";
    return splitterTypes.has(type) ? type : "vertical";
  }
  set type(type) {
    this.setAttribute("type", type);
  }
  get value() {
    return store5.get(this)?.values.current;
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  attributeChangedCallback(name, _, value) {
    switch (name) {
      case "max":
      case "min": {
        setAbsoluteValue(this, {
          key: name === "max" ? "maximum" : "minimum",
          separator: this.separator,
          setFlex: true,
          value
        });
        break;
      }
      case "value": {
        setFlexValue(this, {
          separator: this.separator,
          setOriginal: true,
          value
        });
        break;
      }
      default: {
        break;
      }
    }
  }
};
__publicField(PalmerSplitter, "observedAttributes", ["max", "min", "value"]);
customElements.define(selector4, PalmerSplitter);

// src/switch.js
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
  status.append(indicator);
  return status;
}
function getText(className, on, off) {
  const text = document.createElement("span");
  text.ariaHidden = true;
  text.className = `${className}__text`;
  text.append(getTextItem("off", className, off));
  text.append(getTextItem("on", className, on));
  return text;
}
function getTextItem(type, className, content) {
  const item = document.createElement("span");
  item.className = `${className}__text__${type}`;
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
  component.insertAdjacentElement(
    "beforeend",
    getLabel(component.id, className, label.innerHTML)
  );
  component.insertAdjacentElement("beforeend", getStatus(className));
  component.insertAdjacentElement("beforeend", getText(className, on, off));
  component.addEventListener(
    "click",
    onToggle2.bind(component),
    eventOptions.passive
  );
  component.addEventListener(
    "keydown",
    onKey.bind(component),
    eventOptions.active
  );
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
    super();
    /**
     * @private
     * @type {ElementInternals|undefined}
     */
    __publicField(this, "internals");
    this.internals = this.attachInternals?.();
    const input = this.querySelector("[palmer-switch-input]");
    const label = this.querySelector("[palmer-switch-label]");
    if (input === null || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new TypeError(
        "<palmer-switch> must have an <input>-element with type 'checkbox' and the attribute 'palmer-switch-input'"
      );
    }
    if (label === null || !(label instanceof HTMLElement)) {
      throw new TypeError(
        "<palmer-switch> must have an element with the attribute 'palmer-switch-label'"
      );
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
    return this.internals?.form;
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
  checkValidity() {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity() {
    return this.internals?.reportValidity() ?? true;
  }
};
__publicField(PalmerSwitch, "formAssociated", true);
customElements.define("palmer-switch", PalmerSwitch);

// src/tooltip.js
var selector5 = "palmer-tooltip";
var contentAttribute = `${selector5}-content`;
var positionAttribute = `${selector5}-position`;
var store6 = /* @__PURE__ */ new WeakMap();
function observe3(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector5) === null) {
      PalmerTooltip.destroy(record.target);
    } else {
      PalmerTooltip.create(record.target);
    }
  }
}
var PalmerTooltip = class {
  /**
   * @constructor
   * @param {HTMLElement} anchor
   */
  constructor(anchor) {
    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "anchor");
    /**
     * @private
     * @readonly
     * @type {Callbacks}
     */
    __publicField(this, "callbacks", {
      click: this.onClick.bind(this),
      hide: this.onHide.bind(this),
      keydown: this.onKeyDown.bind(this),
      show: this.onShow.bind(this)
    });
    /**
     * @private
     * @readonly
     * @type {HTMLElement}
     */
    __publicField(this, "floater");
    /**
     * @private
     * @readonly
     * @type {boolean}
     */
    __publicField(this, "focusable");
    /**
     * @private
     */
    __publicField(this, "timer");
    this.anchor = anchor;
    this.focusable = anchor.matches(getFocusableSelector());
    this.floater = PalmerTooltip.createFloater(anchor);
    this.handleCallbacks(true);
  }
  /**
   * @param {HTMLElement} anchor
   */
  static create(anchor) {
    if (!store6.has(anchor)) {
      store6.set(anchor, new PalmerTooltip(anchor));
    }
  }
  /**
   * @param {HTMLElement} element
   */
  static destroy(anchor) {
    const tooltip = store6.get(anchor);
    if (tooltip === void 0) {
      return;
    }
    tooltip.handleCallbacks(false);
    store6.delete(anchor);
  }
  /**
   * @private
   * @param {HTMLElement} anchor
   * @returns {HTMLElement}
   */
  static createFloater(anchor) {
    const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
    const element = id === null ? null : document.querySelector(`#${id}`);
    if (element === null) {
      throw new TypeError(
        `A '${selector5}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`
      );
    }
    element.hidden = true;
    element.setAttribute(contentAttribute, "");
    element.ariaHidden = "true";
    element.role = "tooltip";
    return element;
  }
  /**
   * @param {Event} event
   */
  onClick(event) {
    if (findParent(
      event.target,
      (element) => [this.anchor, this.floater].includes(element)
    ) === void 0) {
      this.toggle(false);
    }
  }
  onHide() {
    this.toggle(false);
  }
  /**
   * @param {Event} event
   */
  onKeyDown(event) {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      this.toggle(false);
    }
  }
  onShow() {
    this.toggle(true);
  }
  /**
   * @param {boolean} show
   */
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
  /**
   * @private
   * @param {boolean} add
   */
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
