// src/helpers/index.js
function isNullableOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/helpers/event.js
function getOptions(passive, capture) {
  return {
    capture: capture ?? false,
    passive: passive ?? true
  };
}

// src/disclosure.js
var selector = "palmer-disclosure";
var index = 0;
function toggle(component, open) {
  component.button.ariaExpanded = open;
  component.content.hidden = !open;
  component.dispatchEvent(new CustomEvent("toggle", { detail: open }));
  component.button.focus();
}
var PalmerDisclosure = class extends HTMLElement {
  /** @returns {boolean} */
  get open() {
    return /^true$/i.test(this.button.ariaExpanded);
  }
  /** @param {boolean} value */
  set open(value) {
    if (typeof value === "boolean" && value !== this.open) {
      toggle(this, value);
    }
  }
  constructor() {
    super();
    const button = this.querySelector(`[${selector}-button]`);
    const content = this.querySelector(`[${selector}-content]`);
    if (!(button instanceof HTMLButtonElement)) {
      throw new TypeError(
        `<${selector}> needs a <button>-element with the attribute '${selector}-button'`
      );
    }
    if (!(content instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector}> needs an element with the attribute '${selector}-content'`
      );
    }
    this.button = button;
    this.content = content;
    const { open } = this;
    button.hidden = false;
    content.hidden = !open;
    let { id } = content;
    if (isNullableOrWhitespace(id)) {
      id = `palmer_disclosure_${++index}`;
    }
    button.ariaExpanded = open;
    content.id = id;
    button.setAttribute("aria-controls", id);
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
customElements.define(selector, PalmerDisclosure);
export {
  PalmerDisclosure
};
