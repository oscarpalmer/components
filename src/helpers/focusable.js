/**
 * @typedef FocusableItem
 * @property {HTMLElement|SVGElement} element
 * @property {number} tabIndex
 */

// TODO: rename to tabbable? add option to include elements with tabindex -1?

const booleanAttribute = /^(|true)$/i;

const filters = [isDisabled, isNotTabbable, isInert, isHidden, isSummarised];

const selector = [
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]:not(slot)',
	'a[href]',
	'audio[controls]',
	'button',
	'details',
	'details > summary:first-of-type',
	'iframe',
	'input',
	'select',
	'textarea',
	'video[controls]',
]
	.map(selector => `${selector}:not([inert])`)
	.join(',');

/**
 * @param {HTMLElement|SVGElement} element
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(element) {
	const items = Array.from(element.querySelectorAll(selector))
		.map(element => ({element, tabIndex: getTabIndex(element)}))
		.filter(item => isFocusableFilter(item));

	/** @type {Array<Array<HTMLElement|SVGElement>>} */
	const indiced = [];

	for (const item of items) {
		indiced[item.tabIndex] = [...(indiced[item.tabIndex] ?? []), item.element];
	}

	return indiced.flat();
}

/**
 * @param {HTMLElement|SVGElement} element
 * @returns {number}
 */
function getTabIndex(element) {
	if (element.tabIndex > -1) {
		return element.tabIndex;
	}

	if (/^(audio|details|video)$/i.test(element.tagName) || isEditable(element)) {
		return hasTabIndex(element) ? -1 : 0;
	}

	return -1;
}

/**
 * @param {HTMLElement|SVGElement} element
 * @returns {boolean}
 */
function hasTabIndex(element) {
	return !Number.isNaN(Number.parseInt(element.getAttribute('tabindex'), 10));
}

/**
 * @param {FocusableItem} item
 * @returns {boolean}
 */
function isDisabled(item) {
	if (
		/^(button|input|select|textarea)$/i.test(item.element.tagName) &&
		isDisabledFromFieldset(item.element)
	) {
		return true;
	}

	return (
		(item.element.disabled ?? false) ||
		item.element.getAttribute('aria-disabled') === 'true'
	);
}

/**
 * @param {HTMLElement|SVGElement} element
 * @returns {boolean}
 */
function isDisabledFromFieldset(element) {
	let parent = element.parentElement;

	while (parent !== null) {
		if (/^fieldset$/i.test(parent.tagName) && parent.disabled) {
			const children = Array.from(parent.children);

			for (const child of children) {
				if (/^legend$/i.test(child.tagName)) {
					return parent.matches('fieldset[disabled] *')
						? true
						: !child.contains(element);
				}
			}

			return true;
		}

		parent = parent.parentElement;
	}

	return false;
}

/**
 * @param {HTMLElement|SVGElement} element
 * @returns {boolean}
 */
function isEditable(element) {
	return booleanAttribute.test(element.getAttribute('contenteditable'));
}

/**
 * @param {HTMLElement|SVGElement} element
 * @returns {boolean}
 */
export function isFocusable(element) {
	return isFocusableFilter({element, tabIndex: getTabIndex(element)});
}

/**
 * @param {FocusableItem} item
 * @returns {boolean}
 */
function isFocusableFilter(item) {
	return !filters.some(callback => callback(item));
}

/**
 * @param {FocusableItem} item
 * @returns {boolean}
 */
function isHidden(item) {
	if (
		item.element.hidden ||
		(item.element instanceof HTMLInputElement && item.element.type === 'hidden')
	) {
		return true;
	}

	const style = getComputedStyle(item.element);

	if (style.display === 'none' || style.visibility === 'hidden') {
		return true;
	}

	const {height, width} = item.element.getBoundingClientRect();

	return height === 0 && width === 0;
}

/**
 * @param {FocusableItem} item
 * @returns {boolean}
 */
function isInert(item) {
	return (
		(item.element.inert ?? false) ||
		booleanAttribute.test(item.element.getAttribute('inert')) ||
		(item.element.parentElement !== null &&
			isInert({element: item.element.parentElement}))
	);
}

/**
 * @param {FocusableItem} item
 * @returns {boolean}
 */
function isNotTabbable(item) {
	return item.tabIndex < 0;
}

/**
 * @param {FocusableItem} item
 * @returns {boolean}
 */
function isSummarised(item) {
	return (
		/^details$/i.test(item.element.tagName) &&
		Array.from(item.element.children).some(child =>
			/^summary$/i.test(child.tagName),
		)
	);
}
