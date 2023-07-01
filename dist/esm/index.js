// src/helpers/index.js
var eventOptions = {
  active: { capture: false, passive: false },
  passive: { capture: false, passive: true }
};
function findParent(element, match) {
  const matchIsSelector = typeof match === "string";
  if (matchIsSelector ? element.matches(match) : match(element)) {
    return element;
  }
  let parent = element?.parentElement;
  while (parent !== null) {
    if (parent === document.body) {
      return void 0;
    }
    if (matchIsSelector ? parent.matches(match) : match(parent)) {
      break;
    }
    parent = parent.parentElement;
  }
  return parent ?? void 0;
}
function getCoordinates(event) {
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  const x = event.touches[0]?.clientX;
  const y = event.touches[0]?.clientY;
  return x === null || y === null ? void 0 : { x, y };
}
function getNumber(value) {
  return typeof value === "number" ? value : Number.parseInt(typeof value === "string" ? value : String(value), 10);
}
function getTextDirection(element) {
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
function isNullOrWhitespace(value) {
  return (value ?? "").trim().length === 0;
}

// src/accordion.js
var keys = /* @__PURE__ */ new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home"
]);
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
  if (document.activeElement?.tagName !== "SUMMARY" || !keys.has(event.key)) {
    return;
  }
  const stored = store.get(component);
  if ((stored?.elements?.length ?? 0) === 0) {
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
    case "ArrowRight": {
      destination = current + 1;
      break;
    }
    case "ArrowLeft":
    case "ArrowUp": {
      destination = current - 1;
      break;
    }
    case "End": {
      destination = stored.elements.length - 1;
      break;
    }
    case "Home": {
      destination = 0;
      break;
    }
    default: {
      return;
    }
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
  summary?.focus?.();
}
function onToggle(component, element) {
  if (element.open && !component.multiple) {
    toggleDetails(component, element);
  }
}
function setDetails(component) {
  const stored = store.get(component);
  if (stored === void 0) {
    return;
  }
  stored.elements = [...component.querySelectorAll(":scope > details")];
  for (const element of stored.elements) {
    element.addEventListener("toggle", () => onToggle(component, element));
  }
}
function toggleDetails(component, active) {
  const stored = store.get(component);
  if (stored === void 0) {
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
    this.addEventListener(
      "keydown",
      (event) => onKeydown(this, event),
      eventOptions.active
    );
    if (!this.multiple) {
      toggleDetails(
        this,
        stored.elements.find((details) => details.open)
      );
    }
  }
  attributeChangedCallback(name) {
    if (name === "multiple" && !this.multiple) {
      toggleDetails(
        this,
        store.get(this)?.elements.find((details) => details.open)
      );
    }
  }
  connectedCallback() {
    store.get(this)?.observer.observe(
      this,
      {
        childList: true,
        subtree: true
      }
    );
  }
  disconnectedCallback() {
    store.get(this)?.observer.disconnect();
  }
};
PalmerAccordion.observedAttributes = ["max", "min", "value"];
customElements.define("palmer-accordion", PalmerAccordion);

// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var request = requestAnimationFrame ?? function(callback) {
  return setTimeout?.(() => {
    callback(Date.now());
  }, milliseconds);
};
function run(timed) {
  timed.state.active = true;
  timed.state.finished = false;
  const isRepeated = timed instanceof Repeated;
  let index3 = 0;
  let start;
  function step(timestamp) {
    if (!timed.state.active) {
      return;
    }
    start ?? (start = timestamp);
    const elapsed = timestamp - start;
    const elapsedMinimum = elapsed - milliseconds;
    const elapsedMaximum = elapsed + milliseconds;
    if (elapsedMinimum < timed.configuration.time && timed.configuration.time < elapsedMaximum) {
      if (timed.state.active) {
        timed.callbacks.default(isRepeated ? index3 : void 0);
      }
      index3 += 1;
      if (isRepeated && index3 < timed.configuration.count) {
        start = void 0;
      } else {
        timed.state.finished = true;
        timed.stop();
        return;
      }
    }
    timed.state.frame = request(step);
  }
  timed.state.frame = request(step);
}
var Timed = class {
  get active() {
    return this.state.active;
  }
  get finished() {
    return !this.active && this.state.finished;
  }
  /**
   * @param {RepeatedCallback} callback
   * @param {number} time
   * @param {number} count
   * @param {AfterCallback|undefined} afterCallback
   */
  constructor(callback, time, count, afterCallback) {
    const isRepeated = this instanceof Repeated;
    const type = isRepeated ? "repeated" : "waited";
    if (typeof callback !== "function") {
      throw new TypeError(`A ${type} timer must have a callback function`);
    }
    if (typeof time !== "number" || time < 0) {
      throw new TypeError(
        `A ${type} timer must have a non-negative number as its time`
      );
    }
    if (isRepeated && (typeof count !== "number" || count < 2)) {
      throw new TypeError(
        "A repeated timer must have a number above 1 as its repeat count"
      );
    }
    if (isRepeated && afterCallback !== void 0 && typeof afterCallback !== "function") {
      throw new TypeError(
        "A repeated timer's after-callback must be a function"
      );
    }
    this.configuration = { count, time };
    this.callbacks = {
      after: afterCallback,
      default: callback
    };
    this.state = {
      active: false,
      finished: false,
      frame: null
    };
  }
  restart() {
    this.stop();
    run(this);
    return this;
  }
  start() {
    if (!this.state.active) {
      run(this);
    }
    return this;
  }
  stop() {
    this.state.active = false;
    if (this.state.frame === void 0) {
      return this;
    }
    (cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
    this.callbacks.after?.(this.finished);
    this.state.frame = void 0;
    return this;
  }
};
var Repeated = class extends Timed {
};
var Waited = class extends Timed {
  /**
   * @param {Function} callback
   * @param {number} time
   */
  constructor(callback, time) {
    super(callback, time, 1, null);
  }
};
function wait(callback, time) {
  return new Waited(callback, time).start();
}

// src/details.js
var selector = "palmer-details";
var store2 = /* @__PURE__ */ new WeakMap();
function create(element) {
  if (!store2.has(element)) {
    store2.set(element, new PalmerDetails(element));
  }
}
function destroy(element) {
  store2.delete(element);
}
function observe(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (!(record.target instanceof HTMLDetailsElement)) {
      throw new TypeError(
        `An element with the '${selector}'-attribute must be a <details>-element`
      );
    }
    if (record.target.getAttribute(selector) === null) {
      destroy(record.target);
    } else {
      create(record.target);
    }
  }
}
var PalmerDetails = class {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.details = element;
    this.summary = element.querySelector(":scope > summary") ?? void 0;
    this.callbacks = {
      onKeydown: this.onKeydown.bind(this),
      onToggle: this.onToggle.bind(this)
    };
    this.details.addEventListener(
      "toggle",
      this.callbacks.onToggle,
      eventOptions.passive
    );
  }
  /**
   * @param {KeyboardEvent} event
   */
  onKeydown(event) {
    if (event.key !== "Escape" || !this.details.open) {
      return;
    }
    const children = [...this.details.querySelectorAll(`[${selector}][open]`)];
    if (children.some((child) => child.contains(globalThis.document.activeElement)) || !this.details.contains(globalThis.document.activeElement)) {
      return;
    }
    this.details.open = false;
    wait(() => this.summary?.focus(), 0);
  }
  onToggle() {
    globalThis.document[this.details.open ? "addEventListener" : "removeEventListener"]?.("keydown", this.callbacks.onKeydown, eventOptions.passive);
  }
};
var observer = new MutationObserver(observe);
observer.observe(
  globalThis.document,
  {
    attributeFilter: [selector],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }
);
wait(
  () => {
    const elements = Array.from(
      globalThis.document.querySelectorAll(`[${selector}]`)
    );
    for (const element of elements) {
      element.setAttribute(selector, "");
    }
  },
  0
);

