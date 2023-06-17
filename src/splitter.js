import {
	eventOptions,
	getCoordinates,
	getNumber,
	isNullOrWhitespace,
} from './helpers/index.js';
import {isTouchy} from './helpers/touchy.js';

/**
 * @typedef AbsoluteParameters
 * @property {'maximum'|'minimum'} key
 * @property {HTMLElement} separator
 * @property {boolean} setFlex
 * @property {number|string|undefined} value
 * @property {Values|undefined} values
 */

/**
 * @typedef Callbacks
 * @property {(event: KeyboardEvent) => void} keydown
 * @property {() => void} pointerEnd
 * @property {(event: MouseEvent | TouchEvent) => void} pointerMove
 */

/**
 * @typedef FlexParameters
 * @property {HTMLElement} separator
 * @property {boolean|undefined} setOriginal
 * @property {number|string|undefined} value
 * @property {Values|undefined} values
 */

/**
 * @typedef Stored
 * @property {Callbacks} callbacks
 * @property {boolean} dragging
 * @property {Values} values
 */

/**
 * @typedef Values
 * @property {number} current
 * @property {number|undefined} initial
 * @property {number} maximum
 * @property {number} minimum
 * @property {number} original
 */

const pointerBeginEvent = isTouchy ? 'touchstart' : 'mousedown';
const pointerEndEvent = isTouchy ? 'touchend' : 'mouseup';
const pointerMoveEvent = isTouchy ? 'touchmove' : 'mousemove';

const selector = 'palmer-splitter';

const splitterTypes = new Set(['horizontal', 'vertical']);

/** @type {WeakMap<PalmerSplitter, Stored>} */
const store = new WeakMap();

let index = 0;

/**
 * @param {PalmerSplitter} component
 * @param {string} className
 * @returns {HTMLElement}
 */
function createHandle(component, className) {
	const handle = document.createElement('span');

	handle.className = `${className}__separator__handle`;
	handle.ariaHidden = 'true';

	handle.textContent = component.type === 'horizontal' ? '↕' : '↔';

	handle.addEventListener(pointerBeginEvent, () => onPointerBegin(component));

	return handle;
}

/**
 * @param {PalmerSplitter} component
 * @param {Values} values
 * @param {string} className
 * @returns {HTMLElement|undefined}
 */
function createSeparator(component, values, className) {
	const actualValues = values ?? store.get(component)?.values;

	if (actualValues === undefined) {
		return undefined;
	}

	const separator = document.createElement('div');

	if (isNullOrWhitespace(component.primary.id)) {
		component.primary.id = `palmer_splitter_primary_panel_${++index}`;
	}

	separator.className = `${className}__separator`;
	separator.role = 'separator';
	separator.tabIndex = 0;

	separator.setAttribute('aria-controls', component.primary.id);
	separator.setAttribute('aria-valuemax', '100');
	separator.setAttribute('aria-valuemin', '0');
	separator.setAttribute('aria-valuenow', '50');

	const original = component.getAttribute('value');

	if (isNullOrWhitespace(original)) {
		setFlexValue(
			component,
			{
				separator,
				value: 50,
			},
		);
	}

	separator.append(component.handle);

	separator.addEventListener(
		'keydown',
		event => onSeparatorKeydown(component, event),
		eventOptions.passive,
	);

	return separator;
}

/**
 * @this {PalmerSplitter}
 * @param {KeyboardEvent} event
 */
function onDocumentKeydown(event) {
	if (event.key === 'Escape') {
		setDragging(this, false);
	}
}

/**
 * @param {PalmerSplitter} component
 * @param {KeyboardEvent} event
 */
function onPointerBegin(component) {
	setDragging(component, true);
}

/**
 * @this {PalmerSplitter}
 */
function onPointerEnd() {
	setDragging(this, false);
}

/**
 * @this {PalmerSplitter}
 * @param {MouseEvent|TouchEvent} event
 */
function onPointerMove(event) {
	if (isTouchy) {
		event.preventDefault();
	}

	const coordinates = getCoordinates(event);

	if (coordinates === undefined) {
		return;
	}

	const componentRectangle = this.getBoundingClientRect();

	const value =
		this.type === 'horizontal'
			? (coordinates.y - componentRectangle.top) / componentRectangle.height
			: (coordinates.x - componentRectangle.left) / componentRectangle.width;

	setFlexValue(
		this,
		{
			separator: this.separator,
			value: value * 100,
		},
	);
}

/**
 * @param {PalmerSplitter} component
 * @param {KeyboardEvent} event
 */
function onSeparatorKeydown(component, event) {
	if (
		![
			'ArrowDown',
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'End',
			'Escape',
			'Home',
		].includes(event.key)
	) {
		return;
	}

	const ignored =
		component.type === 'horizontal'
			? ['ArrowLeft', 'ArrowRight']
			: ['ArrowDown', 'ArrowUp'];

	if (ignored.includes(event.key)) {
		return;
	}

	const {values} = store.get(component);

	if (values === undefined) {
		return;
	}

	/** @type {number|undefined} */
	let value;

	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowLeft':
		case 'ArrowRight':
		case 'ArrowUp': {
			value = Math.round(
				component.value
					+ (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1),
			);

			break;
		}

		case 'End':
		case 'Home': {
			value = event.key === 'End' ? values.maximum : values.minimum;

			break;
		}

		case 'Escape': {
			value = values.initial ?? values.original;

			values.initial = undefined;

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
			separator: component.separator,
		},
	);
}

