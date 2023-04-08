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
function setAttribute(element, attribute2, value) {
  if (value == null) {
    element.removeAttribute(attribute2);
  } else {
    element.setAttribute(attribute2, String(value));
  }
}

// src/focus-trap.ts
var attribute = "formal-focus-trap";
var store = /* @__PURE__ */ new WeakMap();
function handle(event, focusTrap, element) {
  const elements = getFocusableElements(focusTrap);
  if (element === focusTrap) {
    wait(() => {
      (elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
    }, 0);
    return;
  }
  const index = elements.indexOf(element);
  let target = focusTrap;
  if (index > -1) {
    let position = index + (event.shiftKey ? -1 : 1);
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
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    const element = record.target;
    if (element.getAttribute(attribute) == null) {
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
  const focusTrap = findParent(eventTarget, `[${attribute}]`);
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
    if (!store.has(element)) {
      store.set(element, new FocusTrap(element));
    }
  }
  static destroy(element) {
    const focusTrap = store.get(element);
    if (focusTrap == null) {
      return;
    }
    setAttribute(element, "tabindex", focusTrap.tabIndex);
    store.delete(element);
  }
};
(() => {
  if (typeof globalThis._formalFocusTrap !== "undefined") {
    return;
  }
  globalThis._formalFocusTrap = null;
  const observer = new MutationObserver(observe);
  observer.observe(document, {
    attributeFilter: [attribute],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  });
  wait(() => {
    const focusTraps = Array.from(document.querySelectorAll(`[${attribute}]`));
    for (const focusTrap of focusTraps) {
      focusTrap.setAttribute(attribute, "");
    }
  }, 0);
  document.addEventListener("keydown", onKeydown, eventOptions.active);
})();
export {
  attribute
};
