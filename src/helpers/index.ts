export const eventOptions = {
	active: {capture: false, passive: false},
	passive: {capture: false, passive: true},
};

export const isTouchy = (() => {
	try {
		if ('matchMedia' in window) {
			const media = matchMedia('(pointer: coarse)');

			if (media != null && typeof media.matches === 'boolean') {
				return media.matches;
			}
		}

		return ('ontouchstart' in window)
			|| navigator.maxTouchPoints > 0
			|| ((navigator as any)?.msMaxTouchPoints ?? 0) > 0;
	} catch (_: unknown) {
		return false;
	}
})();

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

export function getCoordinates(event: MouseEvent | TouchEvent): {x: number; y: number} | undefined {
	if (event instanceof MouseEvent) {
		return {
			x: event.clientX,
			y: event.clientY,
		};
	}

	const x = event.touches[0]?.clientX;
	const y = event.touches[0]?.clientY;

	return x == null || y == null
		? undefined
		: {x,y};
}

export function getFocusableElements(context: HTMLElement): HTMLElement[] {
	const focusable: HTMLElement[] = [];

	const elements = Array.from(context.querySelectorAll(getFocusableSelector()));

	for (const element of elements) {
		const style = getComputedStyle?.(element);

		if (style == null || (style.display !== 'none' && style.visibility !== 'hidden')) {
			focusable.push(element as HTMLElement);
		}
	}

	return focusable;
}

export function getFocusableSelector(): string {
	const context: {focusableSelector?: string} = globalThis as never;

	if (context.focusableSelector == null) {
		context.focusableSelector = [
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
			.map(selector => `${selector}:not([disabled]):not([hidden]):not([tabindex="-1"])`)
			.join(',');
	}

	return context.focusableSelector;
}

export function getNumber(value: any): number {
	return typeof value === 'number'
		? value
		: Number.parseInt(typeof value === 'string' ? value : String(value), 10);
}

export function getTextDirection(element: HTMLElement): 'ltr' | 'rtl' {
	const {direction} = getComputedStyle?.(element);

	return direction === 'rtl'
		? 'rtl'
		: 'ltr';
}

export function isNullOrWhitespace(value: string | null | undefined): boolean {
	return (value ?? '').trim().length === 0;
}
