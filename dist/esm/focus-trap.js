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
    ].map((selector2) => `${selector2}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
  }
  return context.focusableSelector;
}

// src/focus-trap.ts
var selector = "palmer-focus-trap";
var store = /* @__PURE__ */ new WeakMap();
function handleEvent(event, focusTrap, element) {
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
    if (element.getAttribute(selector) == null) {
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
  const focusTrap = findParent(eventTarget, `[${selector}]`);
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
    if (!store.has(element)) {
      store.set(element, new FocusTrap(element));
    }
  }
  static destroy(element) {
    const focusTrap = store.get(element);
    if (focusTrap == null) {
      return;
    }
    element.tabIndex = focusTrap.tabIndex;
    store.delete(element);
  }
};
(() => {
  const context = globalThis;
  if (context.palmerFocusTrap != null) {
    return;
  }
  context.palmerFocusTrap = 1;
  const observer = new MutationObserver(observe);
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
  document.addEventListener("keydown", onKeydown, eventOptions.active);
})();
export {
  selector
};
