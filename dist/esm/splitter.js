// src/helpers/index.js
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function isNullableOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/helpers/event.js
function getCoordinates(event) {
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  const x = event.touches[0]?.clientX;
  const y = event.touches[0]?.clientY;
  return typeof x === "number" && typeof y === "number" ? { x, y } : void 0;
}
function getOptions(passive, capture) {
  return {
    capture: capture ?? false,
    passive: passive ?? true
  };
}

// src/helpers/touchy.js
var isTouchy = (() => {
  let value = false;
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (typeof media?.matches === "boolean") {
        value = media.matches;
      }
    }
    if (!value) {
      value = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints ?? 0) > 0;
    }
  } catch {
    value = false;
  }
  return value;
})();
var methods = {
  begin: isTouchy ? "touchstart" : "mousedown",
  end: isTouchy ? "touchend" : "mouseup",
  move: isTouchy ? "touchmove" : "mousemove"
};

// src/splitter.js
var selector = "palmer-splitter";
var splitterTypes = /* @__PURE__ */ new Set(["horizontal", "vertical"]);
var store = /* @__PURE__ */ new WeakMap();
var index = 0;
function onDocumentKeydown(event) {
  if (event.key === "Escape") {
    setDragging(this, false);
  }
}
function onPointerBegin(component) {
  setDragging(component, true);
}
function onPointerEnd() {
  setDragging(this, false);
}
function onPointerMove(event) {
  if (isTouchy) {
    event.preventDefault();
  }
  const coordinates = getCoordinates(event);
  if (coordinates === void 0) {
    return;
  }
  const componentRectangle = this.getBoundingClientRect();
  const value = this.type === "horizontal" ? (coordinates.y - componentRectangle.top) / componentRectangle.height : (coordinates.x - componentRectangle.left) / componentRectangle.width;
  setFlexValue(
    this,
    {
      separator: this.separator,
      value: value * 100
    }
  );
}
function onSeparatorKeydown(component, event) {
  if (![
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "End",
    "Escape",
    "Home"
  ].includes(event.key)) {
    return;
  }
  const ignored = component.type === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowDown", "ArrowUp"];
  if (ignored.includes(event.key)) {
    return;
  }
  const { values } = store.get(component);
  if (values === void 0) {
    return;
  }
  let value;
  switch (event.key) {
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp": {
      value = Math.round(
        component.value + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1)
      );
      break;
    }
    case "End":
    case "Home": {
      value = event.key === "End" ? values.maximum : values.minimum;
      break;
    }
    case "Escape": {
      value = values.initial ?? values.original;
      values.initial = void 0;
      break;
    }
    default: {
      break;
    }
  }
  setFlexValue(
    component,
    {
      value,
      values,
      separator: component.separator
    }
  );
}
function setAbsoluteValue(component, parameters) {
  const { key, separator, setFlex } = parameters;
  const values = parameters.values ?? store.get(component)?.values;
  let value = getNumber(parameters.value);
  if (values === void 0 || Number.isNaN(value) || value === values[key] || key === "maximum" && value < values.minimum || key === "minimum" && value > values.maximum) {
    return;
  }
  if (key === "maximum" && value > 100) {
    value = 100;
  } else if (key === "minimum" && value < 0) {
    value = 0;
  }
  values[parameters.key] = value;
  separator.setAttribute(
    key === "maximum" ? "aria-valuemax" : "aria-valuemin",
    value
  );
  if (setFlex && (key === "maximum" && value < values.current || key === "minimum" && value > values.current)) {
    setFlexValue(
      component,
      {
        separator,
        value,
        values
      }
    );
  }
}
function setDragging(component, active) {
  const stored = store.get(component);
  if (stored === void 0) {
    return;
  }
  if (active) {
    stored.values.initial = Number(stored.values.current);
  }
  const method = active ? "addEventListener" : "removeEventListener";
  document[method]("keydown", stored.callbacks.keydown, getOptions());
  document[method](methods.end, stored.callbacks.pointerEnd, getOptions());
  document[method](
    methods.move,
    stored.callbacks.pointerMove,
    getOptions(!isTouchy)
  );
  stored.dragging = active;
  document.body.style.userSelect = active ? "none" : null;
  document.body.style.webkitUserSelect = active ? "none" : null;
}
function setFlexValue(component, parameters) {
  const { separator } = parameters;
  const values = parameters.values ?? store.get(component)?.values;
  let value = getNumber(parameters.value);
  if (values === void 0 || Number.isNaN(value) || value === values.current) {
    return;
  }
  if (value < values.minimum) {
    value = values.minimum;
  } else if (value > values.maximum) {
    value = values.maximum;
  }
  if (parameters.setOriginal ?? false) {
    values.original = value;
  }
  separator.setAttribute("aria-valuenow", value);
  component.primary.style.flex = `${value / 100}`;
  component.secondary.style.flex = `${(100 - value) / 100}`;
  values.current = value;
  component.dispatchEvent(new CustomEvent("change", { detail: value }));
}
function updateHandle(component) {
  const { handle } = component;
  handle.hidden = false;
  handle.setAttribute("aria-hidden", true);
  handle.addEventListener(
    methods.begin,
    () => onPointerBegin(component),
    getOptions()
  );
}
function updateSeparator(component) {
  const { separator } = component;
  separator.hidden = false;
  separator.tabIndex = 0;
  separator.setAttribute("role", "separator");
  separator.setAttribute("aria-controls", component.primary.id);
  separator.setAttribute("aria-valuemax", 100);
  separator.setAttribute("aria-valuemin", 0);
  separator.setAttribute("aria-valuenow", 50);
  if (isNullableOrWhitespace(component.getAttribute("value"))) {
    setFlexValue(
      component,
      {
        separator,
        value: 50
      }
    );
  }
  separator.addEventListener(
    "keydown",
    (event) => onSeparatorKeydown(component, event),
    getOptions()
  );
}
var PalmerSplitter = class extends HTMLElement {
  /** @returns {number|undefined} */
  get max() {
    return store.get(this)?.values.maximum;
  }
  /** @param {number} max */
  set max(max) {
    this.setAttribute("max", max);
  }
  /** @returns {number|undefined} */
  get min() {
    return store.get(this)?.values.minimum;
  }
  /** @param {number} min */
  set min(min) {
    this.setAttribute("min", min);
  }
  /** @returns {'horizontal'|'vertical'} */
  get type() {
    const type = this.getAttribute("type") ?? "vertical";
    return splitterTypes.has(type) ? type : "vertical";
  }
  /** @param {'horizontal'|'vertical'} type */
  set type(type) {
    this.setAttribute("type", type);
  }
  /** @returns {number|undefined} */
  get value() {
    return store.get(this)?.values.current;
  }
  /** @param {number} value */
  set value(value) {
    this.setAttribute("value", value);
  }
  constructor() {
    super();
    const panels = Array.from(
      this.querySelectorAll(`:scope > [${selector}-panel]`)
    );
    if (panels.length !== 2 || panels.some((panel) => !(panel instanceof HTMLElement))) {
      throw new TypeError(
        `<${selector}> must have two direct child elements with the attribute '${selector}-panel'`
      );
    }
    const separator = this.querySelector(`:scope > [${selector}-separator]`);
    const separatorHandle = separator?.querySelector(
      `:scope > [${selector}-separator-handle]`
    );
    if ([separator, separatorHandle].some(
      (element) => !(element instanceof HTMLElement)
    )) {
      throw new TypeError(
        `<${selector}> must have a separator element with the attribute '${selector}-separator', and it must have a child element with the attribute '${selector}-separator-handle'`
      );
    }
    const primary = panels[0];
    const secondary = panels[1];
    const children = Array.from(this.children);
    if (!(children.indexOf(primary) < children.indexOf(separator) && children.indexOf(separator) < children.indexOf(secondary))) {
      throw new TypeError(
        `<${selector}> must have elements with the order of: panel, separator, panel`
      );
    }
    const stored = {
      callbacks: {
        keydown: onDocumentKeydown.bind(this),
        pointerEnd: onPointerEnd.bind(this),
        pointerMove: onPointerMove.bind(this)
      },
      dragging: false,
      values: {
        current: -1,
        maximum: 100,
        minimum: 0,
        original: 50
      }
    };
    store.set(this, stored);
    this.primary = primary;
    this.secondary = secondary;
    this.handle = separatorHandle;
    this.separator = separator;
    if (isNullableOrWhitespace(primary.id)) {
      primary.id = `palmer_splitter_primary_panel_${++index}`;
    }
    updateSeparator(this);
    updateHandle(this);
  }
  attributeChangedCallback(name, _, value) {
    switch (name) {
      case "max":
      case "min": {
        setAbsoluteValue(
          this,
          {
            key: name === "max" ? "maximum" : "minimum",
            separator: this.separator,
            setFlex: true,
            value
          }
        );
        break;
      }
      case "value": {
        setFlexValue(
          this,
          {
            separator: this.separator,
            setOriginal: true,
            value
          }
        );
        break;
      }
      default: {
        break;
      }
    }
  }
};
PalmerSplitter.observedAttributes = ["max", "min", "value"];
customElements.define(selector, PalmerSplitter);
export {
  PalmerSplitter
};
