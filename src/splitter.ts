import {eventOptions, isTouchy, getCoordinates, getNumber, isNullOrWhitespace} from './helpers';

type Absolute = 'maximum' | 'minimum';

type Callbacks = {
	keydown: (event: KeyboardEvent) => void;
	pointerEnd: () => void;
	pointerMove: (event: MouseEvent | TouchEvent) => void;
};

type Stored = {
	callbacks: Callbacks;
	dragging: boolean;
	values: Values;
};

type Type = 'horizontal' | 'vertical';

type ValueKey = 'current' | 'original' | Absolute;

type Values = Record<ValueKey, number> & {
	initial?: number;
};

const pointerBeginEvent = isTouchy ? 'touchstart' : 'mousedown';
const pointerEndEvent = isTouchy ? 'touchend' : 'mouseup';
const pointerMoveEvent = isTouchy ? 'touchmove' : 'mousemove';

const selector = 'palmer-splitter';

const splitterTypes: Type[] = ['horizontal', 'vertical'];

const store = new WeakMap<PalmerSplitter, Stored>();

let index = 0;

function createHandle(component: PalmerSplitter, className: string): HTMLElement {
	const handle = document.createElement('span');

	handle.className = `${className}__separator__handle`;
	handle.ariaHidden = 'true';

	handle.textContent = component.type === 'horizontal'
		? '↕'
		: '↔';

	handle.addEventListener(pointerBeginEvent, () => onPointerBegin(component));

	return handle as never;
}

function createSeparator(component: PalmerSplitter, values: Values, className: string): HTMLElement {
	let actualValues = values ?? store.get(component)?.values;

	if (actualValues == null) {
		return null as never;
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

	let original = component.getAttribute('value');

	if (isNullOrWhitespace(original)) {
		setFlexValue(component, separator, 50);
	}

	separator.appendChild(component.handle);

	separator.addEventListener('keydown', event => onSeparatorKeydown(component, event), eventOptions.passive);

	return separator;
}

function onDocumentKeydown(this: PalmerSplitter, event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		setDragging(this, false);
	}
}

function onPointerBegin(component: PalmerSplitter): void {
	setDragging(component, true);
}

function onPointerEnd(this: PalmerSplitter): void {
	setDragging(this, false);
}

function onPointerMove(this: PalmerSplitter, event: MouseEvent | TouchEvent): void {
	const coordinates = getCoordinates(event);

	if (coordinates == null) {
		return;
	}

	const componentRectangle = this.getBoundingClientRect();

	let value: number | undefined = undefined;

	if (this.type === 'horizontal') {
		value = (coordinates.y - componentRectangle.top) / componentRectangle.height;
	} else {
		value = (coordinates.x - componentRectangle.left) / componentRectangle.width;
	}

	setFlexValue(this, this.separator, value * 100);
}

function onSeparatorKeydown(component: PalmerSplitter, event: KeyboardEvent): void {
	if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Escape', 'Home'].includes(event.key)) {
		return;
	}

	const ignored = component.type === 'horizontal'
		? ['ArrowLeft', 'ArrowRight']
		: ['ArrowDown', 'ArrowUp'];

	if (ignored.includes(event.key)) {
		return;
	}

	const values = store.get(component)?.values;

	if (values == null) {
		return;
	}

	let value: number | undefined;

	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowLeft':
		case 'ArrowRight':
		case 'ArrowUp':
			value = Math.round(component.value + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1));
			break;

		case 'End':
		case 'Home':
			value = event.key === 'End'
			? values.maximum
			: values.minimum;
			break;

		case 'Escape':
			value = values.initial ?? values.original;
			values.initial = undefined;
			break;
		default:
			break;
	}

	setFlexValue(component, component.separator, value, values);
}