// node_modules/tabbable/dist/index.esm.js
var candidateSelectors = ["input:not([inert])", "select:not([inert])", "textarea:not([inert])", "a[href]:not([inert])", "button:not([inert])", "[tabindex]:not(slot):not([inert])", "audio[controls]:not([inert])", "video[controls]:not([inert])", '[contenteditable]:not([contenteditable="false"]):not([inert])', "details>summary:first-of-type:not([inert])", "details:not([inert])"];
var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
var NoElement = typeof Element === "undefined";
var matches = NoElement ? function() {
} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
  var _element$getRootNode;
  return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
} : function(element) {
  return element === null || element === void 0 ? void 0 : element.ownerDocument;
};
var isInert = function isInert2(node, lookUp) {
  var _node$getAttribute;
  if (lookUp === void 0) {
    lookUp = true;
  }
  var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "inert");
  var inert = inertAtt === "" || inertAtt === "true";
  var result = inert || lookUp && node && isInert2(node.parentNode);
  return result;
};
var isContentEditable = function isContentEditable2(node) {
  var _node$getAttribute2;
  var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, "contenteditable");
  return attValue === "" || attValue === "true";
};
var getCandidates = function getCandidates2(el, includeContainer, filter) {
  if (isInert(el)) {
    return [];
  }
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }
  candidates = candidates.filter(filter);
  return candidates;
};
var getCandidatesIteratively = function getCandidatesIteratively2(elements, includeContainer, options) {
  var candidates = [];
  var elementsToCheck = Array.from(elements);
  while (elementsToCheck.length) {
    var element = elementsToCheck.shift();
    if (isInert(element, false)) {
      continue;
    }
    if (element.tagName === "SLOT") {
      var assigned = element.assignedElements();
      var content = assigned.length ? assigned : element.children;
      var nestedCandidates = getCandidatesIteratively2(content, true, options);
      if (options.flatten) {
        candidates.push.apply(candidates, nestedCandidates);
      } else {
        candidates.push({
          scopeParent: element,
          candidates: nestedCandidates
        });
      }
    } else {
      var validCandidate = matches.call(element, candidateSelector);
      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
        candidates.push(element);
      }
      var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
      typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
      var validShadowRoot = !isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
      if (shadowRoot && validShadowRoot) {
        var _nestedCandidates = getCandidatesIteratively2(shadowRoot === true ? element.children : shadowRoot.children, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, _nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: _nestedCandidates
          });
        }
      } else {
        elementsToCheck.unshift.apply(elementsToCheck, element.children);
      }
    }
  }
  return candidates;
};
var hasTabIndex = function hasTabIndex2(node) {
  return !isNaN(parseInt(node.getAttribute("tabindex"), 10));
};
var getTabIndex = function getTabIndex2(node) {
  if (!node) {
    throw new Error("No node provided");
  }
  if (node.tabIndex < 0) {
    if ((/^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && !hasTabIndex(node)) {
      return 0;
    }
  }
  return node.tabIndex;
};
var getSortOrderTabIndex = function getSortOrderTabIndex2(node, isScope) {
  var tabIndex = getTabIndex(node);
  if (tabIndex < 0 && isScope && !hasTabIndex(node)) {
    return 0;
  }
  return tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables2(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput = function isInput2(node) {
  return node.tagName === "INPUT";
};
var isHiddenInput = function isHiddenInput2(node) {
  return isInput(node) && node.type === "hidden";
};
var isDetailsWithSummary = function isDetailsWithSummary2(node) {
  var r = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
    return child.tagName === "SUMMARY";
  });
  return r;
};
var getCheckedRadio = function getCheckedRadio2(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};
var isTabbableRadio = function isTabbableRadio2(node) {
  if (!node.name) {
    return true;
  }
  var radioScope = node.form || getRootNode(node);
  var queryRadios = function queryRadios2(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };
  var radioSet;
  if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
      return false;
    }
  }
  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};
