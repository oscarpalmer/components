// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var request = requestAnimationFrame ?? function(callback) {
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
  get active() {
    return this.state.active;
  }
  get finished() {
    return !this.active && this.state.finished;
  }
  /**
   * @param {RepeatedCallback} callback
   * @param {number} time
   * @param {number} count
   * @param {AfterCallback|undefined} afterCallback
   */
  constructor(callback, time, count, afterCallback) {
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
    (cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
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
function getTextDirection(element) {
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}

// src/helpers/floated.js
var allPositions = [
  "above",
  "above-left",
  "above-right",
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
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
  const left = getValue(true, position, rectangles, rightToLeft);
  const top = getValue(false, position, rectangles, preferAbove);
  return { top, left };
}
function getAbsolute(parameters) {
  const maxPosition = parameters.end + parameters.offset;
  const minPosition = parameters.start - parameters.offset;
  if (parameters.preferMin) {
    return minPosition < 0 ? maxPosition > parameters.max ? minPosition : parameters.end : minPosition;
  }
  return maxPosition > parameters.max ? minPosition < 0 ? parameters.end : minPosition : parameters.end;
}
function getPosition(currentPosition, defaultPosition) {
  if (currentPosition === null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index = allPositions.indexOf(normalized);
  return index > -1 ? allPositions[index] ?? defaultPosition : defaultPosition;
}
function getValue(x, position, rectangles, preferMin) {
  const { anchor, floater } = rectangles;
  if (x ? position.startsWith("right") : position.endsWith("top")) {
    return x ? anchor.right : anchor.top;
  }
  if (x ? position.startsWith("left") : position.endsWith("bottom")) {
    return (x ? anchor.left : anchor.bottom) - (x ? floater.width : floater.height);
  }
  if (x ? position.endsWith("right") : position.startsWith("above")) {
    return (x ? anchor.right : anchor.top) - (x ? floater.width : floater.height);
  }
  if ((x ? ["above", "below", "vertical"] : ["horizontal", "left", "right"]).includes(position)) {
    return (x ? anchor.left : anchor.top) + (x ? anchor.width : anchor.height) / 2 - (x ? floater.width : floater.height) / 2;
  }
  if (x ? position.startsWith("horizontal") : position.startsWith("vertical")) {
    return getAbsolute({
      preferMin,
      end: x ? anchor.right : anchor.bottom,
      max: x ? globalThis.innerWidth : globalThis.innerHeight,
      offset: x ? floater.width : floater.height,
      start: x ? anchor.left : anchor.top
    });
  }
  return x ? anchor.left : anchor.bottom;
}
function updateFloated(parameters) {
  const { anchor, floater, parent } = parameters.elements;
  const rightToLeft = getTextDirection(floater) === "rtl";
  let previousPosition;
  let previousRectangle;
  function afterRepeat() {
    anchor.after(floater);
  }
  function onRepeat() {
    const currentPosition = getPosition(
      (parent ?? anchor).getAttribute(parameters.position.attribute) ?? "",
      parameters.position.defaultValue
    );
    const currentRectangle = anchor.getBoundingClientRect();
    if (previousPosition === currentPosition && domRectKeys.every(
      (key) => previousRectangle?.[key] === currentRectangle[key]
    )) {
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

// src/helpers/focusable.js
var filters = [isDisabled, isNotTabbable, isInert, isHidden, isSummarised];
var selector = [
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]:not(slot)",
  "a[href]",
  "audio[controls]",
  "button",
  "details",
  "details > summary:first-of-type",
  "iframe",
  "input",
  "select",
  "textarea",
  "video[controls]"
].map((selector3) => `${selector3}:not([inert])`).join(",");
function getTabIndex(element) {
  if (element.tabIndex > -1) {
    return element.tabIndex;
  }
  if (/^(audio|details|video)$/i.test(element.tagName) || isEditable(element)) {
    return hasTabIndex(element) ? -1 : 0;
  }
  return -1;
}
function hasTabIndex(element) {
  return !Number.isNaN(Number.parseInt(element.getAttribute("tabindex"), 10));
}
function isDisabled(item) {
  if (/^(button|input|select|textarea)$/i.test(item.element.tagName) && isDisabledFromFieldset(item.element)) {
    return true;
  }
  return (item.element.disabled ?? false) || item.element.ariaDisabled === "true";
}
function isDisabledFromFieldset(element) {
  let parent = element.parentElement;
  while (parent !== null) {
    if (/^fieldset$/i.test(parent.tagName) && parent.disabled) {
      const children = Array.from(parent.children);
      for (const child of children) {
        if (/^legend$/i.test(child.tagName)) {
          return parent.matches("fieldset[disabled] *") ? true : !child.contains(element);
        }
      }
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}
function isEditable(element) {
  return /^(|true)$/i.test(element.getAttribute("contenteditable"));
}
function isFocusable(element) {
  return isFocusableFilter({ element, tabIndex: getTabIndex(element) });
}
function isFocusableFilter(item) {
  return !filters.some((callback) => callback(item));
}
function isHidden(item) {
  if (item.element.hidden || item.element instanceof HTMLInputElement && item.element.type === "hidden") {
    return true;
  }
  const style = getComputedStyle(item.element);
  if (style.display === "none" || style.visibility === "hidden") {
    return true;
  }
  const { height, width } = item.element.getBoundingClientRect();
  return height === 0 && width === 0;
}
function isInert(item) {
  return (item.element.inert ?? false) || /^(|true)$/i.test(item.element.getAttribute("inert")) || item.element.parentElement !== null && isInert({ element: item.element.parentElement });
}
function isNotTabbable(item) {
  return item.tabIndex < 0;
}
function isSummarised(item) {
  return /^details$/i.test(item.element.tagName) && Array.from(item.element.children).some(
    (child) => /^summary$/i.test(child.tagName)
  );
}

// src/tooltip.js
var selector2 = "palmer-tooltip";
var positionAttribute = `${selector2}-position`;
var store = /* @__PURE__ */ new WeakMap();
function createFloater(anchor) {
  const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
  const element = id === null ? null : document.querySelector(`#${id}`);
  if (element === null) {
    throw new TypeError(
      `A '${selector2}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`
    );
  }
  element.setAttribute(`${selector2}-content`, "");
  element.ariaHidden = "true";
  element.hidden = true;
  element.role = "tooltip";
  return element;
}
function createTooltip(anchor) {
  if (!store.has(anchor)) {
    store.set(anchor, new PalmerTooltip(anchor));
  }
}
function destroyTooltip(anchor) {
  const tooltip = store.get(anchor);
  if (tooltip === void 0) {
    return;
  }
  tooltip.handleCallbacks(false);
  store.delete(anchor);
}
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector2) === null) {
      destroyTooltip(record.target);
    } else {
      createTooltip(record.target);
    }
  }
}
var PalmerTooltip = class {
  /**
   * @constructor
   * @param {HTMLElement} anchor
   */
  constructor(anchor) {
    this.anchor = anchor;
    this.callbacks = {
      click: this.onClick.bind(this),
      hide: this.onHide.bind(this),
      keydown: this.onKeyDown.bind(this),
      show: this.onShow.bind(this)
    };
    this.focusable = isFocusable(anchor);
    this.floater = createFloater(anchor);
    this.timer = void 0;
    this.handleCallbacks(true);
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
var observer = new MutationObserver(observe);
observer.observe(
  document,
  {
    attributeFilter: [selector2],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }
);
wait(
  () => {
    const elements = Array.from(document.querySelectorAll(`[${selector2}]`));
    for (const element of elements) {
      element.setAttribute(selector2, "");
    }
  },
  0
);
