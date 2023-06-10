// src/helpers/index.js
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/switch.js
var selector = "palmer-switch";
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
    className = selector;
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
  component.addEventListener(
    "click",
    onToggle.bind(component),
    eventOptions.passive
  );
  component.addEventListener(
    "keydown",
    onKey.bind(component),
    eventOptions.active
  );
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
function render(id, className, text) {
  return `<span class="${className}__label" id="${id}_label" aria-hidden="true">${text.label}</span><div class="${className}__status" aria-hidden="true"><span class="${className}__status__indicator"></span></div><div class="${className}__text" aria-hidden="true"><span class="${className}__text__off">${text.off}</span><span class="${className}__text__on">${text.on}</span></div>`;
}
function toggle(component) {
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
    const input = this.querySelector(`[${selector}-input]`);
    const label = this.querySelector(`[${selector}-label]`);
    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new TypeError(
        `<${selector}> must have an <input>-element with type 'checkbox' and the attribute '${selector}-input'`
      );
    }
    if (!(label instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector}> must have an element with the attribute '${selector}-label'`
      );
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
PalmerSwitch.formAssociated = true;
customElements.define(selector, PalmerSwitch);
export {
  PalmerSwitch
};
