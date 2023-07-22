import {isNullableOrWhitespace} from './helpers/index.js';
import {getOptions} from './helpers/event.js';
import {getFocusableElements} from './helpers/focusable.js';
import {selector as focusTrapSelector} from './focus-trap.js';

const selector = 'palmer-modal';
const openAttribute = `${selector}-open`;

/** @type {WeakMap<PalmerModal, HTMLButtonElement>} */
const focused = new WeakMap();

/** @type {WeakMap<PalmerModal, HTMLElement>} */
const parents = new WeakMap();

/**
 * @param {PalmerModal} component
 */
function close(component) {
	component.hidden = true;

	parents.get(component)?.append(component);

	focused.get(component)?.focus();

	focused.delete(component);

	component.dispatchEvent(new Event('close'));
}

/**
 * @param {HTMLButtonElement} button
 */
function defineButton(button) {
	button.addEventListener('click', onOpen, getOptions());
}

/**
 * @this {PalmerModal}
 */
function onClose() {
	close(this);
}

/**
 * @this {PalmerModal}
 * @param {KeyboardEvent} event
 */
function onKeydown(event) {
	if (event.key === 'Escape') {
		onClose.call(this);
	}
}

/**
 * @this {HTMLButtonElement}
 */
function onOpen() {
	const modal = document.querySelector(`#${this.getAttribute(openAttribute)}`);

	if (modal === undefined) {
		return;
	}

	focused.set(modal, this);

	open(modal);
}

/**
 * @param {PalmerModal} component
 */
function open(component) {
	component.hidden = false;

	document.body.append(component);

	(getFocusableElements(component)[0] ?? component).focus();

	component.dispatchEvent(new Event('open'));
}

export class PalmerModal extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		return this.parentElement === document.body && !this.hidden;
	}

	/** @param {boolean} value */
	set open(value) {
		if (typeof value !== 'boolean' || this.open === value) {
			return;
		}

		if (value) {
			open(this);
		}
		else {
			close(this);
		}
	}

	constructor() {
		super();

		this.hidden = true;

		const {id} = this;

		if (id === undefined || id.trim().length === 0) {
			throw new TypeError(`<${selector}> must have an ID`);
		}

		if (
			isNullableOrWhitespace(this.getAttribute('aria-label'))
			&& isNullableOrWhitespace(this.getAttribute('aria-labelledby'))
		) {
			throw new TypeError(
				`<${selector}> should be labelled by either the 'aria-label' or 'aria-labelledby'-attribute`,
			);
		}

		const close = this.querySelector(`[${selector}-close]`);

		if (!(close instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector}> must have a <button>-element with the attribute '${selector}-close'`,
			);
		}

		if (
			!(
				this.querySelector(`:scope > [${selector}-content]`)
				instanceof HTMLElement
			)
		) {
			throw new TypeError(
				`<${selector}> must have an element with the attribuet '${selector}-content'`,
			);
		}

		const overlay = this.querySelector(`:scope > [${selector}-overlay]`);

		if (!(overlay instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> must have an element with the attribuet '${selector}-overlay'`,
			);
		}

		parents.set(this, this.parentElement);

		this.role = 'dialog';

		this.setAttribute('aria-modal', true);
		this.setAttribute(focusTrapSelector, '');

		this.addEventListener('keydown', onKeydown.bind(this), getOptions());

		close.addEventListener('click', onClose.bind(this), getOptions());
		overlay.addEventListener('click', onClose.bind(this), getOptions());
	}

	hide() {
		this.open = false;
	}

	show() {
		this.open = true;
	}
}

customElements.define(selector, PalmerModal);

const observer = new MutationObserver(records => {
	for (const record of records) {
		if (
			record.type === 'attributes'
			&& record.target instanceof HTMLButtonElement
		) {
			defineButton(record.target);
		}
	}
});

observer.observe(
	document,
	{
		attributeFilter: [openAttribute],
		attributeOldValue: true,
		attributes: true,
		childList: true,
		subtree: true,
	},
);

setTimeout(
	() => {
		const elements = Array.from(
			document.querySelectorAll(`[${openAttribute}]`),
		);

		for (const element of elements) {
			defineButton(element);
		}
	},
	0,
);
