import {wait} from '@oscarpalmer/timer';
import {findParent, isNullableOrWhitespace} from './helpers/index.js';
import {getOptions, getToggleState} from './helpers/event.js';
import {updateFloated} from './helpers/floated.js';
import {getFocusableElements} from './helpers/focusable.js';
import {methods} from './helpers/touchy.js';
import {selector as focusTrapSelector} from './focus-trap.js';

/**
 * @typedef Callbacks
 * @property {(event: Event) => void} keydown
 * @property {(event: Event) => void} pointer
 */

const closeKeys = /^\s|enter$/i;

const selector = 'palmer-popover';

/** @type {WeakMap<PalmerPopover, Callbacks>} */
const store = new WeakMap();

let index = 0;

/**
 * @param {PalmerPopover} component
 * @param {boolean} active
 */
function afterToggle(component, active) {
	handleCallbacks(component, active);

	wait(() => {
		(active
			? getFocusableElements(component.content)?.[0] ?? component.content
			: component.button
		)?.focus();
	}, 0);

	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail: getToggleState(active),
		}),
	);
}

/**
 * @param {PalmerPopover} component
 * @param {boolean} add
 */
function handleCallbacks(component, add) {
	const callbacks = store.get(component);

	if (callbacks === undefined) {
		return;
	}

	const method = add ? 'addEventListener' : 'removeEventListener';

	document[method](methods.begin, callbacks.pointer, getOptions());
	document[method]('keydown', callbacks.keydown, getOptions());
}

/**
 * @param {PalmerPopover} component
 * @param {boolean|undefined} expand
 */
function handleToggle(component, expand) {
	const expanded = typeof expand === 'boolean' ? !expand : component.open;

	if (
		!component.dispatchEvent(
			new CustomEvent('beforetoggle', {
				cancelable: true,
				detail: getToggleState(expanded),
			}),
		)
	) {
		return;
	}

	component.button.setAttribute('aria-expanded', !expanded);

	component.timer?.stop();

	if (expanded) {
		component.content.hidden = true;
	} else {
		component.timer = updateFloated({
			elements: {
				anchor: component.button,
				floater: component.content,
				parent: component,
			},
			position: {
				attribute: 'position',
				defaultValue: 'vertical',
				preferAbove: false,
			},
		});
	}

	afterToggle(component, !expanded);
}

/**
 * @this {PalmerPopover}
 * @param {Event|KeyboardEvent} event
 */
function onClose(event) {
	if (!(event instanceof KeyboardEvent) || closeKeys.test(event.key)) {
		handleToggle(this, false);
	}
}

/**
 * @this {PalmerPopover}
 * @param {Event} event
 */
function onDocumentKeydown(event) {
	if (this.open && event instanceof KeyboardEvent && event.key === 'Escape') {
		handleToggle(this, false);
	}
}

/**
 * @this {PalmerPopover}
 * @param {Event} event
 */
function onDocumentPointer(event) {
	if (
		this.open &&
		findParent(event.target, parent =>
			[this.button, this.content].includes(parent),
		) === undefined
	) {
		handleToggle(this, false);
	}
}

/**
 * @this {PalmerPopover}
 */
function onToggle() {
	handleToggle(this);
}

/**
 * @param {PalmerPopover} component
 */
function setButtons(component) {
	component.button.addEventListener(
		'click',
		onToggle.bind(component),
		getOptions(),
	);

	const buttons = Array.from(component.querySelectorAll(`[${selector}-close]`));

	for (const button of buttons) {
		button.addEventListener('click', onClose.bind(component), getOptions());
	}
}

export class PalmerPopover extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		return this.button.getAttribute('aria-expanded') === 'true';
	}

	/** @param {boolean} value */
	set open(value) {
		if (typeof value === 'boolean' && value !== this.open) {
			handleToggle(this, open);
		}
	}

	constructor() {
		super();

		if (findParent(this, selector, false)) {
			throw new TypeError(
				`<${selector}>-elements must not be nested within each other`,
			);
		}

		const button = this.querySelector(`[${selector}-button]`);
		const content = this.querySelector(`[${selector}-content]`);

		if (!(button instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector}> must have a <button>-element with the attribute '${selector}-button`,
			);
		}

		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> must have an element with the attribute '${selector}-content'`,
			);
		}

		/** @readonly @type {HTMLButtonElement} */
		this.button = button;

		/** @readonly @type {HTMLElement} */
		this.content = content;

		/** @private @type {import('@oscarpalmer/timer').Repeated|undefined} */
		this.timer = undefined;

		content.hidden = true;

		if (isNullableOrWhitespace(this.id)) {
			this.id = `palmer_popover_${++index}`;
		}

		if (isNullableOrWhitespace(button.id)) {
			button.id = `${this.id}_button`;
		}

		if (isNullableOrWhitespace(content.id)) {
			content.id = `${this.id}_content`;
		}

		button.setAttribute('aria-controls', content.id);
		button.setAttribute('aria-expanded', false);
		button.setAttribute('aria-haspopup', 'dialog');

		content.setAttribute('role', 'dialog');
		content.setAttribute('aria-modal', false);
		content.setAttribute(focusTrapSelector, '');

		store.set(this, {
			keydown: onDocumentKeydown.bind(this),
			pointer: onDocumentPointer.bind(this),
		});

		setButtons(this);
	}

	hide() {
		this.open = false;
	}

	show() {
		this.open = true;
	}

	toggle() {
		handleToggle(this);
	}
}

customElements.define(selector, PalmerPopover);