function setAbsoluteValue(component: PalmerSplitter, separator: HTMLElement, key: Absolute, value: any, setFlex: boolean, values?: Values): void {
	let actualValues = values ?? store.get(component)?.values;
	let actualValue = getNumber(value);

	if (actualValues == null
			|| Number.isNaN(actualValue)
			|| actualValue === actualValues[key]
			|| (key === 'maximum' && actualValue < actualValues.minimum)
			|| (key === 'minimum' && actualValue > actualValues.maximum)) {
		return;
	}

	if (key === 'maximum' && actualValue > 100) {
		actualValue = 100;
	} else if (key === 'minimum' && actualValue < 0) {
		actualValue = 0;
	}

	actualValues[key] = actualValue;

	separator.setAttribute(key === 'maximum' ? 'aria-valuemax' : 'aria-valuemin', actualValue as never);

	if (setFlex && ((key === 'maximum' && actualValue < actualValues.current)
			|| (key === 'minimum' && actualValue > actualValues.current))) {
		setFlexValue(component, separator, actualValue, actualValues);
	}
}

function setDragging(component: PalmerSplitter, active: boolean): void {
	const stored = store.get(component);

	if (stored == null) {
		return;
	}

	if (active) {
		stored.values.initial = Number(stored.values.current);
	}

	const method = active
		? 'addEventListener'
		: 'removeEventListener';

	document[method]('keydown', stored.callbacks.keydown as never, eventOptions.passive);
	document[method](pointerEndEvent, stored.callbacks.pointerEnd, eventOptions.passive);
	document[method](pointerMoveEvent, stored.callbacks.pointerMove as never, eventOptions.passive);

	stored.dragging = active;

	// TODO: class or styling for preventing scrolling, selection, etc.
}

function setFlexValue(component: PalmerSplitter, separator: HTMLElement, value: any, values?: Values, setOriginal?: boolean): void {
	let actualValues = values ?? store.get(component)?.values;
	let actualValue = getNumber(value);

	if (actualValues == null || Number.isNaN(actualValue) || actualValue === actualValues.current) {
		return;
	}

	if (actualValue < actualValues.minimum) {
		actualValue = actualValues.minimum;
	} else if (actualValue > actualValues.maximum) {
		actualValue = actualValues.maximum;
	}

	if (setOriginal ?? false) {
		actualValues.original = actualValue;
	}

	separator.ariaValueNow = actualValue as never;

	component.primary.style.flex = `${actualValue / 100}`;
	component.secondary.style.flex = `${(100 - actualValue) / 100}`;

	actualValues.current = actualValue;

	component.dispatchEvent(new CustomEvent('change', {
		detail: {
			value: actualValue,
		},
	}));
}

class PalmerSplitter extends HTMLElement {
	static observedAttributes = ['max', 'min', 'value'];

	readonly handle: HTMLElement;
	readonly primary: HTMLElement;
	readonly secondary: HTMLElement;
	readonly separator: HTMLElement;

	get max(): number {
		return store.get(this)?.values.maximum as never;
	}

	set max(max: number) {
		this.setAttribute('max', max as never);
	}

	get min(): number {
		return store.get(this)?.values.minimum as never;
	}

	set min(min: number) {
		this.setAttribute('min', min as never);
	}

	get type(): Type {
		const type = this.getAttribute('type') ?? 'vertical';

		return (splitterTypes.includes(type as never)
			? type
			: 'vertical') as never;
	}

	set type(type: Type) {
		this.setAttribute('type', type);
	}

	get value(): number {
		return store.get(this)?.values.current as never;
	}

	set value(value: number) {
		this.setAttribute('value', value as never);
	}

	constructor() {
		super();

		if (this.children.length !== 2) {
			throw new Error(`A <${selector}> must have exactly two direct children`);
		}

		const stored: Stored = {
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

		this.primary = this.children[0] as never;
		this.secondary = this.children[1] as never;

		let className = this.getAttribute('className');

		if (isNullOrWhitespace(className)) {
			className = selector;
		}

		this.handle = createHandle(this, className as never);
		this.separator = createSeparator(this, stored.values, className as never);

		this.primary?.insertAdjacentElement('afterend', this.separator);
	}

	attributeChangedCallback(name: string, _: string | undefined, value: string | undefined): void {
		switch (name) {
			case 'max':
			case 'min':
				setAbsoluteValue(this, this.separator, name === 'max' ? 'maximum' : 'minimum', value, true);
				break;
			case 'value':
				setFlexValue(this, this.separator, value, undefined, true);
				break;
			default:
				break;
		}
	}
}

customElements.define(selector, PalmerSplitter);