var isRadio = function isRadio2(node) {
  return isInput(node) && node.type === "radio";
};
var isNonTabbableRadio = function isNonTabbableRadio2(node) {
  return isRadio(node) && !isTabbableRadio(node);
};
var isNodeAttached = function isNodeAttached2(node) {
  var _nodeRoot;
  var nodeRoot = node && getRootNode(node);
  var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;
  var attached = false;
  if (nodeRoot && nodeRoot !== node) {
    var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
    attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
    while (!attached && nodeRootHost) {
      var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
      nodeRoot = getRootNode(nodeRootHost);
      nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
      attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
    }
  }
  return attached;
};
var isZeroArea = function isZeroArea2(node) {
  var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
  return width === 0 && height === 0;
};
var isHidden = function isHidden2(node, _ref) {
  var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
  if (getComputedStyle(node).visibility === "hidden") {
    return true;
  }
  var isDirectSummary = matches.call(node, "details>summary:first-of-type");
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
  if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
    return true;
  }
  if (!displayCheck || displayCheck === "full" || displayCheck === "legacy-full") {
    if (typeof getShadowRoot === "function") {
      var originalNode = node;
      while (node) {
        var parentElement = node.parentElement;
        var rootNode = getRootNode(node);
        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          node = rootNode.host;
        } else {
          node = parentElement;
        }
      }
      node = originalNode;
    }
    if (isNodeAttached(node)) {
      return !node.getClientRects().length;
    }
    if (displayCheck !== "legacy-full") {
      return true;
    }
  } else if (displayCheck === "non-zero-area") {
    return isZeroArea(node);
  }
  return false;
};
var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    var parentNode = node.parentElement;
    while (parentNode) {
      if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i);
          if (child.tagName === "LEGEND") {
            return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
          }
        }
        return true;
      }
      parentNode = parentNode.parentElement;
    }
  }
  return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
  if (node.disabled || // we must do an inert look up to filter out any elements inside an inert ancestor
  //  because we're limited in the type of selectors we can use in JSDom (see related
  //  note related to `candidateSelectors`)
  isInert(node) || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }
  return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
  if (isNonTabbableRadio(node) || getTabIndex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
    return false;
  }
  return true;
};
var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
  var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
  if (isNaN(tabIndex) || tabIndex >= 0) {
    return true;
  }
  return false;
};
var sortByOrder = function sortByOrder2(candidates) {
  var regularTabbables = [];
  var orderedTabbables = [];
  candidates.forEach(function(item, i) {
    var isScope = !!item.scopeParent;
    var element = isScope ? item.scopeParent : item;
    var candidateTabindex = getSortOrderTabIndex(element, isScope);
    var elements = isScope ? sortByOrder2(item.candidates) : element;
    if (candidateTabindex === 0) {
      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item,
        isScope,
        content: elements
      });
    }
  });
  return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
    return acc;
  }, []).concat(regularTabbables);
};
var tabbable = function tabbable2(container, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([container], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
      shadowRootFilter: isValidShadowRootTabbable
    });
  } else {
    candidates = getCandidates(container, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  }
  return sortByOrder(candidates);
};
var isTabbable = function isTabbable2(node, options) {
  options = options || {};
  if (!node) {
    throw new Error("No node provided");
  }
  if (matches.call(node, candidateSelector) === false) {
    return false;
  }
  return isNodeMatchingSelectorTabbable(options, node);
};

// src/focus-trap.js
var selector2 = "palmer-focus-trap";
var store3 = /* @__PURE__ */ new WeakMap();
function create2(element) {
  if (!store3.has(element)) {
    store3.set(element, new FocusTrap(element));
  }
}
function destroy2(element) {
  const focusTrap = store3.get(element);
  if (focusTrap === void 0) {
    return;
  }
  element.tabIndex = focusTrap.tabIndex;
  store3.delete(element);
}
function handleEvent(event, focusTrap, element) {
  const elements = tabbable(focusTrap);
  if (element === focusTrap) {
    wait(
      () => {
        (elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
      },
      0
    );
    return;
  }
  const index3 = elements.indexOf(element);
  let target = focusTrap;
  if (index3 > -1) {
    let position = index3 + (event.shiftKey ? -1 : 1);
    if (position < 0) {
      position = elements.length - 1;
    } else if (position >= elements.length) {
      position = 0;
    }
    target = elements[position] ?? focusTrap;
  }
  wait(
    () => {
      target.focus();
    },
    0
  );
}
function observe2(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector2) === void 0) {
      destroy2(record.target);
    } else {
      create2(record.target);
    }
  }
}
function onKeydown2(event) {
  if (event.key !== "Tab") {
    return;
  }
  const focusTrap = findParent(event.target, `[${selector2}]`);
  if (focusTrap === void 0) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  handleEvent(event, focusTrap, event.target);
}
var FocusTrap = class {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.tabIndex = element.tabIndex;
    element.tabIndex = -1;
  }
};
(() => {
  if (globalThis.oscarpalmerComponentsFocusTrap !== null) {
    return;
  }
  globalThis.oscarpalmerComponentsFocusTrap = 1;
  const observer3 = new MutationObserver(observe2);
  observer3.observe(
    document,
    {
      attributeFilter: [selector2],
      attributeOldValue: true,
      attributes: true,
      childList: true,
      subtree: true
    }
  );
  wait(
    () => {
      const elements = Array.from(document.querySelectorAll(`[${selector2}]`));
      for (const element of elements) {
        element.setAttribute(selector2, "");
      }
    },
    0
  );
  document.addEventListener("keydown", onKeydown2, eventOptions.active);
})();

