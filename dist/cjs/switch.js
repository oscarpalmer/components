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
function getAttribute(element, attribute, defaultValue) {
  const value = element.getAttribute(attribute);
  return value == null || value.trim().length === 0 ? defaultValue : value;
}
function setAttribute(element, attribute, value) {
  if (value == null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, String(value));
  }
}

// src/switch.ts
function initialise(component, label, input) {
  var _a, _b, _c;
  (_a = label.parentElement) == null ? void 0 : _a.removeChild(label);
  (_b = input.parentElement) == null ? void 0 : _b.removeChild(input);
  setAttribute(component, "aria-checked", input.checked || component.checked);
  setAttribute(component, "aria-disabled", input.disabled || component.disabled);
  setAttribute(component, "aria-labelledby", `${input.id}_label`);
  setAttribute(component, "aria-readonly", input.readOnly || component.readonly);
  setAttribute(component, "value", input.value);
  component.id = input.id;
  component.name = (_c = input.name) != null ? _c : input.id;
  component.role = "switch";
  component.tabIndex = 0;
  const off = getAttribute(component, "swanky-switch-off", "Off");
  const on = getAttribute(component, "swanky-switch-on", "On");
  component.insertAdjacentHTML("afterbegin", render(input.id, label, off, on));
  component.addEventListener("click", onToggle.bind(component), eventOptions.passive);
  component.addEventListener("keydown", onKey.bind(component), eventOptions.passive);
}
function onKey(event) {
  if ((event.key === " " || event.key === "Enter") && this instanceof SwankySwitch) {
    toggle(this);
  }
}
function onToggle() {
  if (this instanceof SwankySwitch) {
    toggle(this);
  }
}
function render(id, label, off, on) {
  return `<swanky-switch-label id="${id}_label">${label.innerHTML}</swanky-switch-label>
<swanky-switch-status aria-hidden="true">
	<swanky-switch-status-indicator></swanky-switch-status-indicator>
</swanky-switch-status>
<swanky-switch-text aria-hidden="true">
	<swanky-switch-text-off>${off}</swanky-switch-text-off>
	<swanky-switch-text-on>${on}</swanky-switch-text-on>
</swanky-switch-text>`;
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
    setAttribute(this, "aria-checked", checked);
  }
  get disabled() {
    return this.getAttribute("aria-disabled") === "true";
  }
  set disabled(disabled) {
    setAttribute(this, "aria-disabled", disabled);
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
    setAttribute(this, "name", name);
  }
  get readonly() {
    return this.getAttribute("aria-readonly") === "true";
  }
  set readonly(readonly) {
    setAttribute(this, "aria-readonly", readonly);
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
    return ((_a = this.getAttribute("value")) != null ? _a : this.checked) ? "on" : "off";
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
globalThis.customElements.define("swanky-switch", SwankySwitch);
