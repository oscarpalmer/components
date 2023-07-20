/**
 * @param {HTMLElement} element
 * @param {string|(element: HTMLElement) => boolean} match
 * @returns {HTMLElement|undefined}
 */
export function findParent(element, match) {
	const matchIsSelector = typeof match === 'string';

	if (matchIsSelector ? element.matches(match) : match(element)) {
		return element;
	}

	let parent = element?.parentElement;

	while (parent !== null) {
		if (parent === document.body) {
			return undefined;
		}

		if (matchIsSelector ? parent.matches(match) : match(parent)) {
			break;
		}

		parent = parent.parentElement;
	}

	return parent ?? undefined;
}

/**
 * @returns {number}
 */
export function getNumber(value) {
	return typeof value === 'number'
		? value
		: Number.parseInt(typeof value === 'string' ? value : String(value), 10);
}

/**
 * @param {HTMLElement} element
 * @returns {string}
 */
export function getTextDirection(element) {
	return getComputedStyle?.(element)?.direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * @param {string?} value
 * @returns {boolean}
 */
export function isNullOrWhitespace(value) {
	return (value ?? '').trim().length === 0;
}
