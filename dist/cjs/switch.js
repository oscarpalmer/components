"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/switch.ts
var switch_exports = {};
__export(switch_exports, {
  PalmerSwitch: () => PalmerSwitch
});
module.exports = __toCommonJS(switch_exports);

// src/helpers/index.ts
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
var isTouchy = (() => {
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (media != null && typeof media.matches === "boolean") {
        return media.matches;
      }
    }
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator?.msMaxTouchPoints ?? 0) > 0;
  } catch (_) {
    return false;
  }
})();
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/switch.ts
function getLabel(id, className, content) {
  const label = document.createElement("span");
  label.ariaHidden = true;
  label.className = `${className}__label`;
  label.id = `${id}_label`;
  label.innerHTML = content;
  return label;
}
function getStatus(className) {
  const status = document.createElement("span");
  status.ariaHidden = true;
  status.className = `${className}__status`;
  const indicator = document.createElement("span");
  indicator.className = `${className}__status__indicator`;
  status.appendChild(indicator);
  return status;
}
function getText(className, on, off) {
  const text = document.createElement("span");
  text.ariaHidden = true;
  text.className = `${className}__text`;
  text.appendChild(getTextItem("off", className, off));
  text.appendChild(getTextItem("on", className, on));
  return text;
}
function getTextItem(type, className, content) {
  const item = document.createElement("span");
  item.className = `${className}__text__${type}`;
  item.innerHTML = content;
  return item;
}
function initialise(component, label, input) {
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
    className = "palmer-switch";
  }
  if (isNullOrWhitespace(off)) {
    off = "Off";
  }
  if (isNullOrWhitespace(on)) {
    on = "On";
  }
  component.insertAdjacentElement("beforeend", getLabel(component.id, className, label.innerHTML));
  component.insertAdjacentElement("beforeend", getStatus(className));
  component.insertAdjacentElement("beforeend", getText(className, on, off));
  component.addEventListener("click", onToggle.bind(component), eventOptions.passive);
  component.addEventListener("keydown", onKey.bind(component), eventOptions.active);
}
function onKey(event) {
  if (![" ", "Enter"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  toggle(this);
}
function onToggle() {
  toggle(this);
}
function toggle(component) {
  if (component.disabled || component.readonly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var PalmerSwitch = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "internals");
    this.internals = this.attachInternals?.();
    const input = this.querySelector("[palmer-switch-input]");
    const label = this.querySelector("[palmer-switch-label]");
    if (typeof input === "undefined" || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new Error("<palmer-switch> must have an <input>-element with type 'checkbox' and the attribute 'palmer-switch-input'");
    }
    if (typeof label === "undefined" || !(label instanceof HTMLElement)) {
      throw new Error("<palmer-switch> must have an element with the attribute 'palmer-switch-label'");
    }
    initialise(this, label, input);
  }
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
    return this.internals?.form ?? void 0;
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
  checkValidity() {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity() {
    return this.internals?.reportValidity() ?? true;
  }
};
__publicField(PalmerSwitch, "formAssociated", true);
customElements.define("palmer-switch", PalmerSwitch);
