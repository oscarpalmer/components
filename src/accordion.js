import {eventOptions} from './helpers/index.js';

/**
 * @typedef Stored
 * @property {HTMLDetailsElement[]} elements
 * @property {MutationObserver} observer
*/

const keys = new Set(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home']);

/** @type {WeakMap<PalmerAccordion, Stored>} */
const store = new WeakMap();

/**
 * @param {PalmerAccordion} component
 * @param {KeyboardEvent} event
 */
function onKeydown(component, event) {
	if (document.activeElement?.tagName !== 'SUMMARY' || !keys.has(event.key)) {
		return;
	}

	const stored = store.get(component);

	if ((stored?.elements?.length ?? 0) === 0) {
		return;
	}

	const current = stored.elements.indexOf(document.activeElement.parentElement);

	if (current === -1) {
		return;
	}

	event.preventDefault();

	let destination = -1;

	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowRight': {
			destination = current + 1;
			break;
		}

		case 'ArrowLeft':
		case 'ArrowUp': {
			destination = current - 1;
			break;
		}

		case 'End': {
			destination = stored.elements.length - 1;
			break;
		}

		case 'Home': {
			destination = 0;
			break;
		}

		default: {
			return;
		}
	}

	if (destination < 0) {
		destination = stored.elements.length - 1;
	} else if (destination >= stored.elements.length) {
		destination = 0;
	}

	if (destination === current) {
		return;
	}

	const summary = stored.elements[destination]?.querySelector(':scope > summary');

	summary?.focus?.();
}

/**
 * @param {PalmerAccordion} component
 * @param {HTMLDetailsElement} element
 */
function onToggle(component, element) {
	if (element.open && !component.multiple) {
		toggleDetails(component, element);
	}
}

/**
 * @param {PalmerAccordion} component
 */
function setDetails(component) {
	const stored = store.get(component);

	if (stored === undefined) {
		return;
	}

	stored.elements = [...component.querySelectorAll(':scope > details')];

	for (const element of stored.elements) {
		element.addEventListener('toggle', () => onToggle(component, element));
	}
}

/**
 * @param {PalmerAccordion} component
 * @param {HTMLDetailsElement?} active
 */
function toggleDetails(component, active) {
	const stored = store.get(component);

	if (stored === undefined) {
		return;
	}

	for (const element of stored.elements) {
		if (element !== active && element.open) {
			element.open = false;
		}
	}
}

export class PalmerAccordion extends HTMLElement {
	static observedAttributes = ['max', 'min', 'value'];

	get multiple() {
		return this.getAttribute('multiple') !== 'false';
	}

	set multiple(multiple) {
		if (typeof multiple === 'boolean') {
			this.setAttribute('multiple', multiple);
		}
	}

	constructor() {
		super();

		const stored = {
			elements: [],
			observer: new MutationObserver(_ => setDetails(this)),
		};

		store.set(this, stored);

		setDetails(this);

		this.addEventListener('keydown', event => onKeydown(this, event), eventOptions.active);

		if (!this.multiple) {
			toggleDetails(this, stored.elements.find(details => details.open));
		}
	}

	attributeChangedCallback(name) {
		if (name === 'multiple' && !this.multiple) {
			toggleDetails(this, store.get(this)?.elements.find(details => details.open));
		}
	}

	connectedCallback() {
		store.get(this)?.observer.observe(this, {
			childList: true,
			subtree: true,
		});
	}

	disconnectedCallback() {
		store.get(this)?.observer.disconnect();
	}
}

customElements.define('palmer-accordion', PalmerAccordion);
