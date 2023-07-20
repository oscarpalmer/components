// src/helpers/event.js
function getCoordinates(event) {
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  const x = event.touches[0]?.clientX;
  const y = event.touches[0]?.clientY;
  return x === void 0 || y === void 0 ? void 0 : { x, y };
}
function getOptions(passive, capture) {
  return {
    capture: capture ?? false,
    passive: passive ?? true
  };
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
      getOptions(false)
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
    store.get(this)?.observer.observe(
      this,
      {
        childList: true,
        subtree: true
      }
    );
  }
  disconnectedCallback() {
    store.get(this)?.observer.disconnect();
  }
};
PalmerAccordion.observedAttributes = ["max", "min", "value"];
customElements.define("palmer-accordion", PalmerAccordion);

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

// src/colour-picker.js
var backgroundImage = [
  "linear-gradient(to bottom",
  "hsl(0 0% 100%) 0%",
  "hsl(0 0% 100% / 0) 50%",
  "hsl(0 0% 0% / 0) 50%",
  "hsl(0 0% 0%) 100%)",
  "linear-gradient(to right",
  "hsl(0 0% 50%) 0%",
  "hsl(0 0% 50% / 0) 100%)"
];
var store2 = /* @__PURE__ */ new WeakMap();
var selector = "palmer-colour-picker";
function createHue(element, input) {
  element.hidden = false;
  input.type = "range";
  input.max = 360;
  input.min = 0;
}
function createWell(well, handle) {
  well.hidden = false;
  well.style.backgroundColor = "hsl(var(--hue-value) 100% 50%)";
  well.style.backgroundImage = backgroundImage;
  well.style.position = "relative";
  handle.tabIndex = 0;
  handle.style.position = "absolute";
  handle.style.top = 0;
  handle.style.left = 0;
  handle.style.transform = "translate3d(-50%, -50%, 0)";
}
function getHex(value, defaultValue) {
  let normalised = normaliseHex(value);
  if (!validateHex(normalised)) {
    return defaultValue;
  }
  if (normalised.length === 3) {
    normalised = normalised.split("").map((character) => `${character}${character}`).join("");
  }
  return normalised;
}
function hexToRgb(value) {
  const hex = getHex(value);
  if (hex === void 0) {
    return void 0;
  }
  const pairs = hex.match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  const rgb = [];
  for (let index3 = 0; index3 < 3; index3 += 1) {
    rgb.push(Number.parseInt(pairs[index3 + 1], 16));
  }
  return { red: rgb[0], green: rgb[1], blue: rgb[2] };
}
function hslToRgb(value) {
  function f(n) {
    const k = (n + hue / 30) % 12;
    const a = saturation * Math.min(lightness, 1 - lightness);
    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }
  let { hue, saturation, lightness } = value;
  hue %= 360;
  if (hue < 0) {
    hue += 360;
  }
  saturation /= 100;
  lightness /= 100;
  return {
    red: Math.round(f(0) * 255),
    green: Math.round(f(8) * 255),
    blue: Math.round(f(4) * 255)
  };
}
function normaliseHex(value) {
  return value?.replace(/^(#|\s)|\s$/g, "") ?? "";
}
function onDocumentKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }
  event.stopPropagation();
  stopMove(this, true);
}
function onDocumentPointerEnd() {
  stopMove(this, false);
}
function onDocumentPointerMove(event) {
  if (isTouchy) {
    event.preventDefault();
  }
  const { height, left, top, width } = this.well.getBoundingClientRect();
  const { x, y } = getCoordinates(event);
  const lightness = 100 - Math.round((y - top) / height * 100);
  const saturation = Math.round((x - left) / width * 100);
  setValue(this, saturation, lightness);
}
function onHueChange() {
  this.hsl.hue = Number.parseInt(this.hue.value, 10);
  update(this);
}
function onInputKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  const rgb = hexToRgb(this.input.value);
  if (rgb === void 0) {
    return;
  }
  const hsl = rgbToHsl(rgb);
  this.hsl.hue = hsl.hue;
  this.hsl.saturation = hsl.saturation;
  this.hsl.lightness = hsl.lightness;
  update(this);
}
function onWellKeydown(event) {
  if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  let { lightness, saturation } = this.hsl;
  switch (event.key) {
    case "ArrowDown": {
      lightness -= 1;
      break;
    }
    case "ArrowLeft": {
      saturation -= 1;
      break;
    }
    case "ArrowRight": {
      saturation += 1;
      break;
    }
    case "ArrowUp": {
      lightness += 1;
      break;
    }
    default: {
      return;
    }
  }
  setValue(this, saturation, lightness);
}
function onWellPointerBegin(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.button > 0) {
    return;
  }
  event.stopPropagation();
  onDocumentPointerMove.call(this, event);
  const stored = {
    callbacks: {
      onKeydown: onDocumentKeydown.bind(this),
      onPointerEnd: onDocumentPointerEnd.bind(this),
      onPointerMove: onDocumentPointerMove.bind(this)
    },
    hsl: {
      hue: this.hsl.hue,
      saturation: this.hsl.saturation,
      lightness: this.hsl.lightness
    }
  };
  setCallbacks(stored.callbacks, true);
  store2.set(this, stored);
}
function rgbToHex(value) {
  return `#${(value.blue | value.green << 8 | value.red << 16 | 1 << 24).toString(16).slice(1)}`;
}
function rgbToHsl(rgb) {
  let { red, green, blue } = rgb;
  red /= 255;
  green /= 255;
  blue /= 255;
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
  const chroma = max - min;
  const lightness = max - chroma / 2;
  let hue = 0;
  let saturation = 0;
  switch (chroma) {
    case red: {
      hue = (green - blue) / chroma % 6;
      break;
    }
    case green: {
      hue = (blue - red) / chroma + 2;
      break;
    }
    case blue: {
      hue = (red - green) / chroma + 2;
      break;
    }
    default: {
      break;
    }
  }
  saturation = max === 0 || lightness === 0 || lightness === 0 ? 0 : (max - lightness) / Math.min(lightness, 1 - lightness);
  hue *= 60;
  if (hue < 0) {
    hue += 360;
  }
  return {
    hue: Math.round(hue),
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100)
  };
}
function setCallbacks(callbacks, add) {
  const method = add ? "addEventListener" : "removeEventListener";
  document[method]("keydown", callbacks.onKeydown, getOptions(true, true));
  document[method](methods.end, callbacks.onPointerEnd, getOptions());
  document[method](
    methods.move,
    callbacks.onPointerMove,
    getOptions(!isTouchy)
  );
  setStyles(add);
}
function setStyles(active) {
  document.body.style.userSelect = active ? "none" : null;
  document.body.style.webkitUserSelect = active ? "none" : null;
}
function setValue(component, saturation, lightness) {
  component.hsl.saturation = saturation < 0 ? 0 : saturation > 100 ? 100 : saturation;
  component.hsl.lightness = lightness < 0 ? 0 : lightness > 100 ? 100 : lightness;
  update(component);
}
function stopMove(component, reset) {
  const stored = store2.get(component);
  if (stored === void 0) {
    return;
  }
  setCallbacks(stored.callbacks, false);
  if (reset) {
    component.hsl.hue = stored.hsl.hue;
    component.hsl.lightness = stored.hsl.lightness;
    component.hsl.saturation = stored.hsl.saturation;
    update(component);
  }
  store2.delete(component);
  component.handle.focus();
}
function validateHex(value) {
  return /^([\da-f]{3}){1,2}$/i.test(normaliseHex(value));
}
function update(component) {
  component.hue.value = component.hsl.hue;
  updateCss(component);
  updateWell(component);
  component.input.value = rgbToHex(hslToRgb(component.hsl));
  component.input.dispatchEvent(new Event("change"));
}
function updateCss(component) {
  const { hue, lightness, saturation } = component.hsl;
  for (const element of [component, component.hue, component.well]) {
    element.style.setProperty("--hue-handle", `${hue / 360 * 100}%`);
    element.style.setProperty("--hue-value", hue);
    element.style.setProperty(
      "--value",
      `hsl(${hue} ${saturation}% ${lightness}%)`
    );
  }
}
function updateWell(component) {
  const { handle, hsl } = component;
  handle.style.top = `${100 - hsl.lightness}%`;
  handle.style.left = `${hsl.saturation}%`;
}
var PalmerColourPicker = class extends HTMLElement {
  /**
   * @returns {Value}
   */
  get value() {
    const rgb = hslToRgb(this.hsl);
    return {
      rgb,
      hex: rgbToHex(rgb),
      hsl: this.hsl
    };
  }
  constructor() {
    super();
    const hue = this.querySelector(`[${selector}-hue]`);
    const hueInput = hue?.querySelector(`[${selector}-hue-input]`);
    if (!(hue instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector}> needs an element with the attribute '${selector}-hue' to hold the hue input`
      );
    }
    if (!(hueInput instanceof HTMLInputElement)) {
      throw new TypeError(
        `<${selector}> needs an <input>-element with the attribute '${selector}-hue-input'`
      );
    }
    const input = this.querySelector(`[${selector}-input]`);
    if (!(input instanceof HTMLInputElement) || !/^(color|text)$/i.test(input.type)) {
      throw new TypeError(
        `<${selector}> needs an <input>-element with the attribute '${selector}-input'`
      );
    }
    const well = this.querySelector(`[${selector}-well]`);
    const wellHandle = well?.querySelector(`[${selector}-well-handle]`);
    if ([well, wellHandle].some((element) => !(element instanceof HTMLElement))) {
      throw new TypeError(
        `<${selector}> needs two elements for the colour well: one wrapping element with the attribute '${selector}-well', and one within it with the attribute '${selector}-well-handle'`
      );
    }
    this.handle = wellHandle;
    this.hue = hueInput;
    this.input = input;
    this.well = well;
    input.pattern = "#?([\\da-fA-F]{3}){1,2}";
    input.type = "text";
    const value = getHex(
      input.getAttribute("value") ?? this.getAttribute("value"),
      "000000"
    );
    const rgb = hexToRgb(value);
    this.hsl = rgbToHsl(rgb);
    createHue(hue, hueInput);
    createWell(well, wellHandle);
    this.input.addEventListener(
      "keydown",
      onInputKeydown.bind(this),
      getOptions(false)
    );
    this.handle.addEventListener(
      "keydown",
      onWellKeydown.bind(this),
      getOptions(false)
    );
    this.handle.addEventListener(
      methods.begin,
      onWellPointerBegin.bind(this),
      getOptions()
    );
    well.addEventListener(
      methods.begin,
      onWellPointerBegin.bind(this),
      getOptions()
    );
    this.hue.addEventListener("input", onHueChange.bind(this), getOptions());
    update(this);
  }
};
customElements.define(selector, PalmerColourPicker);

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

// src/details.js
var selector2 = "palmer-details";
var store3 = /* @__PURE__ */ new WeakMap();
function create(element) {
  if (!store3.has(element)) {
    store3.set(element, new PalmerDetails(element));
  }
}
function destroy(element) {
  store3.delete(element);
}
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (!(record.target instanceof HTMLDetailsElement)) {
      throw new TypeError(
        `An element with the '${selector2}'-attribute must be a <details>-element`
      );
    }
    if (record.target.getAttribute(selector2) === null) {
      destroy(record.target);
    } else {
      create(record.target);
    }
  }
}
var PalmerDetails = class {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.details = element;
    this.summary = element.querySelector(":scope > summary") ?? void 0;
    this.callbacks = {
      onKeydown: this.onKeydown.bind(this),
      onToggle: this.onToggle.bind(this)
    };
    this.details.addEventListener(
      "toggle",
      this.callbacks.onToggle,
      getOptions()
    );
  }
  /**
   * @param {KeyboardEvent} event
   */
  onKeydown(event) {
    if (event.key !== "Escape" || !this.details.open) {
      return;
    }
    event.stopPropagation();
    const children = [...this.details.querySelectorAll(`[${selector2}][open]`)];
    if (children.some((child) => child.contains(document.activeElement)) || !this.details.contains(document.activeElement)) {
      return;
    }
    this.details.open = false;
    wait(() => this.summary?.focus(), 0);
  }
  onToggle() {
    document[this.details.open ? "addEventListener" : "removeEventListener"]?.(
      "keydown",
      this.callbacks.onKeydown,
      getOptions()
    );
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
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function getTextDirection(element) {
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/helpers/focusable.js
var filters = [isDisabled, isNotTabbable, isInert, isHidden, isSummarised];
var selector3 = [
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
].map((selector9) => `${selector9}:not([inert])`).join(",");
function getFocusableElements(element) {
  const items = Array.from(element.querySelectorAll(selector3)).map((element2) => ({ element: element2, tabIndex: getTabIndex(element2) })).filter((item) => isFocusableFilter(item));
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

// src/focus-trap.js
var selector4 = "palmer-focus-trap";
var store4 = /* @__PURE__ */ new WeakMap();
function create2(element) {
  if (!store4.has(element)) {
    store4.set(element, new FocusTrap(element));
  }
}
function destroy2(element) {
  const focusTrap = store4.get(element);
  if (focusTrap === void 0) {
    return;
  }
  element.tabIndex = focusTrap.tabIndex;
  store4.delete(element);
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
  wait(
    () => {
      target.focus();
    },
    0
  );
}
function observe2(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector4) === void 0) {
      destroy2(record.target);
    } else {
      create2(record.target);
    }
  }
}
function onKeydown2(event) {
  if (event.key !== "Tab") {
    return;
  }
  const focusTrap = findParent(event.target, `[${selector4}]`);
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
var observer2 = new MutationObserver(observe2);
observer2.observe(
  document,
  {
    attributeFilter: [selector4],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }
);
wait(
  () => {
    const elements = Array.from(document.querySelectorAll(`[${selector4}]`));
    for (const element of elements) {
      element.setAttribute(selector4, "");
    }
  },
  0
);
document.addEventListener("keydown", onKeydown2, getOptions(false));

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
  const index3 = allPositions.indexOf(normalized);
  return index3 > -1 ? allPositions[index3] ?? defaultPosition : defaultPosition;
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
      max: x ? innerWidth : innerHeight,
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

// src/popover.js
var selector5 = "palmer-popover";
var store5 = /* @__PURE__ */ new WeakMap();
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
  const callbacks = store5.get(component);
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
  const floater = findParent(target, `[${selector5}-content]`);
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
  content.setAttribute(selector4, "");
  content.role = "dialog";
  content.ariaModal = "false";
  store5.set(
    component,
    {
      keydown: onKeydown3.bind(component),
      pointer: onPointer.bind(component)
    }
  );
  button.addEventListener("click", toggle.bind(component), getOptions());
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
function onKeydown3(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function onPointer(event) {
  if (this.open) {
    handleGlobalEvent(event, this, event.target);
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
    const button = this.querySelector(`:scope > [${selector5}-button]`);
    const content = this.querySelector(`:scope > [${selector5}-content]`);
    if (!isButton(button)) {
      throw new Error(
        `<${selector5}> must have a <button>-element (or button-like element) with the attribute '${selector5}-button`
      );
    }
    if (content === null || !(content instanceof HTMLElement)) {
      throw new Error(
        `<${selector5}> must have an element with the attribute '${selector5}-content'`
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
customElements.define(selector5, PalmerPopover);

// src/splitter.js
var selector6 = "palmer-splitter";
var splitterTypes = /* @__PURE__ */ new Set(["horizontal", "vertical"]);
var store6 = /* @__PURE__ */ new WeakMap();
var index2 = 0;
function createHandle(component, className) {
  const handle = document.createElement("span");
  handle.className = `${className}__separator__handle`;
  handle.ariaHidden = "true";
  handle.textContent = component.type === "horizontal" ? "\u2195" : "\u2194";
  handle.addEventListener(methods.begin, () => onPointerBegin(component));
  return handle;
}
function createSeparator(component, values, className) {
  const actualValues = values ?? store6.get(component)?.values;
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
    setFlexValue(
      component,
      {
        separator,
        value: 50
      }
    );
  }
  separator.append(component.handle);
  separator.addEventListener(
    "keydown",
    (event) => onSeparatorKeydown(component, event),
    getOptions()
  );
  return separator;
}
function onDocumentKeydown2(event) {
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
  if (isTouchy) {
    event.preventDefault();
  }
  const coordinates = getCoordinates(event);
  if (coordinates === void 0) {
    return;
  }
  const componentRectangle = this.getBoundingClientRect();
  const value = this.type === "horizontal" ? (coordinates.y - componentRectangle.top) / componentRectangle.height : (coordinates.x - componentRectangle.left) / componentRectangle.width;
  setFlexValue(
    this,
    {
      separator: this.separator,
      value: value * 100
    }
  );
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
  const { values } = store6.get(component);
  if (values === void 0) {
    return;
  }
  let value;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp": {
      value = Math.round(
        component.value + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1)
      );
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
  setFlexValue(
    component,
    {
      value,
      values,
      separator: component.separator
    }
  );
}
function setAbsoluteValue(component, parameters) {
  const { key, separator, setFlex } = parameters;
  const values = parameters.values ?? store6.get(component)?.values;
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
    setFlexValue(
      component,
      {
        separator,
        value,
        values
      }
    );
  }
}
function setDragging(component, active) {
  const stored = store6.get(component);
  if (stored === void 0) {
    return;
  }
  if (active) {
    stored.values.initial = Number(stored.values.current);
  }
  const method = active ? "addEventListener" : "removeEventListener";
  document[method]("keydown", stored.callbacks.keydown, getOptions());
  document[method](methods.end, stored.callbacks.pointerEnd, getOptions());
  document[method](
    methods.move,
    stored.callbacks.pointerMove,
    getOptions(!isTouchy)
  );
  stored.dragging = active;
  document.body.style.userSelect = active ? "none" : null;
  document.body.style.webkitUserSelect = active ? "none" : null;
}
function setFlexValue(component, parameters) {
  const { separator } = parameters;
  const values = parameters.values ?? store6.get(component)?.values;
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
  get max() {
    return store6.get(this)?.values.maximum;
  }
  set max(max) {
    this.setAttribute("max", max);
  }
  get min() {
    return store6.get(this)?.values.minimum;
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
    return store6.get(this)?.values.current;
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  constructor() {
    super();
    if (this.children.length !== 2) {
      throw new Error(`A <${selector6}> must have exactly two direct children`);
    }
    const stored = {
      callbacks: {
        keydown: onDocumentKeydown2.bind(this),
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
    store6.set(this, stored);
    this.primary = this.children[0];
    this.secondary = this.children[1];
    let className = this.getAttribute("className");
    if (isNullOrWhitespace(className)) {
      className = selector6;
    }
    const panelClassName = `${className}__panel`;
    this.primary.classList.add(panelClassName);
    this.secondary.classList.add(panelClassName);
    this.handle = createHandle(this, className);
    this.separator = createSeparator(this, stored.values, className);
    this.primary?.insertAdjacentElement("afterend", this.separator);
  }
  attributeChangedCallback(name, _, value) {
    switch (name) {
      case "max":
      case "min": {
        setAbsoluteValue(
          this,
          {
            key: name === "max" ? "maximum" : "minimum",
            separator: this.separator,
            setFlex: true,
            value
          }
        );
        break;
      }
      case "value": {
        setFlexValue(
          this,
          {
            separator: this.separator,
            setOriginal: true,
            value
          }
        );
        break;
      }
      default: {
        break;
      }
    }
  }
};
PalmerSplitter.observedAttributes = ["max", "min", "value"];
customElements.define(selector6, PalmerSplitter);

// src/switch.js
var selector7 = "palmer-switch";
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
    className = selector7;
  }
  if (isNullOrWhitespace(off)) {
    off = "Off";
  }
  if (isNullOrWhitespace(on)) {
    on = "On";
  }
  component.insertAdjacentHTML(
    "afterbegin",
    render(
      component.id,
      className,
      {
        off,
        on,
        label: label.innerHTML
      }
    )
  );
  component.addEventListener("click", onToggle2.bind(component), getOptions());
  component.addEventListener(
    "keydown",
    onKey.bind(component),
    getOptions(false)
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
function render(id, className, text) {
  return `<span class="${className}__label" id="${id}_label" aria-hidden="true">${text.label}</span><div class="${className}__status" aria-hidden="true"><span class="${className}__status__indicator"></span></div><div class="${className}__text" aria-hidden="true"><span class="${className}__text__off">${text.off}</span><span class="${className}__text__on">${text.on}</span></div>`;
}
function toggle2(component) {
  if (component.disabled || component.readonly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var PalmerSwitch = class extends HTMLElement {
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
  constructor() {
    super();
    this.internals = this.attachInternals?.();
    const input = this.querySelector(`[${selector7}-input]`);
    const label = this.querySelector(`[${selector7}-label]`);
    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new TypeError(
        `<${selector7}> must have an <input>-element with type 'checkbox' and the attribute '${selector7}-input'`
      );
    }
    if (!(label instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector7}> must have an element with the attribute '${selector7}-label'`
      );
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
PalmerSwitch.formAssociated = true;
customElements.define(selector7, PalmerSwitch);

// src/tooltip.js
var selector8 = "palmer-tooltip";
var positionAttribute = `${selector8}-position`;
var store7 = /* @__PURE__ */ new WeakMap();
function createFloater(anchor) {
  const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
  const element = id === null ? null : document.querySelector(`#${id}`);
  if (element === null) {
    throw new TypeError(
      `A '${selector8}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`
    );
  }
  element.setAttribute(`${selector8}-content`, "");
  element.ariaHidden = "true";
  element.hidden = true;
  element.role = "tooltip";
  return element;
}
function createTooltip(anchor) {
  if (!store7.has(anchor)) {
    store7.set(anchor, new PalmerTooltip(anchor));
  }
}
function destroyTooltip(anchor) {
  const tooltip = store7.get(anchor);
  if (tooltip === void 0) {
    return;
  }
  tooltip.handleCallbacks(false);
  store7.delete(anchor);
}
function observe3(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector8) === null) {
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
    document[method]("click", this.callbacks.click, getOptions());
    document[method]("keydown", this.callbacks.keydown, getOptions());
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
      element[method]("mouseenter", this.callbacks.show, getOptions());
      element[method]("mouseleave", this.callbacks.hide, getOptions());
      element[method]("touchstart", this.callbacks.show, getOptions());
    }
    if (focusable) {
      anchor[method]("blur", this.callbacks.hide, getOptions());
      anchor[method]("focus", this.callbacks.show, getOptions());
    }
  }
};
var observer3 = new MutationObserver(observe3);
observer3.observe(
  document,
  {
    attributeFilter: [selector8],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }
);
wait(
  () => {
    const elements = Array.from(document.querySelectorAll(`[${selector8}]`));
    for (const element of elements) {
      element.setAttribute(selector8, "");
    }
  },
  0
);
