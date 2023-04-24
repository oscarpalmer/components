import {eventOptions, getNumber, isNullOrWhitespace} from './helpers';

type Absolute = 'maximum' | 'minimum';
type Type = 'horizontal' | 'vertical';
type ValueKey = 'current' | 'original' | Absolute;

type Values = Record<ValueKey, number>;

const splitterTypes: Type[] = ['horizontal', 'vertical'];

let index = 0;

function createSeparator(splitter: SpiffySplitter): HTMLElement {
	const separator = document.createElement('div');

	if (isNullOrWhitespace(splitter.primary.id)) {
		splitter.primary.id = `spiffy_splitter_primary_${++index}`;
	}

	separator.setAttribute('aria-controls', splitter.primary.id);

	separator.role = 'separator';
	separator.tabIndex = 0;

	let originalValue = splitter.getAttribute('value');

	if (isNullOrWhitespace(originalValue)) {
		originalValue = '50';
	}

	const originalNumber = getNumber(originalValue);

	splitter.values.original = typeof originalNumber === 'number'
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

	setFlexValue(splitter, separator, splitter.values.original, false);

	separator.addEventListener('keydown', event => onKeydown(splitter, event), eventOptions.passive);

	return separator;
}

function onKeydown(splitter: SpiffySplitter, event: KeyboardEvent): void {
	if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Escape', 'Home'].includes(event.key)) {
		return;
	}

	const ignored = splitter.type === 'vertical'
		? ['ArrowLeft', 'ArrowRight']
		: ['ArrowDown', 'ArrowUp'];

	if (ignored.includes(event.key)) {
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
			? splitter.values.maximum
			: splitter.values.minimum;
			break;

		case 'Escape':
			value = splitter.values.original;
			break;
		default:
			break;
	}

	setFlexValue(splitter, splitter.separator, value, true);
}

function setAbsoluteValue(splitter: SpiffySplitter, separator: HTMLElement, key: Absolute, value: any): void {
	let actual = getNumber(value);

	if (Number.isNaN(actual)
			|| actual === splitter.values[key]
			|| (key === 'maximum' && actual < splitter.values.minimum)
			|| (key === 'minimum' && actual > splitter.values.maximum)) {
		return;
	}

	if (key === 'maximum' && actual > 100) {
		actual = 100;
	} else if (key === 'minimum' && actual < 0) {
		actual = 0;
	}

	splitter.values[key] = actual;

	separator.setAttribute(key === 'maximum' ? 'aria-valuemax' : 'aria-valuemin', actual as never);

	if ((key === 'maximum' && actual < splitter.values.current)
			|| (key === 'minimum' && actual > splitter.values.current)) {
		setFlexValue(splitter, separator, actual, true);
	}
}

function setFlexValue(splitter: SpiffySplitter, separator: HTMLElement, value: any, emit: boolean): void {
	let actual = getNumber(value);

	if (Number.isNaN(actual) || actual === splitter.values.current) {
		return;
	}

	if (actual < splitter.values.minimum) {
		actual = splitter.values.minimum;
	} else if (actual > splitter.values.maximum) {
		actual = splitter.values.maximum;
	}

	separator.ariaValueNow = actual as never;

	splitter.primary.style.flex = `${actual / 100}`;
	splitter.values.current = actual;

	if (emit) {
		splitter.dispatchEvent(new CustomEvent('change', {
			detail: {
				value: actual,
			},
		}));
	}
}

class SpiffySplitter extends HTMLElement {
	static observedAttributes = ['max', 'min', 'value'];

	readonly primary: HTMLElement;
	readonly secondary: HTMLElement[];
	readonly separator: HTMLElement;

	readonly values: Values = {
		current: -1,
		maximum: -1,
		minimum: -1,
		original: -1,
	};

	get max(): number {
		return this.values.maximum;
	}

	set max(max: number) {
		setAbsoluteValue(this, this.separator, 'maximum', max);
	}

	get min(): number {
		return this.values.minimum;
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
		return this.values.current;
	}

	set value(value: number) {
		setFlexValue(this, this.separator, value, true);
	}

	constructor() {
		super();

		if (this.children.length < 2) {
			throw new Error('A <spffy-splitter> must have at least two direct children');
		}

		this.primary = this.children[0] as never;
		this.secondary = [...this.children].slice(1) as never;

		this.separator = createSeparator(this);

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

customElements.define('spiffy-splitter', SpiffySplitter);
