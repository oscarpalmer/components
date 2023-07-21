import {getNumber, isNullOrWhitespace} from './helpers/index.js';
import {getCoordinates, getOptions} from './helpers/event.js';
import {isTouchy, methods} from './helpers/touchy.js';

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

const selector = 'palmer-splitter';

const splitterTypes = new Set(['horizontal', 'vertical']);

/** @type {WeakMap<PalmerSplitter, Stored>} */
const store = new WeakMap();

let index = 0;

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

	document[method]('keydown', stored.callbacks.keydown, getOptions());
	document[method](methods.end, stored.callbacks.pointerEnd, getOptions());

	document[method](
		methods.move,
		stored.callbacks.pointerMove,
		getOptions(!isTouchy),
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

	component.dispatchEvent(new CustomEvent('change', {detail: value}));
}

/**
 * @param {PalmerSplitter} component
 */
function updateHandle(component) {
	const {handle} = component;

	handle.ariaHidden = 'true';

	handle.addEventListener(
		methods.begin,
		() => onPointerBegin(component),
		getOptions(),
	);
}

/**
 * @param {PalmerSplitter} component
 */
function updateSeparator(component) {
	const {separator} = component;

	separator.hidden = false;
	separator.role = 'separator';
	separator.tabIndex = 0;

	separator.ariaValueMax = 100;
	separator.ariaValueMin = 0;
	separator.ariaValueNow = 50;

	separator.setAttribute('aria-controls', component.primary.id);

	if (isNullOrWhitespace(component.getAttribute('value'))) {
		setFlexValue(
			component,
			{
				separator,
				value: 50,
			},
		);
	}

	separator.addEventListener(
		'keydown',
		event => onSeparatorKeydown(component, event),
		getOptions(),
	);
}

export class PalmerSplitter extends HTMLElement {
	/** @returns {number|undefined} */
	get max() {
		return store.get(this)?.values.maximum;
	}

	/** @param {number} max */
	set max(max) {
		this.setAttribute('max', max);
	}

	/** @returns {number|undefined} */
	get min() {
		return store.get(this)?.values.minimum;
	}

	/** @param {number} min */
	set min(min) {
		this.setAttribute('min', min);
	}

	/** @returns {'horizontal'|'vertical'} */
	get type() {
		const type = this.getAttribute('type') ?? 'vertical';

		return splitterTypes.has(type) ? type : 'vertical';
	}

	/** @param {'horizontal'|'vertical'} type */
	set type(type) {
		this.setAttribute('type', type);
	}

	/** @returns {number|undefined} */
	get value() {
		return store.get(this)?.values.current;
	}

	/** @param {number} value */
	set value(value) {
		this.setAttribute('value', value);
	}

	constructor() {
		super();

		const panels = Array.from(
			this.querySelectorAll(`:scope > [${selector}-panel]`),
		);

		if (
			panels.length !== 2
			|| panels.some(panel => !(panel instanceof HTMLElement))
		) {
			throw new TypeError(
				`<${selector}> must have two direct children with the attribute '${selector}-panel'`,
			);
		}

		const separator = this.querySelector(`:scope > [${selector}-separator]`);

		const separatorHandle = separator?.querySelector(
			`:scope > [${selector}-separator-handle]`,
		);

		if (
			[separator, separatorHandle].some(
				element => !(element instanceof HTMLElement),
			)
		) {
			throw new TypeError(
				`<${selector}> must have a separator element with the attribute '${selector}-separator', and it must have a child element with the attribute '${selector}-separator-handle'`,
			);
		}

		const primary = panels[0];
		const secondary = panels[1];

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

		/** @readonly @type {HTMLElement} */
		this.primary = primary;

		/** @readonly @type {HTMLElement} */
		this.secondary = secondary;

		/** @readonly @type {HTMLElement} */
		this.handle = separatorHandle;

		/** @readonly @type {HTMLElement} */
		this.separator = separator;

		if (isNullOrWhitespace(primary.id)) {
			primary.id = `palmer_splitter_primary_panel_${++index}`;
		}

		updateSeparator(this);
		updateHandle(this);
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