// src/helpers/floated.js
var allPositions = [
  "above",
  "above-left",
  "above-right",
  "below",
  "below-left",
  "below-right",
  "horizontal",
  "horizontal-bottom",
  "horizontal-top",
  "left",
  "left-bottom",
  "left-top",
  "right",
  "right-bottom",
  "right-top",
  "vertical",
  "vertical-left",
  "vertical-right"
];
var domRectKeys = ["bottom", "height", "left", "right", "top", "width"];
function calculatePosition(position, rectangles, rightToLeft, preferAbove) {
  const left = getValue(true, position, rectangles, rightToLeft);
  const top = getValue(false, position, rectangles, preferAbove);
  return { top, left };
}
function getAbsolute(parameters) {
  const maxPosition = parameters.end + parameters.offset;
  const minPosition = parameters.start - parameters.offset;
  if (parameters.preferMin) {
    return minPosition < 0 ? maxPosition > parameters.max ? minPosition : parameters.end : minPosition;
  }
  return maxPosition > parameters.max ? minPosition < 0 ? parameters.end : minPosition : parameters.end;
}
function getPosition(currentPosition, defaultPosition) {
  if (currentPosition === null) {
    return defaultPosition;
  }
  const normalized = currentPosition.trim().toLowerCase();
  const index3 = allPositions.indexOf(normalized);
  return index3 > -1 ? allPositions[index3] ?? defaultPosition : defaultPosition;
}
function getValue(x, position, rectangles, preferMin) {
  const { anchor, floater } = rectangles;
  if (x ? position.startsWith("right") : position.endsWith("top")) {
    return x ? anchor.right : anchor.top;
  }
  if (x ? position.startsWith("left") : position.endsWith("bottom")) {
    return (x ? anchor.left : anchor.bottom) - (x ? floater.width : floater.height);
  }
  if (x ? position.endsWith("right") : position.startsWith("above")) {
    return (x ? anchor.right : anchor.top) - (x ? floater.width : floater.height);
  }
  if ((x ? ["above", "below", "vertical"] : ["horizontal", "left", "right"]).includes(position)) {
    return (x ? anchor.left : anchor.top) + (x ? anchor.width : anchor.height) / 2 - (x ? floater.width : floater.height) / 2;
  }
  if (x ? position.startsWith("horizontal") : position.startsWith("vertical")) {
    return getAbsolute({
      preferMin,
      end: x ? anchor.right : anchor.bottom,
      max: x ? globalThis.innerWidth : globalThis.innerHeight,
      offset: x ? floater.width : floater.height,
      start: x ? anchor.left : anchor.top
    });
  }
  return x ? anchor.left : anchor.bottom;
}
function updateFloated(parameters) {
  const { anchor, floater, parent } = parameters.elements;
  const rightToLeft = getTextDirection(floater) === "rtl";
  let previousPosition;
  let previousRectangle;
  function afterRepeat() {
    anchor.after(floater);
  }
  function onRepeat() {
    const currentPosition = getPosition(
      (parent ?? anchor).getAttribute(parameters.position.attribute) ?? "",
      parameters.position.defaultValue
    );
    const currentRectangle = anchor.getBoundingClientRect();
    if (previousPosition === currentPosition && domRectKeys.every(
      (key) => previousRectangle?.[key] === currentRectangle[key]
    )) {
      return;
    }
    previousPosition = currentPosition;
    previousRectangle = currentRectangle;
    const rectangles = {
      anchor: currentRectangle,
      floater: floater.getBoundingClientRect()
    };
    const values = calculatePosition(
      currentPosition,
      rectangles,
      rightToLeft,
      parameters.position.preferAbove
    );
    const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;
    if (floater.style.transform === matrix) {
      return;
    }
    floater.style.position = "fixed";
    floater.style.inset = "0 auto auto 0";
    floater.style.transform = matrix;
  }
  document.body.append(floater);
  floater.hidden = false;
  return new Repeated(
    onRepeat,
    0,
    Number.POSITIVE_INFINITY,
    afterRepeat
  ).start();
}

