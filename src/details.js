import {wait} from '@oscarpalmer/timer';
import {getOptions} from './helpers/event.js';

const selector = 'palmer-details';

/** @type {WeakMap<HTMLDetailsElement, PalmerDetails>} */
const store = new WeakMap();

/**
 * @param {HTMLElement} element
 */
function create(element) {
	if (!store.has(element)) {
		store.set(element, new PalmerDetails(element));
	}
}

/**
 * @param {HTMLElement} element
 */
function destroy(element) {
	store.delete(element);
}

/**
 * @param {MutationRecord[]} records
 */
function observe(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}

		if (!(record.target instanceof HTMLDetailsElement)) {
			throw new TypeError(
				`An element with the '${selector}'-attribute must be a <details>-element`,
			);
		}

		if (record.target.getAttribute(selector) === null) {
			destroy(record.target);
		}
		else {
			create(record.target);
		}
	}
}

class PalmerDetails {
	/**
	 * @param {HTMLElement} element
	 */
	constructor(element) {
		/**
		 * @readonly
		 * @type {HTMLDetailsElement}
		 */
		this.details = element;

		/**
		 * @readonly
		 * @type {HTMLElement?}
		 */
		this.summary = element.querySelector(':scope > summary') ?? undefined;

		/**
		 * @readonly
		 * @type {{onKeydown: (event: KeyboardEvent) => void; onToggle: () => void}}
		 */
		this.callbacks = {
			onKeydown: this.onKeydown.bind(this),
			onToggle: this.onToggle.bind(this),
		};

		this.details.addEventListener(
			'toggle',
			this.callbacks.onToggle,
			getOptions(),
		);
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	onKeydown(event) {
		if (event.key !== 'Escape' || !this.details.open) {
			return;
		}

		event.stopPropagation();

		const children = [...this.details.querySelectorAll(`[${selector}][open]`)];

		if (
			children.some(child => child.contains(document.activeElement))
			|| !this.details.contains(document.activeElement)
		) {
			return;
		}

		this.details.open = false;

		wait(() => this.summary?.focus(), 0);
	}

	onToggle() {
		document[this.details.open ? 'addEventListener' : 'removeEventListener']?.(
			'keydown',
			this.callbacks.onKeydown,
			getOptions(),
		);
	}
}

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
