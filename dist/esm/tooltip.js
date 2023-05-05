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
  const { direction } = getComputedStyle?.(element);
  return direction === "rtl" ? "rtl" : "ltr";
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
  if (currentPosition == null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index = allPositions.indexOf(normalized);
  return index > -1 ? allPositions[index] ?? defaultPosition : defaultPosition;
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

// src/tooltip.ts
var selector = "palmer-tooltip";
var contentAttribute = `${selector}-content`;
var positionAttribute = `${selector}-position`;
var store = /* @__PURE__ */ new WeakMap();
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(selector) == null) {
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
    if (!store.has(anchor)) {
      store.set(anchor, new Tooltip(anchor));
    }
  }
  static destroy(element) {
    const tooltip = store.get(element);
    if (typeof tooltip === "undefined") {
      return;
    }
    tooltip.handleCallbacks(false);
    store.delete(element);
  }
  static createFloater(anchor) {
    const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
    const element = id == null ? null : document.getElementById(id);
    if (element == null) {
      throw new Error(`A '${selector}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
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
