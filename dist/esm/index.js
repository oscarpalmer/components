// src/helpers/event.js
var toggleClosed = 'closed';
var toggleOpen = 'open';
function getCoordinates(event) {
	if (event instanceof MouseEvent) {
		return {
			x: event.clientX,
			y: event.clientY,
		};
	}
	const x = event.touches[0]?.clientX;
	const y = event.touches[0]?.clientY;
	return typeof x === 'number' && typeof y === 'number' ? {x, y} : void 0;
}
function getOptions(passive, capture) {
	return {
		capture: capture ?? false,
		passive: passive ?? true,
	};
}
function getToggleState(open3) {
	return {
		newState: open3 ? toggleOpen : toggleClosed,
		oldState: open3 ? toggleClosed : toggleOpen,
	};
}

// src/accordion.js
var keys = /* @__PURE__ */ new Set([
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'End',
	'Home',
]);
var skip = /* @__PURE__ */ new WeakSet();
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
	if (
		document.activeElement?.getAttribute('palmer-disclosure-button') ===
			void 0 ||
		!keys.has(event.key)
	) {
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
		case 'ArrowDown':
		case 'ArrowRight': {
			destination = current + 1;
			break;
		}
		case 'ArrowLeft':
		case 'ArrowUp': {
			destination = current - 1;
			break;
		}
		case 'End': {
			destination = stored.elements.length - 1;
			break;
		}
		case 'Home': {
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
	if (destination !== current) {
		stored.elements[destination]?.button.focus();
	}
}
function setAttribute(component, multiple) {
	if (component.multiple === multiple || skip.has(component)) {
		skip.delete(component);
		return;
	}
	skip.add(component);
	if (multiple) {
		component.setAttribute('multiple', '');
		return;
	}
	component.removeAttribute('multiple');
	toggleDisclosures(
		component,
		store.get(component)?.elements.find(element => element.open),
	);
}
function setDisclosures(component) {
	const stored = store.get(component);
	if (stored === void 0) {
		return;
	}
	stored.elements = [
		...component.querySelectorAll(':scope > palmer-disclosure'),
	];
	for (const element of stored.elements) {
		element.addEventListener('toggle', event => {
			if (event.detail.newState === 'open') {
				toggleDisclosures(component, element);
			}
		});
	}
}
function toggleDisclosures(component, active) {
	if (component.multiple) {
		return;
	}
	const stored = store.get(component);
	if (stored === void 0) {
		return;
	}
	for (const element of stored.elements) {
		if (element !== active && element.open) {
			element.hide();
		}
	}
}
var PalmerAccordion = class extends HTMLElement {
	/** @returns {boolean} */
	get multiple() {
		const multiple = this.getAttribute('multiple');
		return !(multiple === null || multiple === 'false');
	}
	/** @param {boolean} multiple */
	set multiple(multiple) {
		setAttribute(this, multiple);
	}
	constructor() {
		super();
		const stored = {
			elements: [],
			observer: new MutationObserver(_ => setDisclosures(this)),
		};
		store.set(this, stored);
		setDisclosures(this);
		this.addEventListener(
			'keydown',
			event => onKeydown(this, event),
			getOptions(false),
		);
		setAttribute(this, this.multiple);
	}
	attributeChangedCallback(name) {
		if (name === 'multiple') {
			toggleDisclosures(
				this,
				store.get(this)?.elements.find(element => element.open),
			);
		}
	}
	connectedCallback() {
		store.get(this)?.observer.observe(this, {
			childList: true,
			subtree: true,
		});
	}
	disconnectedCallback() {
		store.get(this)?.observer.disconnect();
	}
};
PalmerAccordion.observedAttributes = ['multiple'];
customElements.define('palmer-accordion', PalmerAccordion);

// src/helpers/touchy.js
var isTouchy = (() => {
	let value = false;
	try {
		if ('matchMedia' in window) {
			const media = matchMedia('(pointer: coarse)');
			if (typeof media?.matches === 'boolean') {
				value = media.matches;
			}
		}
		if (!value) {
			value =
				'ontouchstart' in window ||
				navigator.maxTouchPoints > 0 ||
				(navigator.msMaxTouchPoints ?? 0) > 0;
		}
	} catch {
		value = false;
	}
	return value;
})();
var methods = {
	begin: isTouchy ? 'touchstart' : 'mousedown',
	end: isTouchy ? 'touchend' : 'mouseup',
	move: isTouchy ? 'touchmove' : 'mousemove',
};

// src/colour-picker.js
var arrowKeys = /^arrow(?:(down)|(left)|(right)|(up))/i;
var backgroundImage = [
	'linear-gradient(to bottom',
	'hsl(0 0% 100%) 0%',
	'hsl(0 0% 100% / 0) 50%',
	'hsl(0 0% 0% / 0) 50%',
	'hsl(0 0% 0%) 100%)',
	'linear-gradient(to right',
	'hsl(0 0% 50%) 0%',
	'hsl(0 0% 50% / 0) 100%)',
];
var hexGroups = /^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
var hexValue = /^([\da-f]{3}){1,2}$/i;
var store2 = /* @__PURE__ */ new WeakMap();
var selector = 'palmer-colour-picker';
function createHue(element, input) {
	element.hidden = false;
	input.type = 'range';
	input.max = 360;
	input.min = 0;
}
function createWell(well, handle) {
	well.hidden = false;
	well.style.backgroundColor = 'hsl(var(--hue-value) 100% 50%)';
	well.style.backgroundImage = backgroundImage;
	well.style.position = 'relative';
	handle.tabIndex = 0;
	handle.style.position = 'absolute';
	handle.style.top = 0;
	handle.style.left = 0;
	handle.style.transform = 'translate3d(-50%, -50%, 0)';
}
function getHex(value, defaultValue) {
	let normalised = normaliseHex(value);
	if (!validateHex(normalised)) {
		return defaultValue;
	}
	if (normalised.length === 3) {
		normalised = normalised
			.split('')
			.map(character => `${character}${character}`)
			.join('');
	}
	return normalised;
}
function hexToRgb(value) {
	const hex = getHex(value);
	if (hex === void 0) {
		return void 0;
	}
	const pairs = hex.match(hexGroups);
	const rgb = [];
	for (let index4 = 0; index4 < 3; index4 += 1) {
		rgb.push(Number.parseInt(pairs[index4 + 1], 16));
	}
	return {red: rgb[0], green: rgb[1], blue: rgb[2]};
}
function hslToRgb(value) {
	function f(n) {
		const k = (n + hue / 30) % 12;
		const a = saturation * Math.min(lightness, 1 - lightness);
		return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
	}
	let {hue, saturation, lightness} = value;
	hue %= 360;
	if (hue < 0) {
		hue += 360;
	}
	saturation /= 100;
	lightness /= 100;
	return {
		red: Math.round(f(0) * 255),
		green: Math.round(f(8) * 255),
		blue: Math.round(f(4) * 255),
	};
}
function normaliseHex(value) {
	return value?.replace(/^(#|\s)|\s$/g, '') ?? '';
}
function onDocumentKeydown(event) {
	if (event.key !== 'Escape') {
		return;
	}
	event.stopPropagation();
	stopMove(this, true);
}
function onDocumentPointerEnd() {
	stopMove(this, false);
}
function onDocumentPointerMove(event) {
	if (isTouchy) {
		event.preventDefault();
	}
	const {height, left, top, width} = this.well.getBoundingClientRect();
	const {x, y} = getCoordinates(event);
	const lightness = 100 - Math.round(((y - top) / height) * 100);
	const saturation = Math.round(((x - left) / width) * 100);
	setValue(this, saturation, lightness);
}
function onHueChange() {
	this.hsl.hue = Number.parseInt(this.hueInput.value, 10);
	update(this);
}
function onInputKeydown(event) {
	if (event.key !== 'Enter') {
		return;
	}
	event.preventDefault();
	const rgb = hexToRgb(this.input.value);
	if (rgb === void 0) {
		return;
	}
	const hsl = rgbToHsl(rgb);
	this.hsl.hue = hsl.hue;
	this.hsl.saturation = hsl.saturation;
	this.hsl.lightness = hsl.lightness;
	update(this);
}
function onWellKeydown(event) {
	const match = arrowKeys.exec(event.key);
	if (match === null) {
		return;
	}
	event.preventDefault();
	let {lightness, saturation} = this.hsl;
	lightness += match[1] ? -1 : match[4] ? 1 : 0;
	saturation += match[2] ? -1 : match[3] ? 1 : 0;
	setValue(this, saturation, lightness);
}
function onWellPointerBegin(event) {
	if (
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey ||
		event.button > 0
	) {
		return;
	}
	event.stopPropagation();
	onDocumentPointerMove.call(this, event);
	const stored = {
		callbacks: {
			onKeydown: onDocumentKeydown.bind(this),
			onPointerEnd: onDocumentPointerEnd.bind(this),
			onPointerMove: onDocumentPointerMove.bind(this),
		},
		hsl: {
			hue: this.hsl.hue,
			saturation: this.hsl.saturation,
			lightness: this.hsl.lightness,
		},
	};
	setCallbacks(stored.callbacks, true);
	store2.set(this, stored);
}
function rgbToHex(value) {
	return `#${(value.blue | (value.green << 8) | (value.red << 16) | (1 << 24))
		.toString(16)
		.slice(1)}`;
}
function rgbToHsl(rgb) {
	let {red, green, blue} = rgb;
	red /= 255;
	green /= 255;
	blue /= 255;
	const min = Math.min(red, green, blue);
	const max = Math.max(red, green, blue);
	const chroma = max - min;
	const lightness = max - chroma / 2;
	let hue = 0;
	let saturation = 0;
	switch (chroma) {
		case red: {
			hue = ((green - blue) / chroma) % 6;
			break;
		}
		case green: {
			hue = (blue - red) / chroma + 2;
			break;
		}
		case blue: {
			hue = (red - green) / chroma + 2;
			break;
		}
		default: {
			break;
		}
	}
	saturation =
		max === 0 || lightness === 0 || lightness === 0
			? 0
			: (max - lightness) / Math.min(lightness, 1 - lightness);
	hue *= 60;
	if (hue < 0) {
		hue += 360;
	}
	return {
		hue: Math.round(hue),
		saturation: Math.round(saturation * 100),
		lightness: Math.round(lightness * 100),
	};
}
function setCallbacks(callbacks, add) {
	const method = add ? document.addEventListener : document.removeEventListener;
	method('keydown', callbacks.onKeydown, getOptions(true, true));
	method(methods.end, callbacks.onPointerEnd, getOptions());
	method(methods.move, callbacks.onPointerMove, getOptions(!isTouchy));
	setStyles(add);
}
function setStyles(active) {
	document.body.style.userSelect = active ? 'none' : null;
	document.body.style.webkitUserSelect = active ? 'none' : null;
}
function setValue(component, saturation, lightness) {
	component.hsl.saturation =
		saturation < 0 ? 0 : saturation > 100 ? 100 : saturation;
	component.hsl.lightness =
		lightness < 0 ? 0 : lightness > 100 ? 100 : lightness;
	update(component);
}
function stopMove(component, reset) {
	const stored = store2.get(component);
	if (stored === void 0) {
		return;
	}
	setCallbacks(stored.callbacks, false);
	if (reset) {
		component.hsl.hue = stored.hsl.hue;
		component.hsl.lightness = stored.hsl.lightness;
		component.hsl.saturation = stored.hsl.saturation;
		update(component);
	}
	store2.delete(component);
	component.wellHandle.focus();
}
function validateHex(value) {
	return hexValue.test(normaliseHex(value));
}
function update(component) {
	const {hsl, hueInput, input} = component;
	hueInput.value = hsl.hue;
	updateCss(component);
	updateWell(component);
	input.value = rgbToHex(hslToRgb(hsl));
	input.dispatchEvent(new Event('change'));
}
function updateCss(component) {
	const {hue, lightness, saturation} = component.hsl;
	const handle = `${(hue / 360) * 100}%`;
	const value = `hsl(${hue} ${saturation}% ${lightness}%)`;
	for (const element of [component, component.hue, component.well]) {
		element.style.setProperty('--hue-handle', handle);
		element.style.setProperty('--hue-value', hue);
		element.style.setProperty('--value', value);
	}
}
function updateWell(component) {
	const {hsl, wellHandle} = component;
	wellHandle.style.top = `${100 - hsl.lightness}%`;
	wellHandle.style.left = `${hsl.saturation}%`;
}
var PalmerColourPicker = class extends HTMLElement {
	/**
	 * @returns {Value}
	 */
	get value() {
		const rgb = hslToRgb(this.hsl);
		return {
			rgb,
			hex: rgbToHex(rgb),
			hsl: this.hsl,
		};
	}
	constructor() {
		super();
		const hue = this.querySelector(`[${selector}-hue]`);
		const hueInput = hue?.querySelector(`[${selector}-hue-input]`);
		if (!(hue instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> needs an element with the attribute '${selector}-hue' to hold the hue input`,
			);
		}
		if (!(hueInput instanceof HTMLInputElement)) {
			throw new TypeError(
				`<${selector}> needs an <input>-element with the attribute '${selector}-hue-input'`,
			);
		}
		const input = this.querySelector(`[${selector}-input]`);
		if (
			!(input instanceof HTMLInputElement) ||
			!/^(color|text)$/i.test(input.type)
		) {
			throw new TypeError(
				`<${selector}> needs an <input>-element with the attribute '${selector}-input'`,
			);
		}
		const well = this.querySelector(`[${selector}-well]`);
		const wellHandle = well?.querySelector(`[${selector}-well-handle]`);
		if ([well, wellHandle].some(element => !(element instanceof HTMLElement))) {
			throw new TypeError(
				`<${selector}> needs two elements for the colour well: one wrapping element with the attribute '${selector}-well', and one within it with the attribute '${selector}-well-handle'`,
			);
		}
		this.hue = hue;
		this.hueInput = hueInput;
		this.input = input;
		this.well = well;
		this.wellHandle = wellHandle;
		input.pattern = '#?([\\da-fA-F]{3}){1,2}';
		input.type = 'text';
		const value = getHex(
			input.getAttribute('value') ?? this.getAttribute('value'),
			'000000',
		);
		const rgb = hexToRgb(value);
		this.hsl = rgbToHsl(rgb);
		createHue(hue, hueInput);
		createWell(well, wellHandle);
		input.addEventListener(
			'keydown',
			onInputKeydown.bind(this),
			getOptions(false),
		);
		wellHandle.addEventListener(
			'keydown',
			onWellKeydown.bind(this),
			getOptions(false),
		);
		wellHandle.addEventListener(
			methods.begin,
			onWellPointerBegin.bind(this),
			getOptions(),
		);
		well.addEventListener(
			methods.begin,
			onWellPointerBegin.bind(this),
			getOptions(),
		);
		hueInput.addEventListener('input', onHueChange.bind(this), getOptions());
		update(this);
	}
};
customElements.define(selector, PalmerColourPicker);

// src/helpers/index.js
function findParent(element, match, includeOriginal) {
	const matchIsSelector = typeof match === 'string';
	if (
		(includeOriginal ?? true) &&
		(matchIsSelector ? element.matches(match) : match(element))
	) {
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
function getNumber(value) {
	return typeof value === 'number'
		? value
		: Number.parseInt(typeof value === 'string' ? value : String(value), 10);
}
function getTextDirection(element) {
	return getComputedStyle?.(element)?.direction === 'rtl' ? 'rtl' : 'ltr';
}
function isNullableOrWhitespace(value) {
	return (value ?? '').trim().length === 0;
}

// src/helpers/focusable.js
var booleanAttribute = /^(|true)$/i;
var filters = [isDisabled, isNotTabbable, isInert, isHidden, isSummarised];
var selector2 = [
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]:not(slot)',
	'a[href]',
	'audio[controls]',
	'button',
	'details',
	'details > summary:first-of-type',
	'iframe',
	'input',
	'select',
	'textarea',
	'video[controls]',
]
	.map(selector9 => `${selector9}:not([inert])`)
	.join(',');
function getFocusableElements(element) {
	const items = Array.from(element.querySelectorAll(selector2))
		.map(element2 => ({element: element2, tabIndex: getTabIndex(element2)}))
		.filter(item => isFocusableFilter(item));
	const indiced = [];
	for (const item of items) {
		indiced[item.tabIndex] = [...(indiced[item.tabIndex] ?? []), item.element];
	}
	return indiced.flat();
}
function getTabIndex(element) {
	if (element.tabIndex > -1) {
		return element.tabIndex;
	}
	if (/^(audio|details|video)$/i.test(element.tagName) || isEditable(element)) {
		return hasTabIndex(element) ? -1 : 0;
	}
	return -1;
}
function hasTabIndex(element) {
	return !Number.isNaN(Number.parseInt(element.getAttribute('tabindex'), 10));
}
function isDisabled(item) {
	if (
		/^(button|input|select|textarea)$/i.test(item.element.tagName) &&
		isDisabledFromFieldset(item.element)
	) {
		return true;
	}
	return (
		(item.element.disabled ?? false) ||
		item.element.getAttribute('aria-disabled') === 'true'
	);
}
function isDisabledFromFieldset(element) {
	let parent = element.parentElement;
	while (parent !== null) {
		if (/^fieldset$/i.test(parent.tagName) && parent.disabled) {
			const children = Array.from(parent.children);
			for (const child of children) {
				if (/^legend$/i.test(child.tagName)) {
					return parent.matches('fieldset[disabled] *')
						? true
						: !child.contains(element);
				}
			}
			return true;
		}
		parent = parent.parentElement;
	}
	return false;
}
function isEditable(element) {
	return booleanAttribute.test(element.getAttribute('contenteditable'));
}
function isFocusable(element) {
	return isFocusableFilter({element, tabIndex: getTabIndex(element)});
}
function isFocusableFilter(item) {
	return !filters.some(callback => callback(item));
}
function isHidden(item) {
	if (
		item.element.hidden ||
		(item.element instanceof HTMLInputElement && item.element.type === 'hidden')
	) {
		return true;
	}
	const style = getComputedStyle(item.element);
	if (style.display === 'none' || style.visibility === 'hidden') {
		return true;
	}
	const {height, width} = item.element.getBoundingClientRect();
	return height === 0 && width === 0;
}
function isInert(item) {
	return (
		(item.element.inert ?? false) ||
		booleanAttribute.test(item.element.getAttribute('inert')) ||
		(item.element.parentElement !== null &&
			isInert({element: item.element.parentElement}))
	);
}
function isNotTabbable(item) {
	return item.tabIndex < 0;
}
function isSummarised(item) {
	return (
		/^details$/i.test(item.element.tagName) &&
		Array.from(item.element.children).some(child =>
			/^summary$/i.test(child.tagName),
		)
	);
}

// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var request =
	requestAnimationFrame ??
	function (callback) {
		return setTimeout?.(() => {
			callback(Date.now());
		}, milliseconds);
	};
function run(timed) {
	timed.state.active = true;
	timed.state.finished = false;
	const isRepeated = timed instanceof Repeated;
	let index4 = 0;
	let start;
	function step(timestamp) {
		if (!timed.state.active) {
			return;
		}
		start ?? (start = timestamp);
		const elapsed = timestamp - start;
		const elapsedMinimum = elapsed - milliseconds;
		const elapsedMaximum = elapsed + milliseconds;
		if (
			elapsedMinimum < timed.configuration.time &&
			timed.configuration.time < elapsedMaximum
		) {
			if (timed.state.active) {
				timed.callbacks.default(isRepeated ? index4 : void 0);
			}
			index4 += 1;
			if (isRepeated && index4 < timed.configuration.count) {
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
		const type = isRepeated ? 'repeated' : 'waited';
		if (typeof callback !== 'function') {
			throw new TypeError(`A ${type} timer must have a callback function`);
		}
		if (typeof time !== 'number' || time < 0) {
			throw new TypeError(
				`A ${type} timer must have a non-negative number as its time`,
			);
		}
		if (isRepeated && (typeof count !== 'number' || count < 2)) {
			throw new TypeError(
				'A repeated timer must have a number above 1 as its repeat count',
			);
		}
		if (
			isRepeated &&
			afterCallback !== void 0 &&
			typeof afterCallback !== 'function'
		) {
			throw new TypeError(
				"A repeated timer's after-callback must be a function",
			);
		}
		this.configuration = {count, time};
		this.callbacks = {
			after: afterCallback,
			default: callback,
		};
		this.state = {
			active: false,
			finished: false,
			frame: null,
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
var Repeated = class extends Timed {};
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

// src/focus-trap.js
var selector3 = 'palmer-focus-trap';
var store3 = /* @__PURE__ */ new WeakMap();
function create(element) {
	if (!store3.has(element)) {
		store3.set(element, new FocusTrap(element));
	}
}
function destroy(element) {
	const focusTrap = store3.get(element);
	if (focusTrap === void 0) {
		return;
	}
	store3.delete(element);
}
function handleEvent(event, focusTrap, element) {
	const elements = getFocusableElements(focusTrap);
	if (element === focusTrap) {
		wait(() => {
			(elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
		}, 0);
		return;
	}
	const index4 = elements.indexOf(element);
	let target = focusTrap;
	if (index4 > -1) {
		let position = index4 + (event.shiftKey ? -1 : 1);
		if (position < 0) {
			position = elements.length - 1;
		} else if (position >= elements.length) {
			position = 0;
		}
		target = elements[position] ?? focusTrap;
	}
	wait(() => {
		target.focus();
	}, 0);
}
function observe(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}
		if (record.target.getAttribute(selector3) === void 0) {
			destroy(record.target);
		} else {
			create(record.target);
		}
	}
}
function onKeydown2(event) {
	if (event.key !== 'Tab') {
		return;
	}
	const focusTrap = findParent(event.target, `[${selector3}]`);
	if (focusTrap === void 0) {
		return;
	}
	event.preventDefault();
	event.stopImmediatePropagation();
	handleEvent(event, focusTrap, event.target);
}
var FocusTrap = class {};
var observer = new MutationObserver(observe);
observer.observe(document, {
	attributeFilter: [selector3],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});
wait(() => {
	const elements = Array.from(document.querySelectorAll(`[${selector3}]`));
	for (const element of elements) {
		element.setAttribute(selector3, '');
	}
}, 0);
document.addEventListener('keydown', onKeydown2, getOptions(false));

// src/dialog.js
var selector4 = 'palmer-dialog';
var closeAttribute = `${selector4}-close`;
var openAttribute = `${selector4}-open`;
var focused = /* @__PURE__ */ new WeakMap();
var parents = /* @__PURE__ */ new WeakMap();
function close(before, component, target) {
	if (
		!component.dispatchEvent(
			new CustomEvent(before, {
				cancelable: true,
				detail: {target},
			}),
		)
	) {
		return;
	}
	component.hidden = true;
	parents.get(component)?.append(component);
	focused.get(component)?.focus();
	focused.delete(component);
	component.dispatchEvent(
		new CustomEvent('close', {
			detail: {target},
		}),
	);
}
function defineButton(button) {
	button.addEventListener('click', onOpen, getOptions());
}
function onKeydown3(event) {
	if (event.key === 'Escape') {
		close('cancel', this, document.activeElement);
	}
}
function onOpen() {
	const dialog = document.querySelector(`#${this.getAttribute(openAttribute)}`);
	if (!(dialog instanceof PalmerDialog)) {
		return;
	}
	focused.set(dialog, this);
	open2(dialog);
}
function open2(component) {
	if (
		!component.dispatchEvent(
			new CustomEvent('show', {
				cancelable: true,
			}),
		)
	) {
		return;
	}
	component.hidden = false;
	document.body.append(component);
	(getFocusableElements(component)[0] ?? component).focus();
	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail: 'open',
		}),
	);
}
var PalmerDialog = class extends HTMLElement {
	/** @returns {boolean} */
	get alert() {
		return this.getAttribute('role') === 'alertdialog';
	}
	/** @returns {boolean} */
	get open() {
		return this.parentElement === document.body && !this.hidden;
	}
	/** @param {boolean} value */
	set open(value) {
		if (typeof value !== 'boolean' || this.open === value) {
			return;
		}
		if (value) {
			open2(this);
		} else {
			close('cancel', this);
		}
	}
	constructor() {
		super();
		this.hidden = true;
		const {id} = this;
		if (isNullableOrWhitespace(id)) {
			throw new TypeError(`<${selector4}> must have an ID`);
		}
		if (
			isNullableOrWhitespace(this.getAttribute('aria-label')) &&
			isNullableOrWhitespace(this.getAttribute('aria-labelledby'))
		) {
			throw new TypeError(
				`<${selector4}> should be labelled by either the 'aria-label' or 'aria-labelledby'-attribute`,
			);
		}
		const isAlert =
			this.getAttribute('role') === 'alertdialog' ||
			this.getAttribute('type') === 'alert';
		if (
			isAlert &&
			isNullableOrWhitespace(this.getAttribute('aria-describedby'))
		) {
			throw new TypeError(
				`<${selector4}> for alerts should be described by the 'aria-describedby'-attribute`,
			);
		}
		const closers = Array.from(this.querySelectorAll(`[${closeAttribute}]`));
		if (!closers.some(closer => closer instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector4}> must have a <button>-element with the attribute '${closeAttribute}'`,
			);
		}
		const content = this.querySelector(`:scope > [${selector4}-content]`);
		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector4}> must have an element with the attribute '${selector4}-content'`,
			);
		}
		const overlay = this.querySelector(`:scope > [${selector4}-overlay]`);
		if (!(overlay instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector4}> must have an element with the attribute '${selector4}-overlay'`,
			);
		}
		parents.set(this, this.parentElement);
		content.tabIndex = -1;
		overlay.setAttribute('aria-hidden', true);
		this.setAttribute('role', isAlert ? 'alertdialog' : 'dialog');
		this.setAttribute('aria-modal', true);
		this.setAttribute(selector3, '');
		this.addEventListener('keydown', onKeydown3.bind(this), getOptions());
		for (const closer of closers) {
			const isOverlay = closer === overlay;
			if (isAlert && isOverlay) {
				continue;
			}
			closer.addEventListener(
				'click',
				() => close(isOverlay ? 'cancel' : 'beforeclose', this, closer),
				getOptions(),
			);
		}
	}
	hide() {
		this.open = false;
	}
	show() {
		this.open = true;
	}
};
customElements.define(selector4, PalmerDialog);
var observer2 = new MutationObserver(records => {
	for (const record of records) {
		if (
			record.type === 'attributes' &&
			record.target instanceof HTMLButtonElement
		) {
			defineButton(record.target);
		}
	}
});
observer2.observe(document, {
	attributeFilter: [openAttribute],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});
setTimeout(() => {
	const elements = Array.from(document.querySelectorAll(`[${openAttribute}]`));
	for (const element of elements) {
		defineButton(element);
	}
}, 0);

// src/disclosure.js
var selector5 = 'palmer-disclosure';
var skip2 = /* @__PURE__ */ new WeakSet();
var index = 0;
function setAttributes(component, button, open3) {
	skip2.add(component);
	if (open3) {
		component.setAttribute('open', '');
	} else {
		component.removeAttribute('open');
	}
	button.setAttribute('aria-expanded', open3);
}
function setExpanded(component, open3) {
	if (component.open === open3 || skip2.has(component)) {
		skip2.delete(component);
		return;
	}
	const detail = getToggleState(open3);
	if (
		!component.dispatchEvent(
			new CustomEvent('beforetoggle', {
				detail,
				cancelable: true,
			}),
		)
	) {
		return;
	}
	setAttributes(component, component.button, open3);
	component.content.hidden = !open3;
	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail,
		}),
	);
}
var PalmerDisclosure = class extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		const open3 = this.getAttribute('open');
		return !(open3 === null || open3 === 'false');
	}
	/** @param {boolean} value */
	set open(value) {
		if (typeof value === 'boolean') {
			setExpanded(this, value);
		}
	}
	constructor() {
		super();
		const button = this.querySelector(`[${selector5}-button]`);
		const content = this.querySelector(`[${selector5}-content]`);
		if (!(button instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector5}> needs a <button>-element with the attribute '${selector5}-button'`,
			);
		}
		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector5}> needs an element with the attribute '${selector5}-content'`,
			);
		}
		this.button = button;
		this.content = content;
		button.hidden = false;
		content.hidden = true;
		let {id} = content;
		if (isNullableOrWhitespace(id)) {
			id = `palmer_disclosure_${++index}`;
		}
		button.setAttribute('aria-controls', id);
		button.setAttribute('aria-expanded', false);
		content.id = id;
		button.addEventListener(
			'click',
			_ => setExpanded(this, !this.open),
			getOptions(),
		);
		if (!this.open) {
			return;
		}
		content.hidden = false;
		setExpanded(this, true);
	}
	/**
	 * @param {string} name
	 * @param {string|null} newValue
	 */
	attributeChangedCallback(name, _, newValue) {
		if (name === 'open') {
			setExpanded(this, !(newValue === null || newValue === 'false'));
		}
	}
	hide() {
		setExpanded(this, false);
	}
	show() {
		setExpanded(this, true);
	}
	toggle() {
		setExpanded(this, !this.open);
	}
};
PalmerDisclosure.observedAttributes = ['open'];
customElements.define(selector5, PalmerDisclosure);

// src/helpers/floated.js
var allPositions = [
	'above',
	'above-left',
	'above-right',
	'below',
	'below-left',
	'below-right',
	'horizontal',
	'horizontal-bottom',
	'horizontal-top',
	'left',
	'left-bottom',
	'left-top',
	'right',
	'right-bottom',
	'right-top',
	'vertical',
	'vertical-left',
	'vertical-right',
];
var centeredXAxis = /^(above|below|vertical)$/i;
var centeredYAxis = /^(horizontal|left|right)$/i;
var domRectKeys = ['bottom', 'height', 'left', 'right', 'top', 'width'];
var prefixHorizontal = /^horizontal/i;
var prefixVertical = /^vertical/i;
function getAbsolute(parameters) {
	const {end, max, offset, preferMin, start} = parameters;
	const maxPosition = end + offset;
	const minPosition = start - offset;
	if (preferMin) {
		if (minPosition >= 0) {
			return minPosition;
		}
		return maxPosition <= max ? end : minPosition;
	}
	if (maxPosition <= max) {
		return end;
	}
	return minPosition >= 0 ? minPosition : end;
}
function getAttribute(position, anchor, values) {
	const {left, top} = values;
	if (prefixHorizontal.test(position)) {
		return position.replace(
			'horizontal',
			anchor.right - 1 < left && left < anchor.right + 1 ? 'right' : 'left',
		);
	}
	if (prefixVertical.test(position)) {
		return position.replace(
			'vertical',
			anchor.bottom - 1 < top && top < anchor.bottom + 1 ? 'below' : 'above',
		);
	}
	return position;
}
function getCentered(xAxis, position, rectangles, preferMin) {
	const {anchor, floater} = rectangles;
	if ((xAxis ? centeredXAxis : centeredYAxis).test(position)) {
		const offset = (xAxis ? anchor.width : anchor.height) / 2;
		const size = (xAxis ? floater.width : floater.height) / 2;
		return (xAxis ? anchor.left : anchor.top) + offset - size;
	}
	if ((xAxis ? prefixHorizontal : prefixVertical).test(position)) {
		return getAbsolute({
			preferMin,
			end: xAxis ? anchor.right : anchor.bottom,
			max: xAxis ? innerWidth : innerHeight,
			offset: xAxis ? floater.width : floater.height,
			start: xAxis ? anchor.left : anchor.top,
		});
	}
	return void 0;
}
function getPosition(currentPosition, defaultPosition) {
	if (currentPosition === null) {
		return defaultPosition;
	}
	const normalized = currentPosition.trim().toLowerCase();
	const index4 = allPositions.indexOf(normalized);
	return index4 > -1
		? allPositions[index4] ?? defaultPosition
		: defaultPosition;
}
function getValue(xAxis, position, rectangles, preferMin) {
	const {anchor, floater} = rectangles;
	if ((xAxis ? /^right/i : /top$/i).test(position)) {
		return xAxis ? anchor.right : anchor.top;
	}
	if ((xAxis ? /^left/i : /bottom$/i).test(position)) {
		return (
			(xAxis ? anchor.left : anchor.bottom) -
			(xAxis ? floater.width : floater.height)
		);
	}
	if ((xAxis ? /right$/i : /^above/i).test(position)) {
		return (
			(xAxis ? anchor.right : anchor.top) -
			(xAxis ? floater.width : floater.height)
		);
	}
	const centered = getCentered(xAxis, position, rectangles, preferMin);
	if (centered !== void 0) {
		return centered;
	}
	return xAxis ? anchor.left : anchor.bottom;
}
function updateFloated(parameters) {
	const {anchor, floater, parent} = parameters.elements;
	const {attribute, defaultValue, preferAbove} = parameters.position;
	const position = getPosition(
		(parent ?? anchor).getAttribute(attribute) ?? '',
		defaultValue,
	);
	const rightToLeft = getTextDirection(floater) === 'rtl';
	let previous;
	function afterRepeat() {
		anchor.after(floater);
	}
	function onRepeat(step) {
		const rectangle = anchor.getBoundingClientRect();
		if (
			step > 10 &&
			domRectKeys.every(key => previous?.[key] === rectangle[key])
		) {
			return;
		}
		previous = rectangle;
		const rectangles = {
			anchor: rectangle,
			floater: floater.getBoundingClientRect(),
		};
		const values = {
			left: getValue(true, position, rectangles, rightToLeft),
			top: getValue(false, position, rectangles, preferAbove),
		};
		const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;
		if (floater.style.transform === matrix) {
			return;
		}
		floater.setAttribute('position', getAttribute(position, rectangle, values));
		floater.style.position = 'fixed';
		floater.style.inset = '0 auto auto 0';
		floater.style.transform = matrix;
	}
	document.body.append(floater);
	floater.hidden = false;
	return new Repeated(
		onRepeat,
		0,
		Number.POSITIVE_INFINITY,
		afterRepeat,
	).start();
}

// src/popover.js
var closeKeys = /^\s|enter$/i;
var selector6 = 'palmer-popover';
var store4 = /* @__PURE__ */ new WeakMap();
var index2 = 0;
function afterToggle(component, active) {
	handleCallbacks(component, active);
	wait(() => {
		(active
			? getFocusableElements(component.content)?.[0] ?? component.content
			: component.button
		)?.focus();
	}, 0);
	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail: getToggleState(active),
		}),
	);
}
function handleCallbacks(component, add) {
	const callbacks = store4.get(component);
	if (callbacks === void 0) {
		return;
	}
	const method = add ? 'addEventListener' : 'removeEventListener';
	document[method](methods.begin, callbacks.pointer, getOptions());
	document[method]('keydown', callbacks.keydown, getOptions());
}
function handleToggle(component, expand) {
	const expanded = typeof expand === 'boolean' ? !expand : component.open;
	if (
		!component.dispatchEvent(
			new CustomEvent('beforetoggle', {
				cancelable: true,
				detail: getToggleState(expanded),
			}),
		)
	) {
		return;
	}
	component.button.setAttribute('aria-expanded', !expanded);
	component.timer?.stop();
	if (expanded) {
		component.content.hidden = true;
	} else {
		component.timer = updateFloated({
			elements: {
				anchor: component.button,
				floater: component.content,
				parent: component,
			},
			position: {
				attribute: 'position',
				defaultValue: 'vertical',
				preferAbove: false,
			},
		});
	}
	afterToggle(component, !expanded);
}
function onClose(event) {
	if (!(event instanceof KeyboardEvent) || closeKeys.test(event.key)) {
		handleToggle(this, false);
	}
}
function onDocumentKeydown2(event) {
	if (this.open && event instanceof KeyboardEvent && event.key === 'Escape') {
		handleToggle(this, false);
	}
}
function onDocumentPointer(event) {
	if (
		this.open &&
		findParent(event.target, parent =>
			[this.button, this.content].includes(parent),
		) === void 0
	) {
		handleToggle(this, false);
	}
}
function onToggle() {
	handleToggle(this);
}
function setButtons(component) {
	component.button.addEventListener(
		'click',
		onToggle.bind(component),
		getOptions(),
	);
	const buttons = Array.from(
		component.querySelectorAll(`[${selector6}-close]`),
	);
	for (const button of buttons) {
		button.addEventListener('click', onClose.bind(component), getOptions());
	}
}
var PalmerPopover = class extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		return this.button.getAttribute('aria-expanded') === 'true';
	}
	/** @param {boolean} value */
	set open(value) {
		if (typeof value === 'boolean' && value !== this.open) {
			handleToggle(this, open);
		}
	}
	constructor() {
		super();
		if (findParent(this, selector6, false)) {
			throw new TypeError(
				`<${selector6}>-elements must not be nested within each other`,
			);
		}
		const button = this.querySelector(`[${selector6}-button]`);
		const content = this.querySelector(`[${selector6}-content]`);
		if (!(button instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector6}> must have a <button>-element with the attribute '${selector6}-button`,
			);
		}
		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector6}> must have an element with the attribute '${selector6}-content'`,
			);
		}
		this.button = button;
		this.content = content;
		this.timer = void 0;
		content.hidden = true;
		if (isNullableOrWhitespace(this.id)) {
			this.id = `palmer_popover_${++index2}`;
		}
		if (isNullableOrWhitespace(button.id)) {
			button.id = `${this.id}_button`;
		}
		if (isNullableOrWhitespace(content.id)) {
			content.id = `${this.id}_content`;
		}
		button.setAttribute('aria-controls', content.id);
		button.setAttribute('aria-expanded', false);
		button.setAttribute('aria-haspopup', 'dialog');
		content.setAttribute('role', 'dialog');
		content.setAttribute('aria-modal', false);
		content.setAttribute(selector3, '');
		store4.set(this, {
			keydown: onDocumentKeydown2.bind(this),
			pointer: onDocumentPointer.bind(this),
		});
		setButtons(this);
	}
	hide() {
		this.open = false;
	}
	show() {
		this.open = true;
	}
	toggle() {
		handleToggle(this);
	}
};
customElements.define(selector6, PalmerPopover);

// src/splitter.js
var arrowKeys2 = /^arrow(down|left|right|up)$/i;
var backwardKeys = /^arrow(left|up)$/i;
var horizontalKeys = /^arrow(left|right)$/i;
var selector7 = 'palmer-splitter';
var separatorKeys = /^(arrow(down|left|right|up)|end|escape|home)$/i;
var splitterTypes = /* @__PURE__ */ new Set(['horizontal', 'vertical']);
var verticalKeys = /^arrow(up|down)$/i;
var store5 = /* @__PURE__ */ new WeakMap();
var index3 = 0;
function onDocumentKeydown3(event) {
	if (event.key === 'Escape') {
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
	const value =
		this.type === 'horizontal'
			? (coordinates.x - componentRectangle.left) / componentRectangle.width
			: (coordinates.y - componentRectangle.top) / componentRectangle.height;
	setFlexValue(this, {
		separator: this.separator,
		value: value * 100,
	});
}
function onSeparatorKeydown(component, event) {
	if (!separatorKeys.test(event.key)) {
		return;
	}
	if (
		(component.type === 'horizontal' ? verticalKeys : horizontalKeys).test(
			event.key,
		)
	) {
		return;
	}
	const {values} = store5.get(component);
	if (values === void 0) {
		return;
	}
	let value;
	if (arrowKeys2.test(event.key)) {
		value = Math.round(
			component.value + (backwardKeys.test(event.key) ? -1 : 1),
		);
	} else if (event.key === 'Escape') {
		value = values.initial ?? values.original;
		values.initial = void 0;
	} else {
		value = event.key === 'End' ? values.maximum : values.minimum;
	}
	setFlexValue(component, {
		value,
		values,
		separator: component.separator,
	});
}
function setAbsoluteValue(component, parameters) {
	const {key, separator, setFlex} = parameters;
	const values = parameters.values ?? store5.get(component)?.values;
	let value = getNumber(parameters.value);
	if (
		values === void 0 ||
		Number.isNaN(value) ||
		value === values[key] ||
		(key === 'maximum' && value < values.minimum) ||
		(key === 'minimum' && value > values.maximum)
	) {
		return;
	}
	if (key === 'maximum' && value > 100) {
		value = 100;
	} else if (key === 'minimum' && value < 0) {
		value = 0;
	}
	values[parameters.key] = value;
	separator.setAttribute(
		key === 'maximum' ? 'aria-valuemax' : 'aria-valuemin',
		value,
	);
	if (
		setFlex &&
		((key === 'maximum' && value < values.current) ||
			(key === 'minimum' && value > values.current))
	) {
		setFlexValue(component, {
			separator,
			value,
			values,
		});
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
	const method = active ? 'addEventListener' : 'removeEventListener';
	document[method]('keydown', stored.callbacks.keydown, getOptions());
	document[method](methods.end, stored.callbacks.pointerEnd, getOptions());
	document[method](
		methods.move,
		stored.callbacks.pointerMove,
		getOptions(!isTouchy),
	);
	stored.dragging = active;
	component.handle.style.userSelect = active ? 'none' : null;
	component.handle.style.webkitUserSelect = active ? 'none' : null;
}
function setFlexValue(component, parameters) {
	const {separator} = parameters;
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
	separator.setAttribute('aria-valuenow', value);
	component.primary.style.flex = `${value / 100}`;
	component.secondary.style.flex = `${(100 - value) / 100}`;
	values.current = value;
	component.dispatchEvent(new CustomEvent('change', {detail: value}));
}
function updateHandle(component) {
	const {handle} = component;
	handle.hidden = false;
	handle.setAttribute('aria-hidden', true);
	handle.addEventListener(
		methods.begin,
		() => onPointerBegin(component),
		getOptions(),
	);
}
function updateSeparator(component) {
	const {separator} = component;
	separator.hidden = false;
	separator.tabIndex = 0;
	separator.setAttribute('role', 'separator');
	separator.setAttribute('aria-controls', component.primary.id);
	separator.setAttribute('aria-valuemax', 100);
	separator.setAttribute('aria-valuemin', 0);
	separator.setAttribute('aria-valuenow', 50);
	if (isNullableOrWhitespace(component.getAttribute('value'))) {
		setFlexValue(component, {
			separator,
			value: 50,
		});
	}
	separator.addEventListener(
		'keydown',
		event => onSeparatorKeydown(component, event),
		getOptions(),
	);
}
var PalmerSplitter = class extends HTMLElement {
	/** @returns {number|undefined} */
	get max() {
		return store5.get(this)?.values.maximum;
	}
	/** @param {number} max */
	set max(max) {
		this.setAttribute('max', max);
	}
	/** @returns {number|undefined} */
	get min() {
		return store5.get(this)?.values.minimum;
	}
	/** @param {number} min */
	set min(min) {
		this.setAttribute('min', min);
	}
	/** @returns {'horizontal'|'vertical'} */
	get type() {
		const type = this.getAttribute('type') ?? 'horizontal';
		return splitterTypes.has(type) ? type : 'horizontal';
	}
	/** @param {'horizontal'|'vertical'} type */
	set type(type) {
		this.setAttribute('type', type);
	}
	/** @returns {number|undefined} */
	get value() {
		return store5.get(this)?.values.current;
	}
	/** @param {number} value */
	set value(value) {
		this.setAttribute('value', value);
	}
	constructor() {
		super();
		const panels = Array.from(
			this.querySelectorAll(`:scope > [${selector7}-panel]`),
		);
		if (
			panels.length !== 2 ||
			panels.some(panel => !(panel instanceof HTMLElement))
		) {
			throw new TypeError(
				`<${selector7}> must have two direct child elements with the attribute '${selector7}-panel'`,
			);
		}
		const separator = this.querySelector(`:scope > [${selector7}-separator]`);
		const separatorHandle = separator?.querySelector(
			`:scope > [${selector7}-separator-handle]`,
		);
		if (
			[separator, separatorHandle].some(
				element => !(element instanceof HTMLElement),
			)
		) {
			throw new TypeError(
				`<${selector7}> must have a separator element with the attribute '${selector7}-separator', and it must have a child element with the attribute '${selector7}-separator-handle'`,
			);
		}
		const primary = panels[0];
		const secondary = panels[1];
		const children = Array.from(this.children);
		if (
			!(
				children.indexOf(primary) < children.indexOf(separator) &&
				children.indexOf(separator) < children.indexOf(secondary)
			)
		) {
			throw new TypeError(
				`<${selector7}> must have elements with the order of: panel, separator, panel`,
			);
		}
		const stored = {
			callbacks: {
				keydown: onDocumentKeydown3.bind(this),
				pointerEnd: onPointerEnd.bind(this),
				pointerMove: onPointerMove.bind(this),
			},
			dragging: false,
			values: {
				current: -1,
				maximum: 100,
				minimum: 0,
				original: 50,
			},
		};
		store5.set(this, stored);
		this.primary = primary;
		this.secondary = secondary;
		this.handle = separatorHandle;
		this.separator = separator;
		if (isNullableOrWhitespace(primary.id)) {
			primary.id = `palmer_splitter_primary_panel_${++index3}`;
		}
		updateSeparator(this);
		updateHandle(this);
	}
	attributeChangedCallback(name, _, value) {
		switch (name) {
			case 'max':
			case 'min': {
				setAbsoluteValue(this, {
					key: name === 'max' ? 'maximum' : 'minimum',
					separator: this.separator,
					setFlex: true,
					value,
				});
				break;
			}
			case 'value': {
				setFlexValue(this, {
					separator: this.separator,
					setOriginal: true,
					value,
				});
				break;
			}
			default: {
				break;
			}
		}
	}
};
PalmerSplitter.observedAttributes = ['max', 'min', 'value'];
customElements.define(selector7, PalmerSplitter);

// src/tooltip.js
var selector8 = 'palmer-tooltip';
var positionAttribute = `${selector8}-position`;
var store6 = /* @__PURE__ */ new WeakMap();
function createFloater(anchor) {
	const id =
		anchor.getAttribute('aria-describedby') ??
		anchor.getAttribute('aria-labelledby');
	const element = id === null ? null : document.querySelector(`#${id}`);
	if (element === null) {
		throw new TypeError(
			`A '${selector8}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`,
		);
	}
	element.hidden = true;
	element.setAttribute('aria-hidden', true);
	element.setAttribute('role', 'tooltip');
	element.setAttribute(`${selector8}-content`, '');
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
function observe2(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}
		if (record.target.getAttribute(selector8) === null) {
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
			show: this.onShow.bind(this),
		};
		this.focusable = isFocusable(anchor);
		this.floater = createFloater(anchor);
		this.timer = void 0;
		this.handleCallbacks(true);
	}
	/**
	 * @param {Event} event
	 */
	onClick(event) {
		if (
			findParent(event.target, element =>
				[this.anchor, this.floater].includes(element),
			) === void 0
		) {
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
		if (event instanceof KeyboardEvent && event.key === 'Escape') {
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
		const method = show
			? document.addEventListener
			: document.removeEventListener;
		method('click', this.callbacks.click, getOptions());
		method('keydown', this.callbacks.keydown, getOptions());
		if (show) {
			this.timer?.stop();
			this.timer = updateFloated({
				elements: {
					anchor: this.anchor,
					floater: this.floater,
				},
				position: {
					attribute: positionAttribute,
					defaultValue: 'vertical',
					preferAbove: true,
				},
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
		const {anchor, floater, focusable} = this;
		const method = add
			? document.addEventListener
			: document.removeEventListener;
		for (const element of [anchor, floater]) {
			method.call(element, 'mouseenter', this.callbacks.show, getOptions());
			method.call(element, 'mouseleave', this.callbacks.hide, getOptions());
			method.call(element, 'touchstart', this.callbacks.show, getOptions());
		}
		if (focusable) {
			method.call(anchor, 'blur', this.callbacks.hide, getOptions());
			method.call(anchor, 'focus', this.callbacks.show, getOptions());
		}
	}
};
var observer3 = new MutationObserver(observe2);
observer3.observe(document, {
	attributeFilter: [selector8],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});
wait(() => {
	const elements = Array.from(document.querySelectorAll(`[${selector8}]`));
	for (const element of elements) {
		element.setAttribute(selector8, '');
	}
}, 0);
