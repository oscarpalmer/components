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
function setProperty(element, property, value) {
  element.setAttribute(property, String(typeof value === "boolean" ? value : false));
}

// src/switch.ts
function initialise(component, label, input) {
  label.parentElement?.removeChild(label);
  input.parentElement?.removeChild(input);
  setProperty(component, "aria-checked", input.checked || component.checked);
  setProperty(component, "aria-disabled", input.disabled || component.disabled);
  setProperty(component, "aria-readonly", input.readOnly || component.readOnly);
  component.setAttribute("aria-labelledby", `${input.id}_label`);
  component.setAttribute("id", input.id);
  component.setAttribute("name", input.name ?? input.id);
  component.setAttribute("role", "switch");
  component.setAttribute("tabindex", "0");
  component.setAttribute("value", input.value);
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
  if (component.disabled || component.readOnly) {
    return;
  }
  component.checked = !component.checked;
  component.dispatchEvent(new Event("change"));
}
var SwankySwitch = class extends HTMLElement {
  get checked() {
    return this.getAttribute("aria-checked") === "true";
  }
  set checked(checked) {
    setProperty(this, "aria-checked", checked);
  }
  get disabled() {
    return this.getAttribute("aria-disabled") === "true";
  }
  set disabled(disabled) {
    setProperty(this, "aria-disabled", disabled);
  }
  get readOnly() {
    return this.getAttribute("aria-readonly") === "true";
  }
  set readOnly(readonly) {
    setProperty(this, "aria-readonly", readonly);
  }
  get value() {
    return this.checked ? "on" : "off";
  }
  constructor() {
    super();
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
};
globalThis.customElements.define("swanky-switch", SwankySwitch);
