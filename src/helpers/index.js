export const eventOptions = {
	active: {capture: false, passive: false},
	passive: {capture: false, passive: true},
};

/**
 * @returns {boolean}
 */
export function isTouchScreen() {
	if (typeof globalThis._oscarpalmer_components_isTouchScreen === 'boolean') {
		return globalThis._oscarpalmer_components_isTouchScreen;
	}

	let isTouchScreen = false;

	try {
		if ('matchMedia' in window) {
			const media = matchMedia('(pointer: coarse)');

			if (typeof media?.matches === 'boolean') {
				isTouchScreen = media.matches;
			}
		}

		if (!isTouchScreen) {
			isTouchScreen = 'ontouchstart' in window
				|| navigator.maxTouchPoints > 0
				|| (navigator.msMaxTouchPoints ?? 0) > 0;
		}
	} catch {
		isTouchScreen = false;
	}

	globalThis._oscarpalmer_components_isTouchScreen = isTouchScreen;

	return isTouchScreen;
}

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
 * @param {MouseEvent|TouchEvent} event
 * @returns {{x: number; y: number}|undefined}
 */
export function getCoordinates(event) {
	if (event instanceof MouseEvent) {
		return {
			x: event.clientX,
			y: event.clientY,
		};
	}

	const x = event.touches[0]?.clientX;
	const y = event.touches[0]?.clientY;

	return x === null || y === null
		? undefined
		: {x, y};
}

/**
 * @param {HTMLElement} context
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(context) {
	const focusable = [];

	const elements = Array.from(context.querySelectorAll(getFocusableSelector()));

	for (const element of elements) {
		const style = getComputedStyle?.(element);

		if (
			style === null
			|| (style.display !== 'none' && style.visibility !== 'hidden')
		) {
			focusable.push(element);
		}
	}

	return focusable;
}

/**
 * @returns {string}
 */
export function getFocusableSelector() {
	if (globalThis._oscarpalmer_components_focusableSelector === null) {
		globalThis._oscarpalmer_components_focusableSelector = [
			'[contenteditable]:not([contenteditable="false"])',
			'[href]',
			'[tabindex]:not(slot)',
			'audio[controls]',
			'button',
			'details',
			'details[open] > summary',
			'embed',
			'iframe',
			'input',
			'object',
			'select',
			'textarea',
			'video[controls]',
		]
			.map(
				selector =>
					`${selector}:not([disabled]):not([hidden]):not([tabindex="-1"])`,
			)
			.join(',');
	}

	return globalThis._oscarpalmer_components_focusableSelector;
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
