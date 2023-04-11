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

// src/accordion.ts
var keys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];
function onKeydown(component, event) {
  if (document.activeElement?.tagName !== "SUMMARY" || !keys.includes(event.key) || component.details.length === 0) {
    return;
  }
  const current = component.details.indexOf(document.activeElement.parentElement);
  if (current === -1) {
    return;
  }
  let destination = -1;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowRight":
      destination = current + 1;
      break;
    case "ArrowLeft":
    case "ArrowUp":
      destination = current - 1;
      break;
    case "End":
      destination = component.details.length - 1;
      break;
    case "Home":
      destination = 0;
      break;
  }
  if (destination < 0) {
    destination = component.details.length - 1;
  } else if (destination >= component.details.length) {
    destination = 0;
  }
  if (destination === current) {
    return;
  }
  const summary = component.details[destination]?.querySelector(":scope > summary");
  if (summary != null) {
    summary.focus?.();
  }
}
function updateChildren(component) {
  component.details.splice(0);
  component.details.push(...component.querySelectorAll(":scope > details"));
}
var AccurateAccordion = class extends HTMLElement {
  observer;
  details = [];
  constructor() {
    super();
    updateChildren(this);
    this.observer = new MutationObserver((_) => updateChildren(this));
    this.addEventListener("keydown", (event) => onKeydown(this, event), eventOptions.passive);
  }
  connectedCallback() {
    this.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  disconnectedCallback() {
    this.observer.disconnect();
  }
};
globalThis.customElements.define("accurate-accordion", AccurateAccordion);
