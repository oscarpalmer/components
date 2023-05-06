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
var isTouchy = (() => {
  var _a;
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (media != null && typeof media.matches === "boolean") {
        return media.matches;
      }
    }
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || ((_a = navigator == null ? void 0 : navigator.msMaxTouchPoints) != null ? _a : 0) > 0;
  } catch (_) {
    return false;
  }
})();

// src/accordion.ts
var keys = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"];
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
  var _a, _b, _c;
  if (((_a = document.activeElement) == null ? void 0 : _a.tagName) !== "SUMMARY" || !keys.includes(event.key)) {
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
  const summary = (_b = stored.elements[destination]) == null ? void 0 : _b.querySelector(":scope > summary");
  if (summary != null) {
    (_c = summary.focus) == null ? void 0 : _c.call(summary);
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
    var _a;
    if (name === "multiple" && !this.multiple) {
      toggleDetails(this, (_a = store.get(this)) == null ? void 0 : _a.elements.find((details) => details.open));
    }
  }
  connectedCallback() {
    var _a;
    (_a = store.get(this)) == null ? void 0 : _a.observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  disconnectedCallback() {
    var _a;
    (_a = store.get(this)) == null ? void 0 : _a.observer.disconnect();
  }
};
__publicField(PalmerAccordion, "observedAttributes", ["max", "min", "value"]);
customElements.define("palmer-accordion", PalmerAccordion);
