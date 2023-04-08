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
function setAttribute(element, attribute2, value) {
  if (value == null) {
    element.removeAttribute(attribute2);
  } else {
    element.setAttribute(attribute2, String(value));
  }
}
function setProperty(element, property, value) {
  element.setAttribute(property, String(typeof value === "boolean" ? value : false));
}

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
  var _a;
  if (currentPosition == null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index = positions.indexOf(normalized);
  return index > -1 ? (_a = positions[index]) != null ? _a : defaultPosition : defaultPosition;
}
function updateFloated(elements, position) {
  const { anchor, floater, parent } = elements;
  document.body.appendChild(floater);
  floater.hidden = false;
  return repeat(() => {
    var _a;
    if (floater.hidden) {
      anchor.insertAdjacentElement("afterend", floater);
      return;
    }
    const floatedPosition = getPosition((_a = (parent != null ? parent : anchor).getAttribute(position.attribute)) != null ? _a : "", position.value);
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

// src/tooltip.ts
var attribute = "toasty-tooltip";
var contentAttribute = `${attribute}-content`;
var positionAttribute = `${attribute}-position`;
var store = /* @__PURE__ */ new WeakMap();
function observe(records) {
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
    __publicField(this, "callbacks", {
      click: this.onClick.bind(this),
      hide: this.onHide.bind(this),
      keydown: this.onKeyDown.bind(this),
      show: this.onShow.bind(this)
    });
    __publicField(this, "floater");
    __publicField(this, "focusable");
    __publicField(this, "timer");
    this.focusable = anchor.matches(focusableSelector);
    this.floater = Tooltip.createFloater(anchor);
    this.handleCallbacks(true);
  }
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
    var _a;
    const id = (_a = anchor.getAttribute("aria-describedby")) != null ? _a : anchor.getAttribute("aria-labelledby");
    const element = id == null ? null : document.getElementById(id);
    if (element == null) {
      throw new Error(`A '${attribute}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);
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
    var _a, _b;
    const method = show ? "addEventListener" : "removeEventListener";
    document[method]("click", this.callbacks.click, eventOptions.passive);
    document[method]("keydown", this.callbacks.keydown, eventOptions.passive);
    if (show) {
      (_a = this.timer) == null ? void 0 : _a.stop();
      this.timer = updateFloated(this, {
        attribute: positionAttribute,
        value: "above"
      });
    } else {
      this.floater.hidden = true;
      (_b = this.timer) == null ? void 0 : _b.stop();
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
  attributeFilter: [attribute],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
wait(() => {
  const tooltips = Array.from(document.querySelectorAll(`[${attribute}]`));
  for (const tooltip of tooltips) {
    tooltip.setAttribute(attribute, "");
  }
}, 0);
