import {eventOptions, getNumber, isNullOrWhitespace} from './helpers';

type Absolute = 'maximum' | 'minimum';
type Type = 'horizontal' | 'vertical';
type ValueKey = 'current' | 'original' | Absolute;

type Values = Record<ValueKey, number>;

const selector = 'palmer-splitter';

const splitterTypes: Type[] = ['horizontal', 'vertical'];

const store = new WeakMap<PalmerSplitter, Values>();

let index = 0;

function createSeparator(splitter: PalmerSplitter, values?: Values): HTMLElement {
	let actualValues = values ?? store.get(splitter);

	if (actualValues == null) {
		return null as never;
	}

	const separator = document.createElement('div');

	if (isNullOrWhitespace(splitter.primary.id)) {
		splitter.primary.id = `palmer_splitter_primary_panel_${++index}`;
	}

	separator.setAttribute('aria-controls', splitter.primary.id);

	separator.role = 'separator';
	separator.tabIndex = 0;

	let originalValue = splitter.getAttribute('value');

	if (isNullOrWhitespace(originalValue)) {
		originalValue = '50';
	}

	const originalNumber = getNumber(originalValue);

	actualValues.original = typeof originalNumber === 'number'
		? originalNumber
		: 50;

	const maximum = splitter.getAttribute('max') ?? '';
	const minimum = splitter.getAttribute('min') ?? '';

	if (maximum.length === 0) {
		setAbsoluteValue(splitter, separator, 'maximum', 100);
	}

	if (minimum.length === 0) {
		setAbsoluteValue(splitter, separator, 'minimum', 0);
	}

	setFlexValue(splitter, separator, actualValues.original, false);

	separator.addEventListener('keydown', event => onKeydown(splitter, event), eventOptions.passive);

	return separator;
}

function onKeydown(splitter: PalmerSplitter, event: KeyboardEvent): void {
	if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Escape', 'Home'].includes(event.key)) {
		return;
	}

	const ignored = splitter.type === 'vertical'
		? ['ArrowLeft', 'ArrowRight']
		: ['ArrowDown', 'ArrowUp'];

	if (ignored.includes(event.key)) {
		return;
	}

	const values = store.get(splitter);

	if (values == null) {
		return;
	}

	let value: number | undefined;

	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowLeft':
		case 'ArrowRight':
		case 'ArrowUp':
			value = splitter.value + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1);
			break;

		case 'End':
		case 'Home':
			value = event.key === 'End'
			? values.maximum
			: values.minimum;
			break;

		case 'Escape':
			value = values.original;
			break;
		default:
			break;
	}

	setFlexValue(splitter, splitter.separator, value, true);
}

function setAbsoluteValue(splitter: PalmerSplitter, separator: HTMLElement, key: Absolute, value: any, values?: Values): void {
	let actualValues = values ?? store.get(splitter);
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

	if ((key === 'maximum' && actualValue < actualValues.current)
			|| (key === 'minimum' && actualValue > actualValues.current)) {
		setFlexValue(splitter, separator, actualValues, true);
	}
}

function setFlexValue(splitter: PalmerSplitter, separator: HTMLElement, value: any, emit: boolean, values?: Values): void {
	let actualValues = values ?? store.get(splitter);
	let actualValue = getNumber(value);

	if (actualValues == null || Number.isNaN(actualValue) || actualValue === actualValues.current) {
		return;
	}

	if (actualValue < actualValues.minimum) {
		actualValue = actualValues.minimum;
	} else if (actualValue > actualValues.maximum) {
		actualValue = actualValues.maximum;
	}

	separator.ariaValueNow = actualValue as never;

	splitter.primary.style.flex = `${actualValue / 100}`;
	splitter.secondary.style.flex = `${(100 - actualValue) / 100}`;

	actualValues.current = actualValue;

	if (emit) {
		splitter.dispatchEvent(new CustomEvent('change', {
			detail: {
				value: actualValue,
			},
		}));
	}
}

class PalmerSplitter extends HTMLElement {
	static observedAttributes = ['max', 'min', 'value'];

	readonly primary: HTMLElement;
	readonly secondary: HTMLElement;
	readonly separator: HTMLElement;

	get max(): number {
		return store.get(this)?.maximum as never;
	}

	set max(max: number) {
		setAbsoluteValue(this, this.separator, 'maximum', max);
	}

	get min(): number {
		return store.get(this)?.minimum as never;
	}

	set min(min: number) {
		setAbsoluteValue(this, this.separator, 'minimum', min);
	}

	get type(): Type {
		const type = this.getAttribute('type') ?? 'horizontal';

		return (splitterTypes.includes(type as never)
			? type
			: 'horizontal') as never;
	}

	set type(type: Type) {
		if (splitterTypes.includes(type)) {
			this.setAttribute('type', type);
		}
	}

	get value(): number {
		return store.get(this)?.current as never;
	}

	set value(value: number) {
		setFlexValue(this, this.separator, value, true);
	}

	constructor() {
		super();

		if (this.children.length !== 2) {
			throw new Error(`A <${selector}> must have exactly two direct children`);
		}

		const values: Values = {
			current: -1,
			maximum: -1,
			minimum: -1,
			original: -1,
		};

		store.set(this, values);

		this.primary = this.children[0] as never;
		this.secondary = this.children[1] as never;

		this.separator = createSeparator(this, values);

		this.primary?.insertAdjacentElement('afterend', this.separator);
	}

	attributeChangedCallback(name: string, _: string | undefined, value: string | undefined): void {
		switch (name) {
			case 'max':
			case 'min':
				setAbsoluteValue(this, this.separator, name === 'max' ? 'maximum' : 'minimum', value);
				break;
			case 'value':
				setFlexValue(this, this.separator, value, true);
				break;
			default:
				break;
		}
	}
}

customElements.define(selector, PalmerSplitter);