// src/popover.js
var selector3 = "palmer-popover";
var store4 = /* @__PURE__ */ new WeakMap();
var index = 0;
function afterToggle(component, active) {
  handleCallbacks(component, active);
  if (active && component.content) {
    (tabbable(component.content)?.[0] ?? component.content).focus();
  } else {
    component.button?.focus();
  }
}
function handleCallbacks(component, add) {
  const callbacks = store4.get(component);
  if (callbacks === void 0) {
    return;
  }
  const method = add ? "addEventListener" : "removeEventListener";
  document[method]("click", callbacks.click, eventOptions.passive);
  document[method]("keydown", callbacks.keydown, eventOptions.passive);
}
function handleGlobalEvent(event, component, target) {
  const { button, content } = component;
  if (button === void 0 || content === void 0) {
    return;
  }
  const floater = findParent(target, `[${selector3}-content]`);
  if (floater === void 0) {
    handleToggle(component, false);
    return;
  }
  event.stopPropagation();
  const children = Array.from(document.body.children);
  const difference = children.indexOf(floater) - children.indexOf(content);
  if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
    handleToggle(component, false);
  }
}
function handleToggle(component, expand) {
  const expanded = typeof expand === "boolean" ? !expand : component.open;
  component.button.setAttribute("aria-expanded", !expanded);
  if (expanded) {
    component.content.hidden = true;
    component.timer?.stop();
    afterToggle(component, false);
  } else {
    component.timer?.stop();
    component.timer = updateFloated({
      elements: {
        anchor: component.button,
        floater: component.content,
        parent: component
      },
      position: {
        attribute: "position",
        defaultValue: "vertical",
        preferAbove: false
      }
    });
    wait(
      () => {
        afterToggle(component, true);
      },
      50
    );
  }
  component.dispatchEvent(new Event("toggle"));
}
function initialise(component, button, content) {
  content.hidden = true;
  if (isNullOrWhitespace(component.id)) {
    component.id = `palmer_popover_${++index}`;
  }
  if (isNullOrWhitespace(button.id)) {
    button.id = `${component.id}_button`;
  }
  if (isNullOrWhitespace(content.id)) {
    content.id = `${component.id}_content`;
  }
  button.setAttribute("aria-controls", content.id);
  button.ariaExpanded = "false";
  button.ariaHasPopup = "dialog";
  if (!(button instanceof HTMLButtonElement)) {
    button.tabIndex = 0;
  }
  content.setAttribute(selector2, "");
  content.role = "dialog";
  content.ariaModal = "false";
  store4.set(
    component,
    {
      click: onClick.bind(component),
      keydown: onKeydown3.bind(component)
    }
  );
  button.addEventListener(
    "click",
    toggle.bind(component),
    eventOptions.passive
  );
}
function isButton(node) {
  if (node === null) {
    return false;
  }
  if (node instanceof HTMLButtonElement) {
    return true;
  }
  return node instanceof HTMLElement && node.getAttribute("role") === "button";
}
function onClick(event) {
  if (this.open) {
    handleGlobalEvent(event, this, event.target);
  }
}
function onKeydown3(event) {
  if (this.open && event instanceof KeyboardEvent && event.key === "Escape") {
    handleGlobalEvent(event, this, document.activeElement);
  }
}
function toggle(expand) {
  handleToggle(this, expand);
}
var PalmerPopover = class extends HTMLElement {
  get open() {
    return this.button?.getAttribute("aria-expanded") === "true";
  }
  set open(open) {
    toggle.call(this, open);
  }
  constructor() {
    super();
    const button = this.querySelector(`:scope > [${selector3}-button]`);
    const content = this.querySelector(`:scope > [${selector3}-content]`);
    if (!isButton(button)) {
      throw new Error(
        `<${selector3}> must have a <button>-element (or button-like element) with the attribute '${selector3}-button`
      );
    }
    if (content === null || !(content instanceof HTMLElement)) {
      throw new Error(
        `<${selector3}> must have an element with the attribute '${selector3}-content'`
      );
    }
    this.button = button;
    this.content = content;
    this.timer = void 0;
    initialise(this, button, content);
  }
  toggle() {
    if (this.button && this.content) {
      toggle.call(this);
    }
  }
};
customElements.define(selector3, PalmerPopover);

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

