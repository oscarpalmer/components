export const eventOptions = {
	active: {capture: false, passive: false},
	passive: {capture: false, passive: true},
};

const focusableSelectors = [
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
];

export const focusableSelector = focusableSelectors
	.map(selector => `${selector}:not([disabled]):not([hidden]):not([tabindex="-1"])`)
	.join(',');

export function defineProperty(obj: unknown, key: PropertyKey, value: unknown): void {
	Object.defineProperty(obj, key, {
		value,
		writable: false,
	});
}

export function delay(callback: (time: DOMHighResTimeStamp) => void): number {
	return globalThis.requestAnimationFrame?.(callback) ?? globalThis.setTimeout?.(() => {
		callback(Date.now());
	}, 16);
}

export function findParent(element: HTMLElement, match: string | ((element: HTMLElement) => boolean)): HTMLElement | undefined {
	const matchIsSelector = typeof match === 'string';

	if (matchIsSelector ? element.matches(match) : match(element)) {
		return element;
	}

	let parent = element?.parentElement;

	while (parent != null) {
		if (parent === document.body) {
			return;
		}

		if (matchIsSelector ? parent.matches(match) : match(parent)) {
			break;
		}

		parent = parent.parentElement;
	}

	return parent ?? undefined;
}

export function getAttribute(element: HTMLElement, attribute: string, defaultValue: string): string {
	const value = element.getAttribute(attribute);

	return value == null || value.trim().length === 0
		? defaultValue
		: value;
}

export function getFocusableElements(context: Element): HTMLElement[] {
	const focusable: HTMLElement[] = [];

	const elements = Array.from(context.querySelectorAll(focusableSelector));

	for (const element of elements) {
		const style = globalThis.getComputedStyle?.(element);

		if (style == null || (style.display !== 'none' && style.visibility !== 'hidden')) {
			focusable.push(element as HTMLElement);
		}
	}

	return focusable;
}

export function isNullOrWhitespace(value: string): boolean {
	if (value == null) {
		return true;
	}

	return value.trim().length === 0;
}

export function setAttribute(element: HTMLElement, attribute: string, value: unknown): void {
	if (value == null) {
		element.removeAttribute(attribute);
	} else {
		element.setAttribute(attribute, String(value));
	}
}

export function setProperty(element: HTMLElement, property: string, value: unknown): void {
	element.setAttribute(property, String(typeof value === 'boolean' ? value : false));
}
