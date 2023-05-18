import {wait} from '@oscarpalmer/timer';
import {
	eventOptions,
	getFocusableElements,
	findParent,
	isNullOrWhitespace,
} from './helpers/index.js';
import {updateFloated} from './helpers/floated.js';
import {selector as focusTrapSelector} from './focus-trap.js';

/**
 * @typedef Callbacks
 * @property {(event: Event) => void} click
 * @property {(event: Event) => void} keydown
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
	} else {
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

	document[method]('click', callbacks.click, eventOptions.passive);
	document[method]('keydown', callbacks.keydown, eventOptions.passive);
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
 * @param {boolean|Event[undefined} expand
 */
function handleToggle(component, expand) {
	const expanded = typeof expand === 'boolean' ? !expand : component.open;

	component.button.setAttribute('aria-expanded', !expanded);

	if (expanded) {
		component.content.hidden = true;

		component.timer?.stop();

		afterToggle(component, false);
	} else {
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

		wait(() => {
			afterToggle(component, true);
		}, 50);
	}

	component.dispatchEvent(new Event('toggle'));
}

/**
 * @param {PalmerPopover} component
 * @param {HTMLButtonElement} button
 * @param {HTMLElement} content
 */
function initialise(component, button, content) {
	content.hidden = true;

	if (isNullOrWhitespace(component.id)) {
		component.id = `palmer_popover_${++index}`;
	}

	if (isNullOrWhitespace(button.id)) {
		button.id = `${component.id}_button`;
	}

	if (isNullOrWhitespace(content.id)) {
		content.id = `${component.id}_content`;
	}

	button.setAttribute('aria-controls', content.id);

	button.ariaExpanded = 'false';
	button.ariaHasPopup = 'dialog';

	if (!(button instanceof HTMLButtonElement)) {
		button.tabIndex = 0;
	}

	content.setAttribute(focusTrapSelector, '');

	content.role = 'dialog';
	content.ariaModal = 'false';

	store.set(component, {
		click: onClick.bind(component),
		keydown: onKeydown.bind(component),
	});

	button.addEventListener(
		'click',
		toggle.bind(component),
		eventOptions.passive,
	);
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
 * @param {Event} event
 */
function onClick(event) {
	if (this.open) {
		handleGlobalEvent(event, this, event.target);
	}
}

/**
 * @this {PalmerPopover}
 * @param {Event} event
 */
function onKeydown(event) {
	if (this.open && event instanceof KeyboardEvent && event.key === 'Escape') {
		handleGlobalEvent(event, this, document.activeElement);
	}
}

/**
 * @this {PalmerPopover}
 * @param {boolean|Event|undefined} expand
 */
function toggle(expand) {
	handleToggle(this, expand);
}

export class PalmerPopover extends HTMLElement {
	/**
	 * @readonly
	 * @type {HTMLElement}
	 */
	button;

	/**
	 * @readonly
	 * @type {HTMLElement}
	 */
	content;

	/**
	 * @private
	 * @type {import('@oscarpalmer/timer').Repeated|undefined}
	 */
	timer;

	get open() {
		return this.button?.getAttribute('aria-expanded') === 'true';
	}

	set open(open) {
		toggle.call(this, open);
	}

	constructor() {
		super();

		const button = this.querySelector(`:scope > [${selector}-button]`);
		const content = this.querySelector(`:scope > [${selector}-content]`);

		if (!isButton(button)) {
			throw new Error(
				`<${selector}> must have a <button>-element (or button-like element) with the attribute '${selector}-button`,
			);
		}

		if (content === null || !(content instanceof HTMLElement)) {
			throw new Error(
				`<${selector}> must have an element with the attribute '${selector}-content'`,
			);
		}

		this.button = button;
		this.content = content;

		initialise(this, button, content);
	}

	toggle() {
		if (this.button && this.content) {
			toggle.call(this);
		}
	}
}

customElements.define(selector, PalmerPopover);
