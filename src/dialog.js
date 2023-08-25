import {isNullableOrWhitespace} from './helpers/index.js';
import {getOptions} from './helpers/event.js';
import {getFocusableElements} from './helpers/focusable.js';
import {selector as focusTrapSelector} from './focus-trap.js';

// TODO: allow non-modal dialogs

const selector = 'palmer-dialog';

const closeAttribute = `${selector}-close`;
const openAttribute = `${selector}-open`;

/** @type {WeakMap<PalmerDialog, HTMLButtonElement>} */
const focused = new WeakMap();

/** @type {WeakMap<PalmerDialog, HTMLElement>} */
const parents = new WeakMap();

/**
 * @param {'beforeclose'|'cancel'} before
 * @param {PalmerDialog} component
 * @param {HTMLElement|undefined} target
 */
function close(before, component, target) {
	if (
		!component.dispatchEvent(
			new CustomEvent(before, {
				cancelable: true,
				detail: {target},
			}),
		)
	) {
		return;
	}

	component.hidden = true;

	parents.get(component)?.append(component);

	focused.get(component)?.focus();

	focused.delete(component);

	component.dispatchEvent(
		new CustomEvent('close', {
			detail: {target},
		}),
	);
}

/**
 * @param {HTMLButtonElement} button
 */
function defineButton(button) {
	button.addEventListener('click', onOpen, getOptions());
}

/**
 * @this {PalmerDialog}
 * @param {KeyboardEvent} event
 */
function onKeydown(event) {
	if (event.key === 'Escape') {
		close('cancel', this, document.activeElement);
	}
}

/**
 * @this {HTMLButtonElement}
 */
function onOpen() {
	const dialog = document.querySelector(`#${this.getAttribute(openAttribute)}`);

	if (!(dialog instanceof PalmerDialog)) {
		return;
	}

	focused.set(dialog, this);

	open(dialog);
}

/**
 * @param {PalmerDialog} component
 */
function open(component) {
	if (
		!component.dispatchEvent(
			new CustomEvent('show', {
				cancelable: true,
			}),
		)
	) {
		return;
	}

	component.hidden = false;

	document.body.append(component);

	(getFocusableElements(component)[0] ?? component).focus();

	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail: 'open',
		}),
	);
}

export class PalmerDialog extends HTMLElement {
	/** @returns {boolean} */
	get alert() {
		return this.getAttribute('role') === 'alertdialog';
	}

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
		} else {
			close('cancel', this);
		}
	}

	constructor() {
		super();

		this.hidden = true;

		const {id} = this;

		if (isNullableOrWhitespace(id)) {
			throw new TypeError(`<${selector}> must have an ID`);
		}

		if (
			isNullableOrWhitespace(this.getAttribute('aria-label')) &&
			isNullableOrWhitespace(this.getAttribute('aria-labelledby'))
		) {
			throw new TypeError(
				`<${selector}> should be labelled by either the 'aria-label' or 'aria-labelledby'-attribute`,
			);
		}

		const isAlert =
			this.getAttribute('role') === 'alertdialog' ||
			this.getAttribute('type') === 'alert';

		if (
			isAlert &&
			isNullableOrWhitespace(this.getAttribute('aria-describedby'))
		) {
			throw new TypeError(
				`<${selector}> for alerts should be described by the 'aria-describedby'-attribute`,
			);
		}

		const closers = Array.from(this.querySelectorAll(`[${closeAttribute}]`));

		if (!closers.some(closer => closer instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector}> must have a <button>-element with the attribute '${closeAttribute}'`,
			);
		}

		const content = this.querySelector(`:scope > [${selector}-content]`);

		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> must have an element with the attribute '${selector}-content'`,
			);
		}

		const overlay = this.querySelector(`:scope > [${selector}-overlay]`);

		if (!(overlay instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> must have an element with the attribute '${selector}-overlay'`,
			);
		}

		parents.set(this, this.parentElement);

		content.tabIndex = -1;

		overlay.setAttribute('aria-hidden', true);

		this.setAttribute('role', isAlert ? 'alertdialog' : 'dialog');
		this.setAttribute('aria-modal', true);
		this.setAttribute(focusTrapSelector, '');

		this.addEventListener('keydown', onKeydown.bind(this), getOptions());

		for (const closer of closers) {
			const isOverlay = closer === overlay;

			if (isAlert && isOverlay) {
				continue;
			}

			closer.addEventListener(
				'click',
				() => close(isOverlay ? 'cancel' : 'beforeclose', this, closer),
				getOptions(),
			);
		}
	}

	hide() {
		this.open = false;
	}

	show() {
		this.open = true;
	}
}

customElements.define(selector, PalmerDialog);

const observer = new MutationObserver(records => {
	for (const record of records) {
		if (
			record.type === 'attributes' &&
			record.target instanceof HTMLButtonElement
		) {
			defineButton(record.target);
		}
	}
});

observer.observe(document, {
	attributeFilter: [openAttribute],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});

setTimeout(() => {
	const elements = Array.from(document.querySelectorAll(`[${openAttribute}]`));

	for (const element of elements) {
		defineButton(element);
	}
}, 0);
