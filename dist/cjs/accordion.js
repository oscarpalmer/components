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

// src/accordion.ts
var accordion_exports = {};
__export(accordion_exports, {
  PalmerAccordion: () => PalmerAccordion
});
module.exports = __toCommonJS(accordion_exports);

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

// src/accordion.ts
var keys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
  if (document.activeElement?.tagName !== "SUMMARY" || !keys.includes(event.key)) {
    return;
  }
  const stored = store.get(component);
  if (stored == null || stored.elements.length === 0) {
    return;
  }
  const current = stored.elements.indexOf(document.activeElement.parentElement);
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
      destination = stored.elements.length - 1;
      break;
    case "Home":
      destination = 0;
      break;
  }
  if (destination < 0) {
    destination = stored.elements.length - 1;
  } else if (destination >= stored.elements.length) {
    destination = 0;
  }
  if (destination === current) {
    return;
  }
  const summary = stored.elements[destination]?.querySelector(":scope > summary");
  if (summary != null) {
    summary.focus?.();
  }
}
function onToggle(component, element) {
  if (element.open && !component.multiple) {
    toggleDetails(component, element);
  }
}
function setDetails(component) {
  const stored = store.get(component);
  if (stored == null) {
    return;
  }
  stored.elements = [...component.querySelectorAll(":scope > details")];
  for (const element of stored.elements) {
    element.addEventListener("toggle", () => onToggle(component, element));
  }
}
function toggleDetails(component, active) {
  const stored = store.get(component);
  if (stored == null) {
    return;
  }
  for (const element of stored.elements) {
    if (element !== active && element.open) {
      element.open = false;
    }
  }
}
var PalmerAccordion = class extends HTMLElement {
  get multiple() {
    return this.getAttribute("multiple") !== "false";
  }
  set multiple(multiple) {
    if (typeof multiple === "boolean") {
      this.setAttribute("multiple", multiple);
    }
  }
  constructor() {
    super();
    const stored = {
      elements: [],
      observer: new MutationObserver((_) => setDetails(this))
    };
    store.set(this, stored);
    setDetails(this);
    this.addEventListener("keydown", (event) => onKeydown(this, event), eventOptions.active);
    if (!this.multiple) {
      toggleDetails(this, stored.elements.find((details) => details.open));
    }
  }
  attributeChangedCallback(name) {
    if (name === "multiple" && !this.multiple) {
      toggleDetails(this, store.get(this)?.elements.find((details) => details.open));
    }
  }
  connectedCallback() {
    store.get(this)?.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  disconnectedCallback() {
    store.get(this)?.observer.disconnect();
  }
};
__publicField(PalmerAccordion, "observedAttributes", ["max", "min", "value"]);
customElements.define("palmer-accordion", PalmerAccordion);
