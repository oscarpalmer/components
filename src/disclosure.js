import {isNullOrWhitespace} from './helpers/index.js';
import {getOptions} from './helpers/event.js';

const selector = 'palmer-disclosure';

let index = 0;

/**
 * @this {PalmerDisclosure}
 * @param {KeyboardEvent} event
 */
function onKeydown(event) {
	if ([' ', 'Enter'].includes(event.key)) {
		toggle(this, !this.open);
	}
}

/**
 * @this {PalmerDisclosure}
 */
function onPointer() {
	toggle(this, !this.open);
}

/**
 * @param {PalmerDisclosure} component
 * @param {boolean} open
 */
function toggle(component, open) {
	component.button.ariaExpanded = open;
	component.content.hidden = !open;

	component.dispatchEvent(new CustomEvent('toggle', {detail: open}));
}

export class PalmerDisclosure extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		return /^true$/i.test(this.button.ariaExpanded);
	}

	/** @param {boolean} open */
	set open(open) {
		toggle(this, open);
	}

	constructor() {
		super();

		const button = this.querySelector(`[${selector}-button]`);
		const content = this.querySelector(`[${selector}-content]`);

		if (!(button instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> needs an element with the attribute '${selector}-button'`,
			);
		}

		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> needs an element with the attribute '${selector}-content'`,
			);
		}

		/** @readonly @type {HTMLElement} */
		this.button = button;

		/** @readonly @type {HTMLElement} */
		this.content = content;

		const {open} = this;

		button.hidden = false;
		content.hidden = !open;

		let {id} = content;

		if (isNullOrWhitespace(id)) {
			id = `palmer_disclosure_${++index}`;
		}

		button.ariaExpanded = open;
		content.id = id;

		button.setAttribute('aria-controls', id);

		button.addEventListener('click', onPointer.bind(this), getOptions());

		if (button instanceof HTMLButtonElement) {
			return;
		}

		button.tabIndex = 0;

		button.addEventListener('keydown', onKeydown.bind(this), getOptions());
	}

	toggle() {
		toggle(this, !this.open);
	}
}

customElements.define(selector, PalmerDisclosure);
