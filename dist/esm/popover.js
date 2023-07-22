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

// src/helpers/event.js
function getOptions(passive, capture) {
  return {
    capture: capture ?? false,
    passive: passive ?? true
  };
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
    if (minPosition >= 0) {
      return minPosition;
    }
    return maxPosition > parameters.max ? minPosition : parameters.end;
  }
  if (parameters.max <= maxPosition) {
    return parameters.end;
  }
  return minPosition < 0 ? parameters.end : minPosition;
}
function getCentered(x, position, rectangles, preferMin) {
  const { anchor, floater } = rectangles;
  if ((x ? ["above", "below", "vertical"] : ["horizontal", "left", "right"]).includes(position)) {
    const offset = (x ? anchor.width : anchor.height) / 2;
    const size = (x ? floater.width : floater.height) / 2;
    return (x ? anchor.left : anchor.top) + offset - size;
  }
  if (x ? position.startsWith("horizontal") : position.startsWith("vertical")) {
    return getAbsolute({
      preferMin,
      end: x ? anchor.right : anchor.bottom,
      max: x ? innerWidth : innerHeight,
      offset: x ? floater.width : floater.height,
      start: x ? anchor.left : anchor.top
    });
  }
  return void 0;
}
function getPosition(currentPosition, defaultPosition) {
  if (currentPosition === null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index2 = allPositions.indexOf(normalized);
  return index2 > -1 ? allPositions[index2] ?? defaultPosition : defaultPosition;
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
  return getCentered(x, position, rectangles, preferMin) ?? x ? anchor.left : anchor.bottom;
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
].map((selector4) => `${selector4}:not([inert])`).join(",");
function getFocusableElements(element) {
  const items = Array.from(element.querySelectorAll(selector)).map((element2) => ({ element: element2, tabIndex: getTabIndex(element2) })).filter((item) => isFocusableFilter(item));
  const indiced = [];
  for (const item of items) {
    if (indiced[item.tabIndex] === void 0) {
      indiced[item.tabIndex] = [item.element];
    } else {
      indiced[item.tabIndex].push(item.element);
    }
  }
  return indiced.flat();
}
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

// src/helpers/touchy.js
var isTouchy = (() => {
  let value = false;
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (typeof media?.matches === "boolean") {
        value = media.matches;
      }
    }
    if (!value) {
      value = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints ?? 0) > 0;
    }
  } catch {
    value = false;
  }
  return value;
})();
var methods = {
  begin: isTouchy ? "touchstart" : "mousedown",
  end: isTouchy ? "touchend" : "mouseup",
  move: isTouchy ? "touchmove" : "mousemove"
};

// src/focus-trap.js
var selector2 = "palmer-focus-trap";
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
    if (record.target.getAttribute(selector2) === void 0) {
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
    this.tabIndex = element.tabIndex;
    element.tabIndex = -1;
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
document.addEventListener("keydown", onKeydown, getOptions(false));

// src/popover.js
var selector3 = "palmer-popover";
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
  document[method](methods.begin, callbacks.pointer, getOptions());
  document[method]("keydown", callbacks.keydown, getOptions());
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
  component.button.ariaExpanded = !expanded;
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
  component.dispatchEvent(new CustomEvent("toggle", { detail: component.open }));
}
function onClose(event) {
  if (!(event instanceof KeyboardEvent) || [" ", "Enter"].includes(event.key)) {
    handleToggle(this, false);
  }
}
function onDocumentKeydown(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function onDocumentPointer(event) {
  if (this.open) {
    handleGlobalEvent(event, this, event.target);
  }
}
function onToggle() {
  handleToggle(this);
}
function setButtons(component) {
  component.button.addEventListener(
    "click",
    onToggle.bind(component),
    getOptions()
  );
  const buttons = Array.from(component.querySelectorAll(`[${selector3}-close]`));
  for (const button of buttons) {
    button.addEventListener("click", onClose.bind(component), getOptions());
  }
}
var PalmerPopover = class extends HTMLElement {
  get open() {
    return this.button?.ariaExpanded === "true";
  }
  set open(open) {
    handleToggle(this, open);
  }
  constructor() {
    super();
    const button = this.querySelector(`[${selector3}-button]`);
    const content = this.querySelector(`[${selector3}-content]`);
    if (!(button instanceof HTMLButtonElement)) {
      throw new TypeError(
        `<${selector3}> must have a <button>-element with the attribute '${selector3}-button`
      );
    }
    if (!(content instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector3}> must have an element with the attribute '${selector3}-content'`
      );
    }
    this.button = button;
    this.content = content;
    this.timer = void 0;
    content.hidden = true;
    if (isNullOrWhitespace(this.id)) {
      this.id = `palmer_popover_${++index}`;
    }
    if (isNullOrWhitespace(button.id)) {
      button.id = `${this.id}_button`;
    }
    if (isNullOrWhitespace(content.id)) {
      content.id = `${this.id}_content`;
    }
    button.ariaExpanded = false;
    button.ariaHasPopup = "dialog";
    button.setAttribute("aria-controls", content.id);
    content.role = "dialog";
    content.ariaModal = false;
    content.setAttribute(selector2, "");
    store2.set(
      this,
      {
        keydown: onDocumentKeydown.bind(this),
        pointer: onDocumentPointer.bind(this)
      }
    );
    setButtons(this);
  }
  toggle() {
    handleToggle(this);
  }
};
customElements.define(selector3, PalmerPopover);
export {
  PalmerPopover
};
