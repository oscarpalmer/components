import {wait} from '@oscarpalmer/timer';
import {findParent, isNullOrWhitespace} from './helpers/index.js';
import {getOptions} from './helpers/event.js';
import {updateFloated} from './helpers/floated.js';
import {getFocusableElements} from './helpers/focusable.js';
import {methods} from './helpers/touchy.js';
import {selector as focusTrapSelector} from './focus-trap.js';

/**
 * @typedef Callbacks
 * @property {(event: Event) => void} keydown
 * @property {(event: Event) => void} pointer
 */

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

	if (active && component.content) {
		(getFocusableElements(component.content)?.[0] ?? component.content).focus();
	}
	else {
		component.button?.focus();
	}
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
 * @param {Event} event
 * @param {PalmerPopover} component
 * @param {HTMLElement} target
 */
function handleGlobalEvent(event, component, target) {
	const {button, content} = component;

	if (button === undefined || content === undefined) {
		return;
	}

	const floater = findParent(target, `[${selector}-content]`);

	if (floater === undefined) {
		handleToggle(component, false);

		return;
	}

	event.stopPropagation();

	const children = Array.from(document.body.children);
	const difference = children.indexOf(floater) - children.indexOf(content);

	if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
		handleToggle(component, false);
	}
}

/**
 * @param {PalmerPopover} component
 * @param {boolean|undefined} expand
 */
function handleToggle(component, expand) {
	const expanded = typeof expand === 'boolean' ? !expand : component.open;

	component.button.ariaExpanded = !expanded;

	if (expanded) {
		component.content.hidden = true;

		component.timer?.stop();

		afterToggle(component, false);
	}
	else {
		component.timer?.stop();

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

		wait(
			() => {
				afterToggle(component, true);
			},
			50,
		);
	}

	component.dispatchEvent(new CustomEvent('toggle', {detail: component.open}));
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isButton(node) {
	if (node === null) {
		return false;
	}

	if (node instanceof HTMLButtonElement) {
		return true;
	}

	return node instanceof HTMLElement && node.getAttribute('role') === 'button';
}

/**
 * @this {PalmerPopover}
 * @param {Event|KeyboardEvent} event
 */
function onClose(event) {
	if (!(event instanceof KeyboardEvent) || [' ', 'Enter'].includes(event.key)) {
		handleToggle(this, false);
	}
}

/**
 * @this {PalmerPopover}
 * @param {Event} event
 */
function onDocumentKeydown(event) {
	if (this.open && event instanceof KeyboardEvent && event.key === 'Escape') {
		handleGlobalEvent(event, this, document.activeElement);
	}
}

/**
 * @this {PalmerPopover}
 * @param {Event} event
 */
function onDocumentPointer(event) {
	if (this.open) {
		handleGlobalEvent(event, this, event.target);
	}
}

/**
 * @this {PalmerPopover}
 * @param {Event|KeyboardEvent} event
 */
function onToggle(event) {
	if (!(event instanceof KeyboardEvent) || [' ', 'Enter'].includes(event.key)) {
		handleToggle(this);
	}
}

/**
 * @param {PalmerPopover} component
 * @param {HTMLElement} button
 * @param {(event: Event|KeyboardEvent) => void} callback
 */
function setButton(component, button, callback) {
	button.addEventListener('click', callback.bind(component), getOptions());

	if (!(button instanceof HTMLButtonElement)) {
		button.tabIndex = 0;

		button.addEventListener('keydown', callback.bind(component), getOptions());
	}
}

/**
 * @param {PalmerPopover} component
 */
function setButtons(component) {
	setButton(component, component.button, onToggle);

	const buttons = Array.from(component.querySelectorAll(`[${selector}-close]`));

	for (const button of buttons) {
		setButton(component, button, onClose);
	}
}

export class PalmerPopover extends HTMLElement {
	get open() {
		return this.button?.ariaExpanded === 'true';
	}

	set open(open) {
		handleToggle(this, open);
	}

	constructor() {
		super();

		const button = this.querySelector(`[${selector}-button]`);
		const content = this.querySelector(`[${selector}-content]`);

		if (!isButton(button)) {
			throw new TypeError(
				`<${selector}> must have a <button>-element (or button-like element) with the attribute '${selector}-button`,
			);
		}

		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> must have an element with the attribute '${selector}-content'`,
			);
		}

		/** @readonly @type {HTMLElement} */
		this.button = button;

		/** @readonly @type {HTMLElement} */
		this.content = content;

		/** @private @type {import('@oscarpalmer/timer').Repeated|undefined} */
		this.timer = undefined;

		content.hidden = true;

		if (isNullOrWhitespace(this.id)) {
			this.id = `palmer_popover_${++index}`;
		}

		if (isNullOrWhitespace(button.id)) {
			button.id = `${this.id}_button`;
		}

		if (isNullOrWhitespace(content.id)) {
			content.id = `${this.id}_content`;
		}

		button.ariaExpanded = false;
		button.ariaHasPopup = 'dialog';

		button.setAttribute('aria-controls', content.id);

		content.role = 'dialog';
		content.ariaModal = false;

		content.setAttribute(focusTrapSelector, '');

		store.set(
			this,
			{
				keydown: onDocumentKeydown.bind(this),
				pointer: onDocumentPointer.bind(this),
			},
		);

		setButtons(this);
	}

	toggle() {
		handleToggle(this);
	}
}

customElements.define(selector, PalmerPopover);
