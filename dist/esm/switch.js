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
  label.parentElement?.removeChild(label);
  input.parentElement?.removeChild(input);
  setAttribute(component, "aria-checked", input.checked || component.checked);
  setAttribute(component, "aria-disabled", input.disabled || component.disabled);
  setAttribute(component, "aria-labelledby", `${input.id}_label`);
  setAttribute(component, "aria-readonly", input.readOnly || component.readonly);
  setAttribute(component, "value", input.value);
  component.id = input.id;
  component.name = input.name ?? input.id;
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
  internals;
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
    return this.internals?.form ?? void 0;
  }
  get labels() {
    return this.internals?.labels;
  }
  get name() {
    return this.getAttribute("name") ?? "";
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
    return this.internals?.validationMessage ?? "";
  }
  get validity() {
    return this.internals?.validity;
  }
  get value() {
    return this.getAttribute("value") ?? this.checked ? "on" : "off";
  }
  get willValidate() {
    return this.internals?.willValidate ?? true;
  }
  constructor() {
    super();
    this.internals = this.attachInternals?.();
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
  checkValidity() {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity() {
    return this.internals?.reportValidity() ?? true;
  }
};
__publicField(SwankySwitch, "formAssociated", true);
globalThis.customElements.define("swanky-switch", SwankySwitch);
