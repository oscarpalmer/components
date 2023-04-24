"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/helpers/index.ts
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
function isNullOrWhitespace(value) {
  return (value != null ? value : "").trim().length === 0;
}

// src/switch.ts
function getLabel(id, content) {
  const label = document.createElement("span");
  label.ariaHidden = true;
  label.className = "swanky-switch__label";
  label.id = `${id}_label`;
  label.innerHTML = content;
  return label;
}
function getStatus() {
  const status = document.createElement("span");
  status.ariaHidden = true;
  status.className = "swanky-switch__status";
  const indicator = document.createElement("span");
  indicator.className = "swanky-switch__status__indicator";
  status.appendChild(indicator);
  return status;
}
function getText(on, off) {
  const text = document.createElement("span");
  text.ariaHidden = true;
  text.className = "swanky-switch__text";
  const textOff = document.createElement("span");
  textOff.className = "swanky-switch__text__off";
  textOff.innerHTML = off;
  const textOn = document.createElement("span");
  textOn.className = "swanky-switch__text__on";
  textOn.innerHTML = on;
  text.appendChild(textOff);
  text.appendChild(textOn);
  return text;
}
function initialise(component, label, input) {
  var _a, _b, _c;
  (_a = label.parentElement) == null ? void 0 : _a.removeChild(label);
  (_b = input.parentElement) == null ? void 0 : _b.removeChild(input);
  component.setAttribute("aria-checked", input.checked || component.checked);
  component.setAttribute("aria-disabled", input.disabled || component.disabled);
  component.setAttribute("aria-labelledby", `${input.id}_label`);
  component.setAttribute("aria-readonly", input.readOnly || component.readonly);
  component.setAttribute("value", input.value);
  component.id = input.id;
  component.name = (_c = input.name) != null ? _c : input.id;
  component.role = "switch";
  component.tabIndex = 0;
  let off = component.getAttribute("swanky-switch-off");
  let on = component.getAttribute("swanky-switch-on");
  if (isNullOrWhitespace(off)) {
    off = "Off";
  }
  if (isNullOrWhitespace(on)) {
    on = "On";
  }
  component.insertAdjacentElement("beforeend", getLabel(component.id, label.innerHTML));
  component.insertAdjacentElement("beforeend", getStatus());
  component.insertAdjacentElement("beforeend", getText(on, off));
  component.addEventListener("click", onToggle.bind(component), eventOptions.passive);
  component.addEventListener("keydown", onKey.bind(component), eventOptions.active);
}
function onKey(event) {
  if (!(this instanceof SwankySwitch) || ![" ", "Enter"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  toggle(this);
}
function onToggle() {
  if (this instanceof SwankySwitch) {
    toggle(this);
  }
}
function toggle(component) {
  if (component.disabled || component.readonly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var SwankySwitch = class extends HTMLElement {
  constructor() {
    var _a;
    super();
    __publicField(this, "internals");
    this.internals = (_a = this.attachInternals) == null ? void 0 : _a.call(this);
    const input = this.querySelector("[swanky-switch-input]");
    const label = this.querySelector("[swanky-switch-label]");
    if (typeof input === "undefined" || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");
    }
    if (typeof label === "undefined" || !(label instanceof HTMLElement)) {
      throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");
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
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.form) != null ? _b : void 0;
  }
  get labels() {
    var _a;
    return (_a = this.internals) == null ? void 0 : _a.labels;
  }
  get name() {
    var _a;
    return (_a = this.getAttribute("name")) != null ? _a : "";
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
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.validationMessage) != null ? _b : "";
  }
  get validity() {
    var _a;
    return (_a = this.internals) == null ? void 0 : _a.validity;
  }
  get value() {
    var _a;
    return (_a = this.getAttribute("value")) != null ? _a : this.checked ? "on" : "off";
  }
  get willValidate() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.willValidate) != null ? _b : true;
  }
  checkValidity() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.checkValidity()) != null ? _b : true;
  }
  reportValidity() {
    var _a, _b;
    return (_b = (_a = this.internals) == null ? void 0 : _a.reportValidity()) != null ? _b : true;
  }
};
__publicField(SwankySwitch, "formAssociated", true);
customElements.define("swanky-switch", SwankySwitch);
