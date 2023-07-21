import {wait} from '@oscarpalmer/timer';
import {findParent} from './helpers/index.js';
import {getOptions} from './helpers/event.js';
import {updateFloated} from './helpers/floated.js';
import {isFocusable} from './helpers/focusable.js';

/** @typedef Callbacks
 * @property {(event: Event) => void} click
 * @property {(event: Event) => void} hide
 * @property {(event: Event) => void} keydown
 * @property {(event: Event) => void} show
 */

const selector = 'palmer-tooltip';

const positionAttribute = `${selector}-position`;

/** @type {WeakMap<HTMLElement, PalmerTooltip>} */
const store = new WeakMap();

/**
 * @private
 * @param {HTMLElement} anchor
 * @returns {HTMLElement}
 */
function createFloater(anchor) {
	const id =
		anchor.getAttribute('aria-describedby')
		?? anchor.getAttribute('aria-labelledby');

	const element = id === null ? null : document.querySelector(`#${id}`);

	if (element === null) {
		throw new TypeError(
			`A '${selector}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`,
		);
	}

	element.setAttribute(`${selector}-content`, '');

	element.ariaHidden = 'true';
	element.hidden = true;
	element.role = 'tooltip';

	return element;
}

/**
 * @param {HTMLElement} anchor
 */
function createTooltip(anchor) {
	if (!store.has(anchor)) {
		store.set(anchor, new PalmerTooltip(anchor));
	}
}

/**
 * @param {HTMLElement} element
 */
function destroyTooltip(anchor) {
	const tooltip = store.get(anchor);

	if (tooltip === undefined) {
		return;
	}

	tooltip.handleCallbacks(false);

	store.delete(anchor);
}

/**
 * @param {MutationRecord[]} records
 */
function observe(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}

		if (record.target.getAttribute(selector) === null) {
			destroyTooltip(record.target);
		}
		else {
			createTooltip(record.target);
		}
	}
}

class PalmerTooltip {
	/**
	 * @constructor
	 * @param {HTMLElement} anchor
	 */
	constructor(anchor) {
		/** @private @readonly @type {HTMLElement} */
		this.anchor = anchor;

		/** @private @readonly @type {Callbacks} */
		this.callbacks = {
			click: this.onClick.bind(this),
			hide: this.onHide.bind(this),
			keydown: this.onKeyDown.bind(this),
			show: this.onShow.bind(this),
		};

		/** @private @readonly @type {boolean} */
		this.focusable = isFocusable(anchor);

		/** @private @readonly @type {HTMLElement} */
		this.floater = createFloater(anchor);

		/** @private @type {import('@oscarpalmer/timer').Repeated|undefined} */
		this.timer = undefined;

		this.handleCallbacks(true);
	}

	/**
	 * @param {Event} event
	 */
	onClick(event) {
		if (
			findParent(
				event.target,
				element => [this.anchor, this.floater].includes(element),
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

		document[method]('click', this.callbacks.click, getOptions());
		document[method]('keydown', this.callbacks.keydown, getOptions());

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
		}
		else {
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
			element[method]('mouseenter', this.callbacks.show, getOptions());
			element[method]('mouseleave', this.callbacks.hide, getOptions());
			element[method]('touchstart', this.callbacks.show, getOptions());
		}

		if (focusable) {
			anchor[method]('blur', this.callbacks.hide, getOptions());
			anchor[method]('focus', this.callbacks.show, getOptions());
		}
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
