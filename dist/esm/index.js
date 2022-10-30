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
var focusableSelector = ["[href]", "[tabindex]", "button", "input", "select", "textarea"].map((selector) => `${selector}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");
function delay(callback) {
  return globalThis.requestAnimationFrame?.(callback) ?? globalThis.setTimeout?.(() => {
    callback(Date.now());
  }, 16);
}
function findParent(element, matches) {
  if (matches(element)) {
    return element;
  }
  let parent = element?.parentElement;
  while (parent != null) {
    if (parent === document.body) {
      return;
    }
    if (matches(parent)) {
      break;
    }
    parent = parent.parentElement;
  }
  return parent ?? void 0;
}
function getAttribute(element, attribute2, defaultValue) {
  const value = element.getAttribute(attribute2);
  return value == null || value.trim().length === 0 ? defaultValue : value;
}
function getFocusableElements(context) {
  const focusable = [];
  const elements = Array.from(context.querySelectorAll(focusableSelector));
  for (const element of elements) {
    const style = globalThis.getComputedStyle?.(element);
    if (style == null || style.display !== "none" && style.visibility !== "hidden") {
      focusable.push(element);
    }
  }
  return focusable;
}
function isNullOrWhitespace(value) {
  if (value == null) {
    return true;
  }
  return value.trim().length === 0;
}
function render(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, ...parts) => {
    if (parts == null || parts.length === 0) {
      return match;
    }
    return String(variables?.[parts[0]] ?? match);
  });
}
function setAttribute(element, attribute2, value) {
  if (value == null) {
    element.removeAttribute(attribute2);
  } else {
    element.setAttribute(attribute2, String(value));
  }
}
function setProperty(element, property, value) {
  if (typeof value === "boolean") {
    element?.setAttribute(property, String(value));
  }
}

// src/details.ts
var Manager = class {
  static destroyList(component) {
    const { children, observer: observer2, open } = Store.list;
    children.delete(component);
    open.delete(component);
    observer2.get(component)?.disconnect();
    observer2.delete(component);
  }
  static getChildren(component) {
    return Array.from(component.querySelectorAll(":scope > delicious-details > details, :scope > details"));
  }
  static initializeList(component) {
    const { children, observer: observer2, open } = Store.list;
    children.set(component, Manager.getChildren(component));
    open.set(component, []);
    observer2.set(component, new MutationObserver((records) => {
      Observer.callback(component, records);
    }));
    observer2.get(component)?.observe(component, Observer.options);
    Manager.open(component, getAttribute(component, "open", ""));
  }
  static onGlobalKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }
    const { containers } = Store.details;
    const parent = findParent(document.activeElement, (element) => containers.has(element) && (containers.get(element)?.open ?? true));
    if (parent instanceof DeliciousDetails) {
      Manager.onToggle.call(parent, false);
    }
  }
  static onLocalKeydown(event) {
    if (event.isComposing || event.key !== "ArrowDown" && event.key !== "ArrowUp" || !(this instanceof DeliciousDetailsList)) {
      return;
    }
    const { target } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const children = Store.list.children.get(this) ?? [];
    const parent = target.parentElement;
    const index2 = children.indexOf(parent);
    if (index2 === -1) {
      return;
    }
    let position = index2 + (event.key === "ArrowDown" ? 1 : -1);
    if (position < 0) {
      position = children.length - 1;
    } else if (position >= children.length) {
      position = 0;
    }
    const details = children[position];
    const summary = details?.querySelector(":scope > summary");
    summary?.focus();
  }
  static onToggle(open) {
    if (!(this instanceof DeliciousDetails)) {
      return;
    }
    const { buttons, containers } = Store.details;
    const container = containers.get(this);
    if (container == null) {
      return;
    }
    container.open = open ?? !container.open;
    if (!container.open) {
      buttons.get(this)?.focus();
    }
  }
  static open(component, value) {
    if (value == null) {
      Manager.update(component, []);
      return;
    }
    if (value.length > 0 && !/^[\s\d,]+$/.test(value)) {
      throw new Error("The 'selected'-attribute of a 'delicious-details-list'-element must be a comma-separated string of numbers, e.g. '', '0' or '0,1,2'");
    }
    const parts = value.length > 0 ? value.split(",").filter((index2) => index2.trim().length > 0).map((index2) => Number.parseInt(index2, 10)) : [];
    Manager.update(component, parts);
  }
  static update(component, selection) {
    if (typeof selection === "undefined") {
      return;
    }
    const { children, observer: observer2, open } = Store.list;
    let sorted = selection.filter((value, index2, array) => array.indexOf(value) === index2).sort((first, second) => first - second);
    if (!component.multiple) {
      sorted = sorted.length > 0 && sorted[0] != null ? sorted.length > 1 ? [sorted[0]] : sorted : [];
    }
    const current = component.open;
    if (sorted.length === current.length && sorted.every((value, index2) => current[index2] === value)) {
      return;
    }
    observer2.get(component)?.disconnect();
    const elements = children.get(component) ?? [];
    for (const element of elements) {
      if (sorted.includes(elements.indexOf(element)) !== element.open) {
        element.open = !element.open;
      }
    }
    delay(() => {
      open.set(component, sorted);
      setAttribute(component, "open", sorted.length === 0 ? null : sorted);
      component.dispatchEvent(new Event("toggle"));
      delay(() => observer2.get(component)?.observe(component, Observer.options));
    });
  }
};
var Observer = class {
  static callback(component, records) {
    if (records.length === 0) {
      return;
    }
    const { children } = Store.list;
    const record = records[0];
    const added = Array.from(record?.addedNodes ?? []);
    const removed = Array.from(record?.removedNodes ?? []);
    if (added.concat(removed).some((element2) => element2.parentElement === component)) {
      children.set(component, Manager.getChildren(component));
      return;
    }
    if (record?.type !== "attributes" || !(record?.target instanceof HTMLDetailsElement)) {
      return;
    }
    const element = record.target;
    const elements = children.get(component) ?? [];
    const index2 = elements.indexOf(element);
    if (index2 === -1) {
      return;
    }
    let selection = [];
    if (component.multiple) {
      selection = element.open ? component.open.concat([index2]) : component.open.filter((v) => v !== index2);
    } else {
      selection = element.open ? [index2] : [];
    }
    Manager.update(component, selection);
  }
};
__publicField(Observer, "options", {
  attributeFilter: ["open"],
  attributes: true,
  childList: true,
  subtree: true
});
var Store = class {
};
__publicField(Store, "details", {
  buttons: /* @__PURE__ */ new WeakMap(),
  containers: /* @__PURE__ */ new WeakMap()
});
__publicField(Store, "list", {
  children: /* @__PURE__ */ new WeakMap(),
  observer: /* @__PURE__ */ new WeakMap(),
  open: /* @__PURE__ */ new WeakMap()
});
var DeliciousDetails = class extends HTMLElement {
  get open() {
    return Store.details.containers.get(this)?.open ?? false;
  }
  set open(open) {
    Manager.onToggle.call(this, open);
  }
  connectedCallback() {
    const details = this.querySelector(":scope > details");
    const summary = details?.querySelector(":scope > summary");
    Store.details.buttons.set(this, summary);
    Store.details.containers.set(this, details);
  }
  disconnectedCallback() {
    Store.details.buttons.delete(this);
    Store.details.containers.delete(this);
  }
  toggle() {
    Manager.onToggle.call(this);
  }
};
var DeliciousDetailsList = class extends HTMLElement {
  static get observedAttributes() {
    return ["multiple", "open"];
  }
  get multiple() {
    return this.getAttribute("multiple") != null;
  }
  set multiple(multiple) {
    setAttribute(this, "multiple", multiple ? "" : null);
  }
  get open() {
    return Store.list.open.get(this) ?? [];
  }
  set open(indices) {
    Manager.update(this, indices);
  }
  constructor() {
    super();
    this.addEventListener("keydown", Manager.onLocalKeydown.bind(this), eventOptions.passive);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }
    switch (name) {
      case "multiple":
        Manager.open(this, getAttribute(this, "open", ""));
        break;
      case "open":
        Manager.open(this, newValue);
        break;
      default:
        break;
    }
  }
  connectedCallback() {
    Manager.initializeList(this);
  }
  disconnectedCallback() {
    Manager.destroyList(this);
  }
};
globalThis.addEventListener("keydown", Manager.onGlobalKeydown, eventOptions.passive);
globalThis.customElements.define("delicious-details", DeliciousDetails);
globalThis.customElements.define("delicious-details-list", DeliciousDetailsList);

// src/helpers/floated.ts
var Floated = class {
  static update(elements, types3, callbacks) {
    const { anchor, floater, parent } = elements;
    const { after, getPosition, validate } = callbacks;
    function step() {
      if (!validate()) {
        return;
      }
      const type = Floated.getType(parent ?? anchor, types3);
      const position = getPosition(type, {
        anchor: anchor.getBoundingClientRect(),
        floater: floater.getBoundingClientRect(),
        parent: parent?.getBoundingClientRect()
      });
      Floated.setPosition(floater, position);
      after?.();
      delay(step);
    }
    delay(step);
  }
  static getType(element, types3) {
    const position = getAttribute(element, "position", types3.default);
    return types3.all.includes(position) ? position : types3.default;
  }
  static setPosition(floater, position) {
    const { left, top } = position.coordinate;
    if (floater.getAttribute("position") !== position.type) {
      floater.setAttribute("position", position.type);
    }
    const matrix = `matrix(1, 0, 0, 1, ${left}, ${top})`;
    if (floater.style.transform === matrix) {
      return;
    }
    floater.style.inset = "0 auto auto 0";
    floater.style.position = "fixed";
    floater.style.transform = matrix;
    if (floater.hidden) {
      delay(() => {
        floater.hidden = false;
      });
    }
  }
};

// src/popover.ts
var index = 0;
var types = ["any"].concat(...["above", "below"].map((position) => [position, `${position}-left`, `${position}-right`]));
var Manager2 = class {
  static getPosition(type, elements) {
    const left = Manager2.getValue(type, ["left", "right"], elements, true);
    const top = Manager2.getValue(type, ["below", "above"], elements, false);
    const suffix = elements.anchor.left === left ? "left" : "right";
    if (type !== "any") {
      return {
        coordinate: { left, top },
        type: ["above", "below"].includes(type) ? `${type}-${suffix}` : type
      };
    }
    const prefix = elements.anchor.bottom === top ? "below" : "above";
    return {
      coordinate: { left, top },
      type: `${prefix}-${suffix}`
    };
  }
  static getValue(type, types3, elements, left) {
    const { anchor, floater } = elements;
    const floaterSize = left ? floater.width : floater.height;
    const defaultValue = left ? anchor.left : anchor.bottom;
    const minValue = (left ? anchor.right : anchor.top) - floaterSize;
    if (types3.some((t) => type.includes(t))) {
      return type.includes(types3[0] ?? "_") ? defaultValue : minValue;
    }
    const maxValue = defaultValue + floaterSize;
    if (maxValue <= (left ? globalThis.innerWidth : globalThis.innerHeight)) {
      return defaultValue;
    }
    return minValue < 0 ? defaultValue : minValue;
  }
  static initialize(component, anchor, floater) {
    floater.hidden = true;
    if (isNullOrWhitespace(floater.id)) {
      floater.setAttribute("id", isNullOrWhitespace(component.id) ? `polite_popover_${index++}` : `${component.id}_content`);
    }
    setAttribute(anchor, "aria-controls", floater.id);
    setProperty(anchor, "aria-expanded", false);
    setAttribute(floater, "role", "dialog");
    setAttribute(floater, "tabindex", "-1");
    setProperty(floater, "aria-modal", true);
    anchor.addEventListener("click", Manager2.toggle.bind(component), eventOptions.passive);
  }
  static onClick(event) {
    if (!(this instanceof PolitePopover) || !this.open) {
      return;
    }
    const anchor = Store2.values.anchors.get(this);
    const floater = Store2.values.floaters.get(this);
    if (event.target !== anchor && event.target !== floater && !(floater?.contains(event.target) ?? false)) {
      Manager2.toggle.call(this, false);
    }
  }
  static onKeydown(event) {
    if (!(this instanceof PolitePopover) || !this.open || !(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === "Escape") {
      Manager2.toggle.call(this, false);
    }
    const floater = Store2.values.floaters.get(this);
    if (event.key !== "Tab" || floater == null) {
      return;
    }
    event.preventDefault();
    const elements = getFocusableElements(floater);
    if (document.activeElement === floater) {
      delay(() => {
        (elements[event.shiftKey ? elements.length - 1 : 0] ?? floater).focus();
      });
      return;
    }
    const index2 = elements.indexOf(document.activeElement);
    let element = floater;
    if (index2 > -1) {
      let position = index2 + (event.shiftKey ? -1 : 1);
      if (position < 0) {
        position = elements.length - 1;
      } else if (position >= elements.length) {
        position = 0;
      }
      element = elements[position] ?? floater;
    }
    delay(() => {
      element.focus();
    });
  }
  static toggle(expand) {
    if (!(this instanceof PolitePopover)) {
      return;
    }
    const anchor = Store2.values.anchors.get(this);
    const floater = Store2.values.floaters.get(this);
    if (anchor == null || floater == null) {
      return;
    }
    const expanded = typeof expand === "boolean" ? !expand : this.open;
    const click = Store2.values.click.get(this);
    const keydown = Store2.values.keydown.get(this);
    const method = expanded ? "removeEventListener" : "addEventListener";
    if (click != null) {
      document[method]("click", click, eventOptions.passive);
    }
    if (keydown != null) {
      document[method]("keydown", keydown, eventOptions.active);
    }
    floater.hidden = expanded;
    setProperty(anchor, "aria-expanded", !expanded);
    this.dispatchEvent(new Event("toggle"));
    if (expanded) {
      anchor.focus();
      return;
    }
    let called = false;
    Floated.update(
      { anchor, floater, parent: this },
      { all: types, default: "below" },
      {
        after() {
          if (called) {
            return;
          }
          called = true;
          delay(() => {
            (getFocusableElements(floater)[0] ?? floater).focus();
          });
        },
        getPosition: Manager2.getPosition,
        validate: () => this.open
      }
    );
  }
};
var _Store = class {
  static add(component) {
    const button = component.querySelector(":scope > [polite-popover-button]");
    const content = component.querySelector(":scope > [polite-popover-content]");
    if (button == null || content == null) {
      return;
    }
    _Store.values.anchors?.set(component, button);
    _Store.values.floaters?.set(component, content);
    _Store.values.click?.set(component, Manager2.onClick.bind(component));
    _Store.values.keydown?.set(component, Manager2.onKeydown.bind(component));
  }
  static remove(component) {
    const floater = _Store.values.floaters.get(component);
    if (floater != null) {
      floater.hidden = true;
      component.appendChild(floater);
    }
    _Store.values.anchors.delete(component);
    _Store.values.floaters.delete(component);
    _Store.values.click.delete(component);
    _Store.values.keydown.delete(component);
  }
};
var Store2 = _Store;
__publicField(Store2, "values", {
  anchors: /* @__PURE__ */ new WeakMap(),
  click: /* @__PURE__ */ new WeakMap(),
  floaters: /* @__PURE__ */ new WeakMap(),
  keydown: /* @__PURE__ */ new WeakMap()
});
var PolitePopover = class extends HTMLElement {
  get button() {
    return Store2.values.anchors.get(this);
  }
  get content() {
    return Store2.values.floaters.get(this);
  }
  get open() {
    return this.button?.getAttribute("aria-expanded") === "true";
  }
  set open(open) {
    Manager2.toggle.call(this, open);
  }
  constructor() {
    super();
    const anchor = this.querySelector(":scope > [polite-popover-button]");
    const floater = this.querySelector(":scope > [polite-popover-content]");
    if (anchor == null || !(anchor instanceof HTMLButtonElement || anchor instanceof HTMLElement && anchor.getAttribute("role") === "button")) {
      throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");
    }
    if (floater == null || !(floater instanceof HTMLElement)) {
      throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");
    }
    Manager2.initialize(this, anchor, floater);
  }
  connectedCallback() {
    Store2.add(this);
  }
  disconnectedCallback() {
    Store2.remove(this);
  }
  toggle() {
    Manager2.toggle.call(this);
  }
};
globalThis.customElements.define("polite-popover", PolitePopover);

// src/switch.ts
var templates = {
  full: "{{label}}{{indicator}}{{status}}",
  indicator: '<div class="swanky-switch__indicator" aria-hidden="true"><span class="swanky-switch__indicator__value"></span></div>',
  label: '<div id="{{id}}" class="swanky-switch__label">{{html}}</div>',
  status: {
    item: '<span class="swanky-switch__status__{{type}}">{{html}}</span>',
    wrapper: '<div class="swanky-switch__status" aria-hidden="true">{{off}}{{on}}</div>'
  }
};
var Manager3 = class {
  static addListeners(component) {
    component.addEventListener("click", Manager3.onToggle.bind(component), eventOptions.passive);
    component.addEventListener("keydown", Manager3.onKey.bind(component), eventOptions.passive);
  }
  static initialize(component, label, input) {
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
    component.insertAdjacentHTML("afterbegin", Manager3.render(input.id, label, off, on));
    Manager3.addListeners(component);
  }
  static onKey(event) {
    if ((event.key === " " || event.key === "Enter") && this instanceof SwankySwitch) {
      Manager3.toggle(this);
    }
  }
  static onToggle() {
    if (this instanceof SwankySwitch) {
      Manager3.toggle(this);
    }
  }
  static render(id, label, off, on) {
    return render(templates.full, {
      indicator: templates.indicator,
      label: render(templates.label, {
        html: label.innerHTML,
        id: `${id}_label`
      }),
      status: render(templates.status.wrapper, {
        off: render(templates.status.item, {
          html: off,
          type: "off"
        }),
        on: render(templates.status.item, {
          html: on,
          type: "on"
        })
      })
    });
  }
  static toggle(component) {
    if (component.disabled || component.readOnly) {
      return;
    }
    component.checked = !component.checked;
    component.dispatchEvent(new Event("change"));
  }
};
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
    if (this.querySelector(".swanky-switch__label") != null) {
      Manager3.addListeners(this);
      return;
    }
    const input = this.querySelector("[swanky-switch-input]");
    const label = this.querySelector("[swanky-switch-label]");
    if (typeof input === "undefined" || !(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");
    }
    if (typeof label === "undefined" || !(label instanceof HTMLElement)) {
      throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");
    }
    Manager3.initialize(this, label, input);
  }
};
globalThis.customElements.define("swanky-switch", SwankySwitch);

// src/tooltip.ts
var attribute = "toasty-tooltip";
var contentAttribute = `${attribute}-content`;
var store = /* @__PURE__ */ new WeakMap();
var types2 = ["above", "below", "horizontal", "left", "right", "vertical"];
var Manager4 = class {
  static getPosition(type, elements) {
    const left = Manager4.getValue(type, ["horizontal", "left", "right"], elements, true);
    const top = Manager4.getValue(type, ["vertical", "above", "below"], elements, false);
    if (!["horizontal", "vertical"].includes(type)) {
      return { coordinate: { left, top }, type };
    }
    return {
      coordinate: { left, top },
      type: type === "horizontal" ? left === elements.anchor.right ? "right" : "left" : top === elements.anchor.bottom ? "below" : "above"
    };
  }
  static getValue(type, types3, elements, left) {
    const { anchor, floater } = elements;
    const anchorMax = left ? anchor.right : anchor.bottom;
    const anchorMin = left ? anchor.left : anchor.top;
    const floaterSize = left ? floater.width : floater.height;
    const index2 = types3.indexOf(type);
    if (index2 === -1) {
      return anchorMin + (left ? anchor.width : anchor.height) / 2 - floaterSize / 2;
    }
    const minValue = anchorMin - floaterSize;
    if (index2 > 0) {
      return index2 === 1 ? minValue : anchorMax;
    }
    const maxValue = anchorMax + floaterSize;
    if (maxValue <= (left ? globalThis.innerWidth : globalThis.innerHeight)) {
      return anchorMax;
    }
    return minValue < 0 ? anchorMax : minValue;
  }
  static observer(entries) {
    for (const entry of entries) {
      if (entry.type !== "attributes") {
        continue;
      }
      const element = entry.target;
      if (element.getAttribute(attribute) == null) {
        Tooltip.destroy(element);
      } else {
        Tooltip.create(element);
      }
    }
  }
};
var Tooltip = class {
  constructor(anchor) {
    this.anchor = anchor;
    this.floater = Tooltip.getFloater(anchor);
    this.focusable = anchor.matches(focusableSelector);
    this.callbacks = {
      click: this.onClick.bind(this),
      hide: this.onHide.bind(this),
      key: this.onKey.bind(this),
      show: this.onShow.bind(this)
    };
    this.handleCallbacks(true);
  }
  floater;
  callbacks;
  focusable;
  static create(anchor) {
    if (!store.has(anchor)) {
      store.set(anchor, new Tooltip(anchor));
    }
  }
  static destroy(element) {
    const tooltip = store.get(element);
    if (typeof tooltip === "undefined") {
      return;
    }
    tooltip.handleCallbacks(false);
    store.delete(element);
  }
  static getFloater(anchor) {
    const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
    const floater = id == null ? null : document.getElementById(id);
    if (floater == null) {
      throw new Error(`A '${attribute}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby' attribute.`);
    }
    floater.hidden = true;
    setAttribute(floater, contentAttribute, "");
    setAttribute(floater, "role", "tooltip");
    setProperty(floater, "aria-hidden", true);
    return floater;
  }
  onClick(event) {
    const parent = findParent(event.target, (element) => element.hasAttribute(contentAttribute));
    if (parent !== this.floater) {
      this.handleFloater(false);
    }
  }
  onHide() {
    this.handleFloater(false);
  }
  onKey(event) {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      this.handleFloater(false);
    }
  }
  onShow() {
    const { anchor, floater } = this;
    this.handleFloater(true);
    Floated.update(
      { anchor, floater },
      { all: types2, default: "above" },
      {
        getPosition: Manager4.getPosition,
        validate: () => !floater.hidden
      }
    );
  }
  handleCallbacks(add) {
    const { anchor, callbacks, floater, focusable } = this;
    const method = add ? "addEventListener" : "removeEventListener";
    for (const element of [anchor, floater]) {
      element[method]("mouseenter", callbacks.show, eventOptions.passive);
      element[method]("mouseleave", callbacks.hide, eventOptions.passive);
      element[method]("touchstart", callbacks.show, eventOptions.passive);
    }
    if (focusable) {
      anchor[method]("blur", callbacks.hide, eventOptions.passive);
      anchor[method]("focus", callbacks.show, eventOptions.passive);
    }
  }
  handleFloater(show) {
    const { callbacks, floater } = this;
    const method = show ? "addEventListener" : "removeEventListener";
    document[method]("keydown", callbacks.key, eventOptions.passive);
    document[method]("pointerdown", callbacks.click, eventOptions.passive);
    floater.hidden = !show;
  }
};
var observer = new MutationObserver(Manager4.observer);
observer.observe(document, {
  attributeFilter: [attribute],
  attributeOldValue: true,
  attributes: true,
  childList: true,
  subtree: true
});
delay(() => {
  const tooltips = Array.from(document.querySelectorAll(`[${attribute}]`));
  for (const tooltip of tooltips) {
    tooltip.setAttribute(attribute, "");
  }
});
//# sourceMappingURL=index.js.map
