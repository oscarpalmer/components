// node_modules/@oscarpalmer/timer/dist/timer.js
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
  let index2 = 0;
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
        timed.callbacks.default(isRepeated ? index2 : void 0);
      }
      index2 += 1;
      if (isRepeated && index2 < timed.configuration.count) {
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
function getTextDirection(element) {
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
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
var horizontalPositions = /* @__PURE__ */ new Set(["left", "horizontal", "right"]);
var transformedPositions = /* @__PURE__ */ new Set([
  "above",
  "below",
  "vertical",
  ...Array.from(horizontalPositions.values)
]);
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
  const left = getLeft(position, rectangles, rightToLeft);
  const top = getTop(position, rectangles, preferAbove);
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
function getLeft(position, rectangles, rightToLeft) {
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
      return getAbsolute({
        end: anchor.right,
        max: globalThis.innerWidth,
        offset: floater.width,
        preferMin: rightToLeft,
        start: anchor.left
      });
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
  const index2 = allPositions.indexOf(normalized);
  return index2 > -1 ? allPositions[index2] ?? defaultPosition : defaultPosition;
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
function getTop(position, rectangles, preferAbove) {
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
      return getAbsolute({
        end: anchor.bottom,
        max: globalThis.innerHeight,
        offset: floater.height,
        preferMin: preferAbove,
        start: anchor.top
      });
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
    anchor.after(floater);
  }
  function onRepeat() {
    const currentPosition = getOriginalPosition(
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

// src/helpers/focusable.js
var focusableSelector = [
  '[contenteditable]:not([contenteditable="false"])',
  "[href]",
  '[tabindex="0"]:not(slot)',
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
  (selector3) => `${selector3}:not([disabled]):not([hidden]):not([tabindex="-1"])`
).join(",");
function getFocusableElements(context) {
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(focusableSelector));
  for (const element of elements) {
    const style = getComputedStyle?.(element);
    if (style === null || style.display !== "none" && style.visibility !== "hidden") {
      focusable.push(element);
    }
  }
  return focusable;
}

// src/focus-trap.js
var selector = "palmer-focus-trap";
var store = /* @__PURE__ */ new WeakMap();
function create(element) {
  if (!store.has(element)) {
    store.set(element, new FocusTrap(element));
  }
}
function destroy(element) {
  const focusTrap = store.get(element);
  if (focusTrap === void 0) {
    return;
  }
  element.tabIndex = focusTrap.tabIndex;
  store.delete(element);
}
function handleEvent(event, focusTrap, element) {
  const elements = getFocusableElements(focusTrap);
  if (element === focusTrap) {
    wait(
      () => {
        (elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
      },
      0
    );
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
  wait(
    () => {
      target.focus();
    },
    0
  );
}
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector) === void 0) {
      destroy(record.target);
    } else {
      create(record.target);
    }
  }
}
function onKeydown(event) {
  if (event.key !== "Tab") {
    return;
  }
  const focusTrap = findParent(event.target, `[${selector}]`);
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
    this.tabIndex = element.tabIndex;
    element.tabIndex = -1;
  }
};
(() => {
  if (globalThis.oscarpalmerComponentsFocusTrap !== null) {
    return;
  }
  globalThis.oscarpalmerComponentsFocusTrap = 1;
  const observer = new MutationObserver(observe);
  observer.observe(
    document,
    {
      attributeFilter: [selector],
      attributeOldValue: true,
      attributes: true,
      childList: true,
      subtree: true
    }
  );
  wait(
    () => {
      const elements = Array.from(document.querySelectorAll(`[${selector}]`));
      for (const element of elements) {
        element.setAttribute(selector, "");
      }
    },
    0
  );
  document.addEventListener("keydown", onKeydown, eventOptions.active);
})();

// src/popover.js
var selector2 = "palmer-popover";
var store2 = /* @__PURE__ */ new WeakMap();
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
  const callbacks = store2.get(component);
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
  const floater = findParent(target, `[${selector2}-content]`);
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
    wait(
      () => {
        afterToggle(component, true);
      },
      50
    );
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
  content.setAttribute(selector, "");
  content.role = "dialog";
  content.ariaModal = "false";
  store2.set(
    component,
    {
      click: onClick.bind(component),
      keydown: onKeydown2.bind(component)
    }
  );
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
function onKeydown2(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function toggle(expand) {
  handleToggle(this, expand);
}
var PalmerPopover = class extends HTMLElement {
  get open() {
    return this.button?.getAttribute("aria-expanded") === "true";
  }
  set open(open) {
    toggle.call(this, open);
  }
  constructor() {
    super();
    const button = this.querySelector(`:scope > [${selector2}-button]`);
    const content = this.querySelector(`:scope > [${selector2}-content]`);
    if (!isButton(button)) {
      throw new Error(
        `<${selector2}> must have a <button>-element (or button-like element) with the attribute '${selector2}-button`
      );
    }
    if (content === null || !(content instanceof HTMLElement)) {
      throw new Error(
        `<${selector2}> must have an element with the attribute '${selector2}-content'`
      );
    }
    this.button = button;
    this.content = content;
    this.timer = void 0;
    initialise(this, button, content);
  }
  toggle() {
    if (this.button && this.content) {
      toggle.call(this);
    }
  }
};
customElements.define(selector2, PalmerPopover);
export {
  PalmerPopover
};
