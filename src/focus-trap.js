import {wait} from '@oscarpalmer/timer';
import {eventOptions, findParent} from './helpers/index.js';
import {getFocusableElements} from './helpers/focusable.js';

export const selector = 'palmer-focus-trap';

/** @type {WeakMap<HTMLElement, FocusTrap>} */
const store = new WeakMap();

/**
 * @param {HTMLElement} element
 */
function create(element) {
	if (!store.has(element)) {
		store.set(element, new FocusTrap(element));
	}
}

/**
 * @param {HTMLElement} element
 */
function destroy(element) {
	const focusTrap = store.get(element);

	if (focusTrap === undefined) {
		return;
	}

	element.tabIndex = focusTrap.tabIndex;

	store.delete(element);
}

/**
 * @param {KeyboardEvent} event
 * @param {HTMLElement} focusTrap
 * @param {HTMLElement} element
 */
function handleEvent(event, focusTrap, element) {
	const elements = getFocusableElements(focusTrap);

	if (element === focusTrap) {
		wait(
			() => {
				(
					elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap
				).focus();
			},
			0,
		);

		return;
	}

	const index = elements.indexOf(element);

	let target = focusTrap;

	if (index > -1) {
		let position = index + (event.shiftKey ? -1 : 1);

		if (position < 0) {
			position = elements.length - 1;
		}
		else if (position >= elements.length) {
			position = 0;
		}

		target = elements[position] ?? focusTrap;
	}

	wait(
		() => {
			target.focus();
		},
		0,
	);
}

function observe(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}

		if (record.target.getAttribute(selector) === undefined) {
			destroy(record.target);
		}
		else {
			create(record.target);
		}
	}
}

function onKeydown(event) {
	if (event.key !== 'Tab') {
		return;
	}

	const focusTrap = findParent(event.target, `[${selector}]`);

	if (focusTrap === undefined) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	handleEvent(event, focusTrap, event.target);
}

class FocusTrap {
	/**
	 * @param {HTMLElement} element
	 */
	constructor(element) {
		/**
		 * @readonly
		 * @type {number}
		 */
		this.tabIndex = element.tabIndex;

		element.tabIndex = -1;
	}
}

(() => {
	if (globalThis.oscarpalmerComponentsFocusTrap !== null) {
		return;
	}

	globalThis.oscarpalmerComponentsFocusTrap = 1;

	const observer = new MutationObserver(observe);

	observer.observe(
		document,
		{
			attributeFilter: [selector],
			attributeOldValue: true,
			attributes: true,
			childList: true,
			subtree: true,
		},
	);

	wait(
		() => {
			const elements = Array.from(document.querySelectorAll(`[${selector}]`));

			for (const element of elements) {
				element.setAttribute(selector, '');
			}
		},
		0,
	);

	document.addEventListener('keydown', onKeydown, eventOptions.active);
})();
