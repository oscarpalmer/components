import {eventOptions, getAttribute, setProperty} from './helpers';

const template = `<div id="__id__" class="swanky-switch__label">__label__</div><div class="swanky-switch__indicator" aria-hidden="true"><span class="swanky-switch__indicator__value"></span></div><div class="swanky-switch__status" aria-hidden="true"><span class="swanky-switch__status__off">__off__</span><span class="swanky-switch__status__on">__on__</span></div>`;

class Manager {
	static initialize(component: SwankySwitch, label: HTMLElement, input: HTMLInputElement): void {
		label.parentElement?.removeChild(label);
		input.parentElement?.removeChild(input);

		setProperty(component, 'aria-checked', input.checked || component.checked);
		setProperty(component, 'aria-disabled', input.disabled || component.disabled);
		setProperty(component, 'aria-readonly', input.readOnly || component.readOnly);

		component.setAttribute('aria-labelledby', `${input.id}_label`);

		component.setAttribute('id', input.id);
		component.setAttribute('name', input.name ?? input.id);
		component.setAttribute('role', 'switch');
		component.setAttribute('tabindex', '0');
		component.setAttribute('value', input.value);

		const off = getAttribute(component, 'swanky-switch-off', 'Off');
		const on = getAttribute(component, 'swanky-switch-on', 'On');

		component.insertAdjacentHTML('afterbegin', Manager.render(input.id, label, off, on));

		component.addEventListener('click', Manager.onToggle.bind(component), eventOptions.passive);
		component.addEventListener('keydown', Manager.onKey.bind(component), eventOptions.passive);
	}

	static onKey(event: KeyboardEvent): void {
		if ((event.key === ' ' || event.key === 'Enter') && (this instanceof SwankySwitch)) {
			Manager.toggle(this);
		}
	}

	static onToggle(): void {
		if (this instanceof SwankySwitch) {
			Manager.toggle(this);
		}
	}

	static render(id: string, label: HTMLElement, off: string, on: string): string {
		return template
			.replace('__id__', `${id}_label`)
			.replace('__label__', label.innerHTML)
			.replace('__off__', off)
			.replace('__on__', on);
	}

	private static toggle(component: SwankySwitch): void {
		if (component.disabled || component.readOnly) {
			return;
		}

		component.checked = !component.checked;

		component.dispatchEvent(new Event('change'));
	}
}

const connected = new WeakMap<SwankySwitch, void>();

class SwankySwitch extends HTMLElement {
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

	get readOnly(): boolean {
		return this.getAttribute('aria-readonly') === 'true';
	}

	set readOnly(readonly: boolean) {
		setProperty(this, 'aria-readonly', readonly);
	}

	get value(): string | undefined {
		return this.checked ? 'on' : 'off';
	}

	connectedCallback(): void {
		if (connected.has(this)) {
			return;
		}

		connected.set(this);

		const input = this.querySelector('[swanky-switch-input]');
		const label = this.querySelector('[swanky-switch-label]');

		if (typeof input === 'undefined' || !(input instanceof HTMLInputElement) || input.type !== 'checkbox') {
			throw new Error('<swanky-switch> must have an <input>-element with type \'checkbox\' and the attribute \'swanky-switch-input\'');
		}

		if (typeof label === 'undefined' || !(label instanceof HTMLElement)) {
			throw new Error('<swanky-switch> must have a <label>-element with the attribute \'swanky-switch-label\'');
		}

		Manager.initialize(this, label, input);
	}
}

customElements?.define('swanky-switch', SwankySwitch);
