export const focusableSelector = [
	'[contenteditable]:not([contenteditable="false"])',
	'[href]',
	'[tabindex="0"]:not(slot)',
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

/**
 * @param {HTMLElement} context
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(context) {
	const focusable = [];

	const elements = Array.from(context.querySelectorAll(focusableSelector));

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
