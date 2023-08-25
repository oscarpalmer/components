import {isNullableOrWhitespace} from './helpers/index.js';
import {getOptions, getToggleState} from './helpers/event.js';

const selector = 'palmer-disclosure';

/** @type {WeakSet<PalmerDisclosure>} */
const skip = new WeakSet();

let index = 0;

/**
 * @param {PalmerDisclosure} component
 * @param {HTMLButtonElement} button
 * @param {boolean} open
 */
function setAttributes(component, button, open) {
	skip.add(component);

	if (open) {
		component.setAttribute('open', '');
	} else {
		component.removeAttribute('open');
	}

	button.setAttribute('aria-expanded', open);
}

/**
 * @param {PalmerDisclosure} component
 * @param {boolean} open
 */
function setExpanded(component, open) {
	if (component.open === open || skip.has(component)) {
		skip.delete(component);

		return;
	}

	const detail = getToggleState(open);

	if (
		!component.dispatchEvent(
			new CustomEvent('beforetoggle', {
				detail,
				cancelable: true,
			}),
		)
	) {
		return;
	}

	setAttributes(component, component.button, open);

	component.content.hidden = !open;

	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail,
		}),
	);
}

export class PalmerDisclosure extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		const open = this.getAttribute('open');

		return !(open === null || open === 'false');
	}

	/** @param {boolean} value */
	set open(value) {
		if (typeof value === 'boolean') {
			setExpanded(this, value);
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

		button.hidden = false;
		content.hidden = true;

		let {id} = content;

		if (isNullableOrWhitespace(id)) {
			id = `palmer_disclosure_${++index}`;
		}

		button.setAttribute('aria-controls', id);
		button.setAttribute('aria-expanded', false);

		content.id = id;

		button.addEventListener(
			'click',
			_ => setExpanded(this, !this.open),
			getOptions(),
		);

		if (!this.open) {
			return;
		}

		content.hidden = false;

		setExpanded(this, true);
	}

	/**
	 * @param {string} name
	 * @param {string|null} newValue
	 */
	attributeChangedCallback(name, _, newValue) {
		if (name === 'open') {
			setExpanded(this, !(newValue === null || newValue === 'false'));
		}
	}

	hide() {
		setExpanded(this, false);
	}

	show() {
		setExpanded(this, true);
	}

	toggle() {
		setExpanded(this, !this.open);
	}
}

PalmerDisclosure.observedAttributes = ['open'];

customElements.define(selector, PalmerDisclosure);
