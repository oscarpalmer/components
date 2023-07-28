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
  return typeof x === "number" && typeof y === "number" ? { x, y } : void 0;
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
  if (document.activeElement?.getAttribute("palmer-disclosure-button") === void 0 || !keys.has(event.key)) {
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
  if (destination !== current) {
    stored.elements[destination]?.button.focus();
  }
}
function onToggle(component, element) {
  if (element.open && !component.multiple) {
    toggleDisclosures(component, element);
  }
}
function setDisclosures(component) {
  const stored = store.get(component);
  if (stored === void 0) {
    return;
  }
  stored.elements = [
    ...component.querySelectorAll(":scope > palmer-disclosure")
  ];
  for (const element of stored.elements) {
    element.addEventListener("toggle", () => onToggle(component, element));
  }
}
function toggleDisclosures(component, active) {
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
  /** @returns {boolean} */
  get multiple() {
    return this.getAttribute("multiple") !== "false";
  }
  /** @param {boolean} multiple */
  set multiple(multiple) {
    this.setAttribute("multiple", multiple);
  }
  constructor() {
    super();
    const stored = {
      elements: [],
      observer: new MutationObserver((_) => setDisclosures(this))
    };
    store.set(this, stored);
    setDisclosures(this);
    this.addEventListener(
      "keydown",
      (event) => onKeydown(this, event),
      getOptions(false)
    );
    if (!this.multiple) {
      toggleDisclosures(
        this,
        stored.elements.find((element) => element.open)
      );
    }
  }
  attributeChangedCallback(name) {
    if (name === "multiple" && !this.multiple) {
      toggleDisclosures(
        this,
        store.get(this)?.elements.find((element) => element.open)
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
  for (let index4 = 0; index4 < 3; index4 += 1) {
    rgb.push(Number.parseInt(pairs[index4 + 1], 16));
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
function isNullableOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/disclosure.js
var selector2 = "palmer-disclosure";
var index = 0;
function toggle(component, open3) {
  component.button.setAttribute("aria-expanded", open3);
  component.content.hidden = !open3;
  component.dispatchEvent(new CustomEvent("toggle", { detail: open3 }));
  component.button.focus();
}
var PalmerDisclosure = class extends HTMLElement {
  /** @returns {boolean} */
  get open() {
    return this.button.getAttribute("aria-expanded") === "true";
  }
  /** @param {boolean} value */
  set open(value) {
    if (typeof value === "boolean" && value !== this.open) {
      toggle(this, value);
    }
  }
  constructor() {
    super();
    const button = this.querySelector(`[${selector2}-button]`);
    const content = this.querySelector(`[${selector2}-content]`);
    if (!(button instanceof HTMLButtonElement)) {
      throw new TypeError(
        `<${selector2}> needs a <button>-element with the attribute '${selector2}-button'`
      );
    }
    if (!(content instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector2}> needs an element with the attribute '${selector2}-content'`
      );
    }
    this.button = button;
    this.content = content;
    const { open: open3 } = this;
    button.hidden = false;
    content.hidden = !open3;
    let { id } = content;
    if (isNullableOrWhitespace(id)) {
      id = `palmer_disclosure_${++index}`;
    }
    button.setAttribute("aria-expanded", open3);
    button.setAttribute("aria-controls", id);
    content.id = id;
    button.addEventListener(
      "click",
      (_) => toggle(this, !this.open),
      getOptions()
    );
  }
  hide() {
    if (this.open) {
      toggle(this, false);
    }
  }
  show() {
    if (!this.open) {
      toggle(this, true);
    }
  }
  toggle() {
    toggle(this, !this.open);
  }
};
customElements.define(selector2, PalmerDisclosure);

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
  let index4 = 0;
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
        timed.callbacks.default(isRepeated ? index4 : void 0);
      }
      index4 += 1;
      if (isRepeated && index4 < timed.configuration.count) {
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
  return (item.element.disabled ?? false) || item.element.getAttribute("aria-disabled") === "true";
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
var store3 = /* @__PURE__ */ new WeakMap();
function create(element) {
  if (!store3.has(element)) {
    store3.set(element, new FocusTrap(element));
  }
}
function destroy(element) {
  const focusTrap = store3.get(element);
  if (focusTrap === void 0) {
    return;
  }
  element.tabIndex = focusTrap.tabIndex;
  store3.delete(element);
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
  const index4 = elements.indexOf(element);
  let target = focusTrap;
  if (index4 > -1) {
    let position = index4 + (event.shiftKey ? -1 : 1);
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
    if (record.target.getAttribute(selector4) === void 0) {
      destroy(record.target);
    } else {
      create(record.target);
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
var observer = new MutationObserver(observe);
observer.observe(
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

// src/modal.js
var selector5 = "palmer-modal";
var openAttribute = `${selector5}-open`;
var focused = /* @__PURE__ */ new WeakMap();
var parents = /* @__PURE__ */ new WeakMap();
function close(component) {
  component.hidden = true;
  parents.get(component)?.append(component);
  focused.get(component)?.focus();
  focused.delete(component);
  component.dispatchEvent(new Event("close"));
}
function defineButton(button) {
  button.addEventListener("click", onOpen, getOptions());
}
function onClose() {
  close(this);
}
function onKeydown3(event) {
  if (event.key === "Escape") {
    onClose.call(this);
  }
}
function onOpen() {
  const modal = document.querySelector(`#${this.getAttribute(openAttribute)}`);
  if (modal === void 0) {
    return;
  }
  focused.set(modal, this);
  open2(modal);
}
function open2(component) {
  component.hidden = false;
  document.body.append(component);
  (getFocusableElements(component)[0] ?? component).focus();
  component.dispatchEvent(new Event("open"));
}
var PalmerModal = class extends HTMLElement {
  /** @returns {boolean} */
  get open() {
    return this.parentElement === document.body && !this.hidden;
  }
  /** @param {boolean} value */
  set open(value) {
    if (typeof value !== "boolean" || this.open === value) {
      return;
    }
    if (value) {
      open2(this);
    } else {
      close(this);
    }
  }
  constructor() {
    super();
    this.hidden = true;
    const { id } = this;
    if (id === void 0 || id.trim().length === 0) {
      throw new TypeError(`<${selector5}> must have an ID`);
    }
    if (isNullableOrWhitespace(this.getAttribute("aria-label")) && isNullableOrWhitespace(this.getAttribute("aria-labelledby"))) {
      throw new TypeError(
        `<${selector5}> should be labelled by either the 'aria-label' or 'aria-labelledby'-attribute`
      );
    }
    const close2 = this.querySelector(`[${selector5}-close]`);
    if (!(close2 instanceof HTMLButtonElement)) {
      throw new TypeError(
        `<${selector5}> must have a <button>-element with the attribute '${selector5}-close'`
      );
    }
    if (!(this.querySelector(`:scope > [${selector5}-content]`) instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector5}> must have an element with the attribuet '${selector5}-content'`
      );
    }
    const overlay = this.querySelector(`:scope > [${selector5}-overlay]`);
    if (!(overlay instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector5}> must have an element with the attribuet '${selector5}-overlay'`
      );
    }
    parents.set(this, this.parentElement);
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", true);
    this.setAttribute(selector4, "");
    this.addEventListener("keydown", onKeydown3.bind(this), getOptions());
    close2.addEventListener("click", onClose.bind(this), getOptions());
    overlay.addEventListener("click", onClose.bind(this), getOptions());
  }
  hide() {
    this.open = false;
  }
  show() {
    this.open = true;
  }
};
customElements.define(selector5, PalmerModal);
var observer2 = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === "attributes" && record.target instanceof HTMLButtonElement) {
      defineButton(record.target);
    }
  }
});
observer2.observe(
  document,
  {
    attributeFilter: [openAttribute],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }
);
setTimeout(
  () => {
    const elements = Array.from(
      document.querySelectorAll(`[${openAttribute}]`)
    );
    for (const element of elements) {
      defineButton(element);
    }
  },
  0
);

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
  const index4 = allPositions.indexOf(normalized);
  return index4 > -1 ? allPositions[index4] ?? defaultPosition : defaultPosition;
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

// src/popover.js
var selector6 = "palmer-popover";
var store4 = /* @__PURE__ */ new WeakMap();
var index2 = 0;
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
  document[method](methods.begin, callbacks.pointer, getOptions());
  document[method]("keydown", callbacks.keydown, getOptions());
}
function handleGlobalEvent(event, component, target) {
  const { button, content } = component;
  if (button === void 0 || content === void 0) {
    return;
  }
  const floater = findParent(target, `[${selector6}-content]`);
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
  component.button.setAttribute("aria-expadnded", !expanded);
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
function onClose2(event) {
  if (!(event instanceof KeyboardEvent) || [" ", "Enter"].includes(event.key)) {
    handleToggle(this, false);
  }
}
function onDocumentKeydown2(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function onDocumentPointer(event) {
  if (this.open) {
    handleGlobalEvent(event, this, event.target);
  }
}
function onToggle2() {
  handleToggle(this);
}
function setButtons(component) {
  component.button.addEventListener(
    "click",
    onToggle2.bind(component),
    getOptions()
  );
  const buttons = Array.from(component.querySelectorAll(`[${selector6}-close]`));
  for (const button of buttons) {
    button.addEventListener("click", onClose2.bind(component), getOptions());
  }
}
var PalmerPopover = class extends HTMLElement {
  /** @returns {boolean} */
  get open() {
    return this.button.getAttribute("aria-expanded") === "true";
  }
  /** @param {boolean} value */
  set open(value) {
    if (typeof value === "boolean" && value !== this.open) {
      handleToggle(this, open);
    }
  }
  constructor() {
    super();
    const button = this.querySelector(`[${selector6}-button]`);
    const content = this.querySelector(`[${selector6}-content]`);
    if (!(button instanceof HTMLButtonElement)) {
      throw new TypeError(
        `<${selector6}> must have a <button>-element with the attribute '${selector6}-button`
      );
    }
    if (!(content instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector6}> must have an element with the attribute '${selector6}-content'`
      );
    }
    this.button = button;
    this.content = content;
    this.timer = void 0;
    content.hidden = true;
    if (isNullableOrWhitespace(this.id)) {
      this.id = `palmer_popover_${++index2}`;
    }
    if (isNullableOrWhitespace(button.id)) {
      button.id = `${this.id}_button`;
    }
    if (isNullableOrWhitespace(content.id)) {
      content.id = `${this.id}_content`;
    }
    button.setAttribute("aria-controls", content.id);
    button.setAttribute("aria-expanded", false);
    button.setAttribute("aria-haspopup", "dialog");
    content.setAttribute("role", "dialog");
    content.setAttribute("aria-modal", false);
    content.setAttribute(selector4, "");
    store4.set(
      this,
      {
        keydown: onDocumentKeydown2.bind(this),
        pointer: onDocumentPointer.bind(this)
      }
    );
    setButtons(this);
  }
  hide() {
    this.open = false;
  }
  show() {
    this.open = true;
  }
  toggle() {
    handleToggle(this);
  }
};
customElements.define(selector6, PalmerPopover);

// src/splitter.js
var selector7 = "palmer-splitter";
var splitterTypes = /* @__PURE__ */ new Set(["horizontal", "vertical"]);
var store5 = /* @__PURE__ */ new WeakMap();
var index3 = 0;
function onDocumentKeydown3(event) {
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
  const stored = store5.get(component);
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
  separator.setAttribute("aria-valuenow", value);
  component.primary.style.flex = `${value / 100}`;
  component.secondary.style.flex = `${(100 - value) / 100}`;
  values.current = value;
  component.dispatchEvent(new CustomEvent("change", { detail: value }));
}
function updateHandle(component) {
  const { handle } = component;
  handle.hidden = false;
  handle.setAttribute("aria-hidden", true);
  handle.addEventListener(
    methods.begin,
    () => onPointerBegin(component),
    getOptions()
  );
}
function updateSeparator(component) {
  const { separator } = component;
  separator.hidden = false;
  separator.tabIndex = 0;
  separator.setAttribute("role", "separator");
  separator.setAttribute("aria-controls", component.primary.id);
  separator.setAttribute("aria-valuemax", 100);
  separator.setAttribute("aria-valuemin", 0);
  separator.setAttribute("aria-valuenow", 50);
  if (isNullableOrWhitespace(component.getAttribute("value"))) {
    setFlexValue(
      component,
      {
        separator,
        value: 50
      }
    );
  }
  separator.addEventListener(
    "keydown",
    (event) => onSeparatorKeydown(component, event),
    getOptions()
  );
}
var PalmerSplitter = class extends HTMLElement {
  /** @returns {number|undefined} */
  get max() {
    return store5.get(this)?.values.maximum;
  }
  /** @param {number} max */
  set max(max) {
    this.setAttribute("max", max);
  }
  /** @returns {number|undefined} */
  get min() {
    return store5.get(this)?.values.minimum;
  }
  /** @param {number} min */
  set min(min) {
    this.setAttribute("min", min);
  }
  /** @returns {'horizontal'|'vertical'} */
  get type() {
    const type = this.getAttribute("type") ?? "vertical";
    return splitterTypes.has(type) ? type : "vertical";
  }
  /** @param {'horizontal'|'vertical'} type */
  set type(type) {
    this.setAttribute("type", type);
  }
  /** @returns {number|undefined} */
  get value() {
    return store5.get(this)?.values.current;
  }
  /** @param {number} value */
  set value(value) {
    this.setAttribute("value", value);
  }
  constructor() {
    super();
    const panels = Array.from(
      this.querySelectorAll(`:scope > [${selector7}-panel]`)
    );
    if (panels.length !== 2 || panels.some((panel) => !(panel instanceof HTMLElement))) {
      throw new TypeError(
        `<${selector7}> must have two direct child elements with the attribute '${selector7}-panel'`
      );
    }
    const separator = this.querySelector(`:scope > [${selector7}-separator]`);
    const separatorHandle = separator?.querySelector(
      `:scope > [${selector7}-separator-handle]`
    );
    if ([separator, separatorHandle].some(
      (element) => !(element instanceof HTMLElement)
    )) {
      throw new TypeError(
        `<${selector7}> must have a separator element with the attribute '${selector7}-separator', and it must have a child element with the attribute '${selector7}-separator-handle'`
      );
    }
    const primary = panels[0];
    const secondary = panels[1];
    const children = Array.from(this.children);
    if (!(children.indexOf(primary) < children.indexOf(separator) && children.indexOf(separator) < children.indexOf(secondary))) {
      throw new TypeError(
        `<${selector7}> must have elements with the order of: panel, separator, panel`
      );
    }
    const stored = {
      callbacks: {
        keydown: onDocumentKeydown3.bind(this),
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
    this.primary = primary;
    this.secondary = secondary;
    this.handle = separatorHandle;
    this.separator = separator;
    if (isNullableOrWhitespace(primary.id)) {
      primary.id = `palmer_splitter_primary_panel_${++index3}`;
    }
    updateSeparator(this);
    updateHandle(this);
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
customElements.define(selector7, PalmerSplitter);

// src/tooltip.js
var selector8 = "palmer-tooltip";
var positionAttribute = `${selector8}-position`;
var store6 = /* @__PURE__ */ new WeakMap();
function createFloater(anchor) {
  const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
  const element = id === null ? null : document.querySelector(`#${id}`);
  if (element === null) {
    throw new TypeError(
      `A '${selector8}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`
    );
  }
  element.hidden = true;
  element.setAttribute("aria-hidden", true);
  element.setAttribute("role", "tooltip");
  element.setAttribute(`${selector8}-content`, "");
  return element;
}
function createTooltip(anchor) {
  if (!store6.has(anchor)) {
    store6.set(anchor, new PalmerTooltip(anchor));
  }
}
function destroyTooltip(anchor) {
  const tooltip = store6.get(anchor);
  if (tooltip === void 0) {
    return;
  }
  tooltip.handleCallbacks(false);
  store6.delete(anchor);
}
function observe2(records) {
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
var observer3 = new MutationObserver(observe2);
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
