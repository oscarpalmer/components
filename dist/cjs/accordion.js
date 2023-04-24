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

// src/accordion.ts
var keys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];
function onKeydown(component, event) {
  var _a, _b, _c;
  if (((_a = document.activeElement) == null ? void 0 : _a.tagName) !== "SUMMARY" || !keys.includes(event.key) || component.details.length === 0) {
    return;
  }
  const current = component.details.indexOf(document.activeElement.parentElement);
  if (current === -1) {
    return;
  }
  event.preventDefault();
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
  const summary = (_b = component.details[destination]) == null ? void 0 : _b.querySelector(":scope > summary");
  if (summary != null) {
    (_c = summary.focus) == null ? void 0 : _c.call(summary);
  }
}
function updateChildren(component) {
  component.details.splice(0);
  component.details.push(...component.querySelectorAll(":scope > details"));
}
var AccurateAccordion = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "observer");
    __publicField(this, "details", []);
    updateChildren(this);
    this.observer = new MutationObserver((_) => updateChildren(this));
    this.addEventListener("keydown", (event) => onKeydown(this, event), eventOptions.active);
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
customElements.define("accurate-accordion", AccurateAccordion);
