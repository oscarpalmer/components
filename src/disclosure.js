import {isNullableOrWhitespace} from './helpers/index.js';
import {getOptions} from './helpers/event.js';

const selector = 'palmer-disclosure';

let index = 0;

/**
 * @param {PalmerDisclosure} component
 * @param {boolean} open
 */
function toggle(component, open) {
	if (
		!component.dispatchEvent(
			new CustomEvent(
				'toggle',
				{
					cancelable: true,
					detail: open ? 'show' : 'hide',
				},
			),
		)
	) {
		return;
	}

	component.button.setAttribute('aria-expanded', open);

	component.content.hidden = !open;

	component.button.focus();
}

export class PalmerDisclosure extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		return this.button.getAttribute('aria-expanded') === 'true';
	}

	/** @param {boolean} value */
	set open(value) {
		if (typeof value === 'boolean' && value !== this.open) {
			toggle(this, value);
		}
	}

	constructor() {
		super();

		const button = this.querySelector(`[${selector}-button]`);
		const content = this.querySelector(`[${selector}-content]`);

		if (!(button instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector}> needs a <button>-element with the attribute '${selector}-button'`,
			);
		}

		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> needs an element with the attribute '${selector}-content'`,
			);
		}

		/** @readonly @type {HTMLButtonElement} */
		this.button = button;

		/** @readonly @type {HTMLElement} */
		this.content = content;

		const {open} = this;

		button.hidden = false;
		content.hidden = !open;

		let {id} = content;

		if (isNullableOrWhitespace(id)) {
			id = `palmer_disclosure_${++index}`;
		}

		button.setAttribute('aria-expanded', open);
		button.setAttribute('aria-controls', id);

		content.id = id;

		button.addEventListener(
			'click',
			_ => toggle(this, !this.open),
			getOptions(),
		);
	}

	hide() {
		if (this.open) {
			toggle(this, false);
		}
	}

	show() {
		if (!this.open) {
			toggle(this, true);
		}
	}

	toggle() {
		toggle(this, !this.open);
	}
}

customElements.define(selector, PalmerDisclosure);
