import {eventOptions, getAttribute, setAttribute, setProperty} from './helpers';

function initialise(component: SwankySwitch, label: HTMLElement, input: HTMLInputElement): void {
	label.parentElement?.removeChild(label);
	input.parentElement?.removeChild(input);

	setProperty(component, 'aria-checked', input.checked || component.checked);
	setProperty(component, 'aria-disabled', input.disabled || component.disabled);
	setProperty(component, 'aria-readonly', input.readOnly || component.readonly);

	component.setAttribute('aria-labelledby', `${input.id}_label`);

	component.setAttribute('id', input.id);
	component.setAttribute('name', input.name ?? input.id);
	component.setAttribute('role', 'switch');
	component.setAttribute('tabindex', '0');
	component.setAttribute('value', input.value);

	const off = getAttribute(component, 'swanky-switch-off', 'Off');
	const on = getAttribute(component, 'swanky-switch-on', 'On');

	component.insertAdjacentHTML('afterbegin', render(input.id, label, off, on));

	component.addEventListener('click', onToggle.bind(component), eventOptions.passive);
	component.addEventListener('keydown', onKey.bind(component), eventOptions.passive);
}

function onKey(this: SwankySwitch, event: KeyboardEvent): void {
	if ((event.key === ' ' || event.key === 'Enter') && (this instanceof SwankySwitch)) {
		toggle(this);
	}
}

function onToggle(this: SwankySwitch): void {
	if (this instanceof SwankySwitch) {
		toggle(this);
	}
}

function render(id: string, label: HTMLElement, off: string, on: string): string {
	return `<swanky-switch-label id="${id}_label">${label.innerHTML}</swanky-switch-label>
<swanky-switch-status aria-hidden="true">
	<swanky-switch-status-indicator></swanky-switch-status-indicator>
</swanky-switch-status>
<swanky-switch-text aria-hidden="true">
	<swanky-switch-text-off>${off}</swanky-switch-text-off>
	<swanky-switch-text-on>${on}</swanky-switch-text-on>
</swanky-switch-text>`;
}

function toggle(component: SwankySwitch): void {
	if (component.disabled || component.readonly) {
		return;
	}

	component.checked = !component.checked;

	component.dispatchEvent(new Event('change'));
}

class SwankySwitch extends HTMLElement {
	static formAssociated = true;

	private internals: ElementInternals | undefined;

	get checked(): boolean {
		return this.getAttribute('aria-checked') === 'true';
	}

	set checked(checked: boolean) {
		setProperty(this, 'aria-checked', checked);
	}

	get disabled(): boolean {
		return this.getAttribute('aria-disabled') === 'true';
	}

	set disabled(disabled: boolean) {
		setProperty(this, 'aria-disabled', disabled);
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
		setAttribute(this, 'name', name);
	}

	get readonly(): boolean {
		return this.getAttribute('aria-readonly') === 'true';
	}

	set readonly(readonly: boolean) {
		setProperty(this, 'aria-readonly', readonly);
	}

	get validationMessage(): string {
		return this.internals?.validationMessage ?? '';
	}

	get validity(): ValidityState | undefined {
		return this.internals?.validity;
	}

	get value(): string {
		return this.getAttribute('value') ?? this.checked ? 'on' : 'off';
	}

	get willValidate(): boolean {
		return this.internals?.willValidate ?? true;
	}

	constructor() {
		super();

		this.internals = this.attachInternals?.();

		const input = this.querySelector('[swanky-switch-input]');
		const label = this.querySelector('[swanky-switch-label]');

		if (typeof input === 'undefined' || !(input instanceof HTMLInputElement) || input.type !== 'checkbox') {
			throw new Error('<swanky-switch> must have an <input>-element with type \'checkbox\' and the attribute \'swanky-switch-input\'');
		}

		if (typeof label === 'undefined' || !(label instanceof HTMLElement)) {
			throw new Error('<swanky-switch> must have a <label>-element with the attribute \'swanky-switch-label\'');
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

globalThis.customElements.define('swanky-switch', SwankySwitch);
