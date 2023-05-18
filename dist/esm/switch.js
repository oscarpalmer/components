var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/helpers/index.js
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/switch.js
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
  status.append(indicator);
  return status;
}
function getText(className, on, off) {
  const text = document.createElement("span");
  text.ariaHidden = true;
  text.className = `${className}__text`;
  text.append(getTextItem("off", className, off));
  text.append(getTextItem("on", className, on));
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
    /**
     * @private
     * @type {ElementInternals|undefined}
     */
    __publicField(this, "internals");
    this.internals = this.attachInternals?.();
    const input = this.querySelector("[palmer-switch-input]");
    const label = this.querySelector("[palmer-switch-label]");
    if (input === null || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new TypeError("<palmer-switch> must have an <input>-element with type 'checkbox' and the attribute 'palmer-switch-input'");
    }
    if (label === null || !(label instanceof HTMLElement)) {
      throw new TypeError("<palmer-switch> must have an element with the attribute 'palmer-switch-label'");
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
  checkValidity() {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity() {
    return this.internals?.reportValidity() ?? true;
  }
};
__publicField(PalmerSwitch, "formAssociated", true);
customElements.define("palmer-switch", PalmerSwitch);
export {
  PalmerSwitch
};