// src/splitter.js
var pointerBeginEvent = isTouchy ? "touchstart" : "mousedown";
var pointerEndEvent = isTouchy ? "touchend" : "mouseup";
var pointerMoveEvent = isTouchy ? "touchmove" : "mousemove";
var selector4 = "palmer-splitter";
var splitterTypes = /* @__PURE__ */ new Set(["horizontal", "vertical"]);
var store5 = /* @__PURE__ */ new WeakMap();
var index2 = 0;
function createHandle(component, className) {
  const handle = document.createElement("span");
  handle.className = `${className}__separator__handle`;
  handle.ariaHidden = "true";
  handle.textContent = component.type === "horizontal" ? "\u2195" : "\u2194";
  handle.addEventListener(pointerBeginEvent, () => onPointerBegin(component));
  return handle;
}
function createSeparator(component, values, className) {
  const actualValues = values ?? store5.get(component)?.values;
  if (actualValues === void 0) {
    return void 0;
  }
  const separator = document.createElement("div");
  if (isNullOrWhitespace(component.primary.id)) {
    component.primary.id = `palmer_splitter_primary_panel_${++index2}`;
  }
  separator.className = `${className}__separator`;
  separator.role = "separator";
  separator.tabIndex = 0;
  separator.setAttribute("aria-controls", component.primary.id);
  separator.setAttribute("aria-valuemax", "100");
  separator.setAttribute("aria-valuemin", "0");
  separator.setAttribute("aria-valuenow", "50");
  const original = component.getAttribute("value");
  if (isNullOrWhitespace(original)) {
    setFlexValue(
      component,
      {
        separator,
        value: 50
      }
    );
  }
  separator.append(component.handle);
  separator.addEventListener(
    "keydown",
    (event) => onSeparatorKeydown(component, event),
    eventOptions.passive
  );
  return separator;
}
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
  const { values } = store5.get(component);
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
  const values = parameters.values ?? store5.get(component)?.values;
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
  const stored = store5.get(component);
  if (stored === void 0) {
    return;
  }
  if (active) {
    stored.values.initial = Number(stored.values.current);
  }
  const method = active ? "addEventListener" : "removeEventListener";
  document[method]("keydown", stored.callbacks.keydown, eventOptions.passive);
  document[method](
    pointerEndEvent,
    stored.callbacks.pointerEnd,
    eventOptions.passive
  );
  document[method](
    pointerMoveEvent,
    stored.callbacks.pointerMove,
    isTouchy ? eventOptions.active : eventOptions.passive
  );
  stored.dragging = active;
  document.body.style.userSelect = active ? "none" : null;
  document.body.style.webkitUserSelect = active ? "none" : null;
}
function setFlexValue(component, parameters) {
  const { separator } = parameters;
  const values = parameters.values ?? store5.get(component)?.values;
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
  separator.ariaValueNow = value;
  component.primary.style.flex = `${value / 100}`;
  component.secondary.style.flex = `${(100 - value) / 100}`;
  values.current = value;
  component.dispatchEvent(new CustomEvent("change", { detail: { value } }));
}
var PalmerSplitter = class extends HTMLElement {
  get max() {
    return store5.get(this)?.values.maximum;
  }
  set max(max) {
    this.setAttribute("max", max);
  }
  get min() {
    return store5.get(this)?.values.minimum;
  }
  set min(min) {
    this.setAttribute("min", min);
  }
  get type() {
    const type = this.getAttribute("type") ?? "vertical";
    return splitterTypes.has(type) ? type : "vertical";
  }
  set type(type) {
    this.setAttribute("type", type);
  }
  get value() {
    return store5.get(this)?.values.current;
  }
  set value(value) {
    this.setAttribute("value", value);
  }
  constructor() {
    super();
    if (this.children.length !== 2) {
      throw new Error(`A <${selector4}> must have exactly two direct children`);
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
    store5.set(this, stored);
    this.primary = this.children[0];
    this.secondary = this.children[1];
    let className = this.getAttribute("className");
    if (isNullOrWhitespace(className)) {
      className = selector4;
    }
    const panelClassName = `${className}__panel`;
    this.primary.classList.add(panelClassName);
    this.secondary.classList.add(panelClassName);
    this.handle = createHandle(this, className);
    this.separator = createSeparator(this, stored.values, className);
    this.primary?.insertAdjacentElement("afterend", this.separator);
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
customElements.define(selector4, PalmerSplitter);

// src/switch.js
var selector5 = "palmer-switch";
function initialise2(component, label, input) {
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
    className = selector5;
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
    onToggle2.bind(component),
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
  toggle2(this);
}
function onToggle2() {
  toggle2(this);
}
function render(id, className, text) {
  return `<span class="${className}__label" id="${id}_label" aria-hidden="true">${text.label}</span><div class="${className}__status" aria-hidden="true"><span class="${className}__status__indicator"></span></div><div class="${className}__text" aria-hidden="true"><span class="${className}__text__off">${text.off}</span><span class="${className}__text__on">${text.on}</span></div>`;
}
function toggle2(component) {
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
    const input = this.querySelector(`[${selector5}-input]`);
    const label = this.querySelector(`[${selector5}-label]`);
    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
      throw new TypeError(
        `<${selector5}> must have an <input>-element with type 'checkbox' and the attribute '${selector5}-input'`
      );
    }
    if (!(label instanceof HTMLElement)) {
      throw new TypeError(
        `<${selector5}> must have an element with the attribute '${selector5}-label'`
      );
    }
    initialise2(this, label, input);
  }
  checkValidity() {
    return this.internals?.checkValidity() ?? true;
  }
  reportValidity() {
    return this.internals?.reportValidity() ?? true;
  }
};
PalmerSwitch.formAssociated = true;
customElements.define(selector5, PalmerSwitch);

// src/tooltip.js
var selector6 = "palmer-tooltip";
var positionAttribute = `${selector6}-position`;
var store6 = /* @__PURE__ */ new WeakMap();
function createFloater(anchor) {
  const id = anchor.getAttribute("aria-describedby") ?? anchor.getAttribute("aria-labelledby");
  const element = id === null ? null : document.querySelector(`#${id}`);
  if (element === null) {
    throw new TypeError(
      `A '${selector6}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`
    );
  }
  element.setAttribute(`${selector6}-content`, "");
  element.ariaHidden = "true";
  element.hidden = true;
  element.role = "tooltip";
  return element;
}
function createTooltip(anchor) {
  if (!store6.has(anchor)) {
    store6.set(anchor, new PalmerTooltip(anchor));
  }
}
function destroyTooltip(anchor) {
  const tooltip = store6.get(anchor);
  if (tooltip === void 0) {
    return;
  }
  tooltip.handleCallbacks(false);
  store6.delete(anchor);
}
function observe3(records) {
  for (const record of records) {
    if (record.type !== "attributes") {
      continue;
    }
    if (record.target.getAttribute(selector6) === null) {
      destroyTooltip(record.target);
    } else {
      createTooltip(record.target);
    }
  }
}
var PalmerTooltip = class {
  /**
   * @constructor
   * @param {HTMLElement} anchor
   */
  constructor(anchor) {
    this.anchor = anchor;
    this.callbacks = {
      click: this.onClick.bind(this),
      hide: this.onHide.bind(this),
      keydown: this.onKeyDown.bind(this),
      show: this.onShow.bind(this)
    };
    this.tabbable = isTabbable(anchor);
    this.floater = createFloater(anchor);
    this.timer = void 0;
    this.handleCallbacks(true);
  }
  /**
   * @param {Event} event
   */
  onClick(event) {
    if (findParent(
      event.target,
      (element) => [this.anchor, this.floater].includes(element)
    ) === void 0) {
      this.toggle(false);
    }
  }
  onHide() {
    this.toggle(false);
  }
  /**
   * @param {Event} event
   */
  onKeyDown(event) {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      this.toggle(false);
    }
  }
  onShow() {
    this.toggle(true);
  }
  /**
   * @param {boolean} show
   */
  toggle(show) {
    const method = show ? "addEventListener" : "removeEventListener";
    document[method]("click", this.callbacks.click, eventOptions.passive);
    document[method]("keydown", this.callbacks.keydown, eventOptions.passive);
    if (show) {
      this.timer?.stop();
      this.timer = updateFloated({
        elements: {
          anchor: this.anchor,
          floater: this.floater
        },
        position: {
          attribute: positionAttribute,
          defaultValue: "vertical",
          preferAbove: true
        }
      });
    } else {
      this.floater.hidden = true;
      this.timer?.stop();
    }
  }
  /**
   * @private
   * @param {boolean} add
   */
  handleCallbacks(add) {
    const { anchor, floater, tabbable: tabbable3 } = this;
    const method = add ? "addEventListener" : "removeEventListener";
    for (const element of [anchor, floater]) {
      element[method]("mouseenter", this.callbacks.show, eventOptions.passive);
      element[method]("mouseleave", this.callbacks.hide, eventOptions.passive);
      element[method]("touchstart", this.callbacks.show, eventOptions.passive);
    }
    if (tabbable3) {
      anchor[method]("blur", this.callbacks.hide, eventOptions.passive);
      anchor[method]("focus", this.callbacks.show, eventOptions.passive);
    }
  }
};
var observer2 = new MutationObserver(observe3);
observer2.observe(
  document,
  {
    attributeFilter: [selector6],
    attributeOldValue: true,
    attributes: true,
    childList: true,
    subtree: true
  }
);
wait(
  () => {
    const elements = Array.from(document.querySelectorAll(`[${selector6}]`));
    for (const element of elements) {
      element.setAttribute(selector6, "");
    }
  },
  0
);