/**
 * @param {PalmerSplitter} component
 * @param {AbsoluteParameters} parameters
 */
function setAbsoluteValue(component, parameters) {
	const {key, separator, setFlex} = parameters;

	const values = parameters.values ?? store.get(component)?.values;

	let value = getNumber(parameters.value);

	if (
		values === undefined
		|| Number.isNaN(value)
		|| value === values[key]
		|| (key === 'maximum' && value < values.minimum)
		|| (key === 'minimum' && value > values.maximum)
	) {
		return;
	}

	if (key === 'maximum' && value > 100) {
		value = 100;
	}
	else if (key === 'minimum' && value < 0) {
		value = 0;
	}

	values[parameters.key] = value;

	separator.setAttribute(
		key === 'maximum' ? 'aria-valuemax' : 'aria-valuemin',
		value,
	);

	if (
		setFlex
		&& (
			(key === 'maximum' && value < values.current)
			|| (key === 'minimum' && value > values.current)
		)
	) {
		setFlexValue(
			component,
			{
				separator,
				value,
				values,
			},
		);
	}
}

/**
 * @param {PalmerSplitter} component
 * @param {boolean} active
 */
function setDragging(component, active) {
	const stored = store.get(component);

	if (stored === undefined) {
		return;
	}

	if (active) {
		stored.values.initial = Number(stored.values.current);
	}

	const method = active ? 'addEventListener' : 'removeEventListener';

	document[method]('keydown', stored.callbacks.keydown, eventOptions.passive);

	document[method](
		pointerEndEvent,
		stored.callbacks.pointerEnd,
		eventOptions.passive,
	);

	document[method](
		pointerMoveEvent,
		stored.callbacks.pointerMove,
		isTouchy ? eventOptions.active : eventOptions.passive,
	);

	stored.dragging = active;

	document.body.style.userSelect = active ? 'none' : null;
	document.body.style.webkitUserSelect = active ? 'none' : null;
}

/**
 * @param {PalmerSplitter} component
 * @param {FlexParameters} parameters
 */
function setFlexValue(component, parameters) {
	const {separator} = parameters;

	const values = parameters.values ?? store.get(component)?.values;

	let value = getNumber(parameters.value);

	if (values === undefined || Number.isNaN(value) || value === values.current) {
		return;
	}

	if (value < values.minimum) {
		value = values.minimum;
	}
	else if (value > values.maximum) {
		value = values.maximum;
	}

	if (parameters.setOriginal ?? false) {
		values.original = value;
	}

	separator.ariaValueNow = value;

	component.primary.style.flex = `${value / 100}`;
	component.secondary.style.flex = `${(100 - value) / 100}`;

	values.current = value;

	component.dispatchEvent(new CustomEvent('change', {detail: {value}}));
}

export class PalmerSplitter extends HTMLElement {
	get max() {
		return store.get(this)?.values.maximum;
	}

	set max(max) {
		this.setAttribute('max', max);
	}

	get min() {
		return store.get(this)?.values.minimum;
	}

	set min(min) {
		this.setAttribute('min', min);
	}

	get type() {
		const type = this.getAttribute('type') ?? 'vertical';

		return splitterTypes.has(type) ? type : 'vertical';
	}

	set type(type) {
		this.setAttribute('type', type);
	}

	get value() {
		return store.get(this)?.values.current;
	}

	set value(value) {
		this.setAttribute('value', value);
	}

	constructor() {
		super();

		if (this.children.length !== 2) {
			throw new Error(`A <${selector}> must have exactly two direct children`);
		}

		/** @type {Stored} */
		const stored = {
			callbacks: {
				keydown: onDocumentKeydown.bind(this),
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

		store.set(this, stored);

		/**
		 * @readonly
		 * @type {HTMLElement}
		 */
		this.primary = this.children[0];

		/**
		 * @readonly
		 * @type {HTMLElement}
		 */
		this.secondary = this.children[1];

		let className = this.getAttribute('className');

		if (isNullOrWhitespace(className)) {
			className = selector;
		}

		const panelClassName = `${className}__panel`;

		this.primary.classList.add(panelClassName);
		this.secondary.classList.add(panelClassName);

		/**
		 * @readonly
		 * @type {HTMLElement}
		 */
		this.handle = createHandle(this, className);

		/**
		 * @readonly
		 * @type {HTMLElement}
		 */
		this.separator = createSeparator(this, stored.values, className);

		this.primary?.insertAdjacentElement('afterend', this.separator);
	}

	attributeChangedCallback(name, _, value) {
		switch (name) {
			case 'max':
			case 'min': {
				setAbsoluteValue(
					this,
					{
						key: name === 'max' ? 'maximum' : 'minimum',
						separator: this.separator,
						setFlex: true,
						value,
					},
				);
				break;
			}

			case 'value': {
				setFlexValue(
					this,
					{
						separator: this.separator,
						setOriginal: true,
						value,
					},
				);
				break;
			}

			default: {
				break;
			}
		}
	}
}

PalmerSplitter.observedAttributes = ['max', 'min', 'value'];

customElements.define(selector, PalmerSplitter);