import {wait} from '@oscarpalmer/timer';
import {
	eventOptions,
	findParent,
	getFocusableSelector,
} from './helpers/index.js';
import {updateFloated} from './helpers/floated.js';

/** @typedef Callbacks
 * @property {(event: Event) => void} click
 * @property {(event: Event) => void} hide
 * @property {(event: Event) => void} keydown
 * @property {(event: Event) => void} show
 */

const selector = 'palmer-tooltip';

const contentAttribute = `${selector}-content`;
const positionAttribute = `${selector}-position`;

/** @type {WeakMap<HTMLElement, PalmerTooltip>} */
const store = new WeakMap();

/**
 * @param {MutationRecord[]} records
 */
function observe(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}

		if (record.target.getAttribute(selector) === null) {
			PalmerTooltip.destroy(record.target);
		} else {
			PalmerTooltip.create(record.target);
		}
	}
}

class PalmerTooltip {
	/**
	 * @private
	 * @readonly
	 * @type {HTMLElement}
	 */
	anchor;

	/**
	 * @private
	 * @readonly
	 * @type {Callbacks}
	 */
	callbacks = {
		click: this.onClick.bind(this),
		hide: this.onHide.bind(this),
		keydown: this.onKeyDown.bind(this),
		show: this.onShow.bind(this),
	};

	/**
	 * @private
	 * @readonly
	 * @type {HTMLElement}
	 */
	floater;

	/**
	 * @private
	 * @readonly
	 * @type {boolean}
	 */
	focusable;

	/**
	 * @private
	 */
	timer;

	/**
	 * @constructor
	 * @param {HTMLElement} anchor
	 */
	constructor(anchor) {
		this.anchor = anchor;

		this.focusable = anchor.matches(getFocusableSelector());

		this.floater = PalmerTooltip.createFloater(anchor);

		this.handleCallbacks(true);
	}

	/**
	 * @param {HTMLElement} anchor
	 */
	static create(anchor) {
		if (!store.has(anchor)) {
			store.set(anchor, new PalmerTooltip(anchor));
		}
	}

	/**
	 * @param {HTMLElement} element
	 */
	static destroy(anchor) {
		const tooltip = store.get(anchor);

		if (tooltip === undefined) {
			return;
		}

		tooltip.handleCallbacks(false);

		store.delete(anchor);
	}

	/**
	 * @private
	 * @param {HTMLElement} anchor
	 * @returns {HTMLElement}
	 */
	static createFloater(anchor) {
		const id = anchor.getAttribute('aria-describedby')
			?? anchor.getAttribute('aria-labelledby');

		const element = id === null ? null : document.querySelector(`#${id}`);

		if (element === null) {
			throw new TypeError(
				`A '${selector}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`,
			);
		}

		element.hidden = true;

		element.setAttribute(contentAttribute, '');

		element.ariaHidden = 'true';
		element.role = 'tooltip';

		return element;
	}

	/**
	 * @param {Event} event
	 */
	onClick(event) {
		if (
			findParent(event.target, element =>
				[this.anchor, this.floater].includes(element),
			) === undefined
		) {
			this.toggle(false);
		}
	}

	onHide() {
		this.toggle(false);
	}

	/**
	 * @param {Event} event
	 */
	onKeyDown(event) {
		if (event instanceof KeyboardEvent && event.key === 'Escape') {
			this.toggle(false);
		}
	}

	onShow() {
		this.toggle(true);
	}

	/**
	 * @param {boolean} show
	 */
	toggle(show) {
		const method = show ? 'addEventListener' : 'removeEventListener';

		document[method]('click', this.callbacks.click, eventOptions.passive);
		document[method]('keydown', this.callbacks.keydown, eventOptions.passive);

		if (show) {
			this.timer?.stop();

			this.timer = updateFloated({
				elements: {
					anchor: this.anchor,
					floater: this.floater,
				},
				position: {
					attribute: positionAttribute,
					defaultValue: 'vertical',
					preferAbove: true,
				},
			});
		} else {
			this.floater.hidden = true;

			this.timer?.stop();
		}
	}

	/**
	 * @private
	 * @param {boolean} add
	 */
	handleCallbacks(add) {
		const {anchor, floater, focusable} = this;

		const method = add ? 'addEventListener' : 'removeEventListener';

		for (const element of [anchor, floater]) {
			element[method]('mouseenter', this.callbacks.show, eventOptions.passive);
			element[method]('mouseleave', this.callbacks.hide, eventOptions.passive);
			element[method]('touchstart', this.callbacks.show, eventOptions.passive);
		}

		if (focusable) {
			anchor[method]('blur', this.callbacks.hide, eventOptions.passive);
			anchor[method]('focus', this.callbacks.show, eventOptions.passive);
		}
	}
}

const observer = new MutationObserver(observe);

observer.observe(document, {
	attributeFilter: [selector],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});

wait(() => {
	const elements = Array.from(document.querySelectorAll(`[${selector}]`));

	for (const element of elements) {
		element.setAttribute(selector, '');
	}
}, 0);
