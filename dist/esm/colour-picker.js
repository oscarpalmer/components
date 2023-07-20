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
var store = /* @__PURE__ */ new WeakMap();
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
  for (let index = 0; index < 3; index += 1) {
    rgb.push(Number.parseInt(pairs[index + 1], 16));
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
  store.set(this, stored);
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
  const stored = store.get(component);
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
  store.delete(component);
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
export {
  PalmerColourPicker
};
