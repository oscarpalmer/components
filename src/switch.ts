import {eventOptions, isNullOrWhitespace} from './helpers';

function getLabel(id: string, className: string, content: string): HTMLElement {
	const label = document.createElement('span');

	label.ariaHidden = true as never;
	label.className = `${className}__label`;
	label.id = `${id}_label`;
	label.innerHTML = content;

	return label;
}

function getStatus(className: string): HTMLElement {
	const status = document.createElement('span');

	status.ariaHidden = true as never;
	status.className = `${className}__status`;

	const indicator = document.createElement('span');

	indicator.className = `${className}__status__indicator`;

	status.appendChild(indicator);

	return status;
}

function getText(className: string, on: string, off: string): HTMLElement {
	const text = document.createElement('span');

	text.ariaHidden = true as never;
	text.className = `${className}__text`;

	text.appendChild(getTextItem('off', className, off));
	text.appendChild(getTextItem('on', className, on));

	return text;
}

function getTextItem(type: 'off' | 'on', className: string, content: string): HTMLSpanElement {
	const item = document.createElement('span');

	item.className = `${className}__text__${type}`;
	item.innerHTML = content;

	return item;
}

function initialise(component: PalmerSwitch, label: HTMLElement, input: HTMLInputElement): void {
	label.parentElement?.removeChild(label);
	input.parentElement?.removeChild(input);

	component.setAttribute('aria-checked', (input.checked || component.checked) as never);
	component.setAttribute('aria-disabled', (input.disabled || component.disabled) as never);
	component.setAttribute('aria-labelledby', `${input.id}_label`);
	component.setAttribute('aria-readonly', (input.readOnly || component.readonly) as never);
	component.setAttribute('value', input.value);

	component.id = input.id;
	component.name = input.name ?? input.id;
	component.role = 'switch';
	component.tabIndex = 0;

	let className = component.getAttribute('classNames');
	let off = component.getAttribute('off');
	let on = component.getAttribute('on');

	if (isNullOrWhitespace(className)) {
		className = 'palmer-switch';
	}

	if (isNullOrWhitespace(off)) {
		off = 'Off';
	}

	if (isNullOrWhitespace(on)) {
		on = 'On';
	}

	component.insertAdjacentElement('beforeend', getLabel(component.id, className as never, label.innerHTML));
	component.insertAdjacentElement('beforeend', getStatus(className as never));
	component.insertAdjacentElement('beforeend', getText(className as never, on as never, off as never));

	component.addEventListener('click', onToggle.bind(component), eventOptions.passive);
	component.addEventListener('keydown', onKey.bind(component), eventOptions.active);
}

function onKey(this: PalmerSwitch, event: KeyboardEvent): void {
	if (![' ', 'Enter'].includes(event.key)) {
		return;
	}

	event.preventDefault();

	toggle(this);
}

function onToggle(this: PalmerSwitch): void {
	toggle(this);
}

function toggle(component: PalmerSwitch): void {
	if (component.disabled || component.readonly) {
		return;
	}

	component.checked = !component.checked;

	component.dispatchEvent(new Event('change'));
}

export class PalmerSwitch extends HTMLElement {
	static formAssociated = true;

	private internals: ElementInternals | undefined;

	get checked(): boolean {
		return this.getAttribute('aria-checked') === 'true';
	}

	set checked(checked: boolean) {
		this.setAttribute('aria-checked', checked as never);
	}

	get disabled(): boolean {
		return this.getAttribute('aria-disabled') === 'true';
	}

	set disabled(disabled: boolean) {
		this.setAttribute('aria-disabled', disabled as never);
	}

	get form(): HTMLFormElement | undefined {
		return this.internals?.form ?? undefined;
	}

	get labels(): NodeList | undefined {
		return this.internals?.labels;
	}

	get name(): string {
		return this.getAttribute('name') ?? '';
	}

	set name(name: string) {
		this.setAttribute('name', name);
	}

	get readonly(): boolean {
		return this.getAttribute('aria-readonly') === 'true';
	}

	set readonly(readonly: boolean) {
		this.setAttribute('aria-readonly', readonly as never);
	}

	get validationMessage(): string {
		return this.internals?.validationMessage ?? '';
	}

	get validity(): ValidityState | undefined {
		return this.internals?.validity;
	}

	get value(): string {
		return this.getAttribute('value') ?? (this.checked ? 'on' : 'off');
	}

	get willValidate(): boolean {
		return this.internals?.willValidate ?? true;
	}

	constructor() {
		super();

		this.internals = this.attachInternals?.();

		const input = this.querySelector('[palmer-switch-input]');
		const label = this.querySelector('[palmer-switch-label]');

		if (typeof input === 'undefined' || !(input instanceof HTMLInputElement) || input.type !== 'checkbox') {
			throw new Error('<palmer-switch> must have an <input>-element with type \'checkbox\' and the attribute \'palmer-switch-input\'');
		}

		if (typeof label === 'undefined' || !(label instanceof HTMLElement)) {
			throw new Error('<palmer-switch> must have an element with the attribute \'palmer-switch-label\'');
		}

		initialise(this, label, input);
	}

	checkValidity(): boolean {
		return this.internals?.checkValidity() ?? true;
	}

	reportValidity(): boolean {
		return this.internals?.reportValidity() ?? true;
	}
}

customElements.define('palmer-switch', PalmerSwitch);
