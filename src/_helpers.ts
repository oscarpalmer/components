export const eventOptions = {
	active: {capture: false, passive: false},
	passive: {capture: false, passive: true},
};

export function delay(callback: (time: DOMHighResTimeStamp) => void): number {
	return requestAnimationFrame?.(callback) ?? setTimeout?.(() => {
		callback(Date.now());
	}, 16);
}

export function findParent(element: HTMLElement, matches: (element: HTMLElement) => boolean): HTMLElement | undefined {
	let parent = element?.parentElement;

	while (parent != null) {
		if (parent === document.body) {
			return;
		}

		if (matches(parent)) {
			break;
		}

		parent = parent.parentElement;
	}

	return parent ?? undefined;
}

const focusableSelector = ['[href]', '[tabindex]', 'button', 'input', 'select', 'textarea']
	.map(selector => `${selector}:not([disabled]):not([hidden]):not([tabindex="-1"])`)
	.join(',');

export function getFocusableElements(context: Element): HTMLElement[] {
	const focusable: HTMLElement[] = [];

	const elements = Array.from(context.querySelectorAll(focusableSelector));

	for (const element of elements) {
		const style = window?.getComputedStyle?.(element);

		if (style == null || (style.display !== 'none' && style.visibility !== 'hidden')) {
			focusable.push(element as HTMLElement);
		}
	}

	return focusable;
}

export function getUuid(): string {
	return URL.createObjectURL(new Blob()).replace(/^.*\/([\w-]+)$/, '$1').replace(/-/g, '_');
}
