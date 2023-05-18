var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
  let index = 0;
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
        timed.callbacks.default(isRepeated ? index : void 0);
      }
      index += 1;
      if (isRepeated && index < timed.configuration.count) {
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

// src/helpers/index.js
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
    ].map((selector2) => `${selector2}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
  }
  return globalThis.oscapalmer_components_focusableSelector;
}
function getTextDirection(element) {
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}

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
var transformedPositions = /* @__PURE__ */ new Set(["above", "any", "below", "vertical", ...Array.from(horizontalPositions.values)]);
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
  return [getPrefix(rectangles, values, isHorizontal), getSuffix(rectangles, values, isHorizontal)].filter((value) => value !== void 0).join("-");
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
      return getAbsolute(anchor.left, anchor.right, floater.width, innerWidth, rightToLeft);
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
  const index = allPositions.indexOf(normalized);
  return index > -1 ? allPositions[index] ?? defaultPosition : defaultPosition;
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
      return getAbsolute(anchor.top, anchor.bottom, floater.height, innerHeight, preferAbove);
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
  document.body.append(floater);
  floater.hidden = false;
  return new Repeated(onRepeat, 0, Number.POSITIVE_INFINITY, afterRepeat).start();
}

// src/tooltip.js
var selector = "palmer-tooltip";
var contentAttribute = `${selector}-content`;
var positionAttribute = `${selector}-position`;
var store = /* @__PURE__ */ new WeakMap();
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector) === null) {
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
    if (!store.has(anchor)) {
      store.set(anchor, new PalmerTooltip(anchor));
    }
  }
  /**
   * @param {HTMLElement} element
   */
  static destroy(anchor) {
    const tooltip = store.get(anchor);
    if (tooltip === void 0) {
      return;
    }
    tooltip.handleCallbacks(false);
    store.delete(anchor);
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
      throw new TypeError(`A '${selector}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
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
    if (findParent(event.target, (element) => [this.anchor, this.floater].includes(element)) === void 0) {
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
