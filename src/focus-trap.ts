import {wait} from '@oscarpalmer/timer';
import {eventOptions, getFocusableElements, findParent} from './helpers';

export const selector = 'palmer-focus-trap';

const store = new WeakMap<HTMLElement, FocusTrap>();

function handleEvent(event: KeyboardEvent, focusTrap: HTMLElement, element: HTMLElement): void {
	const elements = getFocusableElements(focusTrap);

	if (element === focusTrap) {
		wait(() => {
			(elements[event.shiftKey ? elements.length - 1 : 0] ?? focusTrap).focus();
		}, 0);

		return;
	}

	const index = elements.indexOf(element);

	let target = focusTrap;

	if (index > -1) {
		let position = index + (event.shiftKey ? -1 : 1);

		if (position < 0) {
			position = elements.length - 1;
		} else if (position >= elements.length) {
			position = 0;
		}

		target = elements[position] ?? focusTrap;
	}

	wait(() => {
		target.focus();
	}, 0);
}

function observe(records: MutationRecord[]) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}

		const element = record.target as HTMLElement;

		if (element.getAttribute(selector) == null) {
			FocusTrap.destroy(element);
		} else {
			FocusTrap.create(element);
		}
	}
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key !== 'Tab') {
		return;
	}

	const eventTarget = event.target as HTMLElement;
	const focusTrap = findParent(eventTarget, `[${selector}]`);

	if (focusTrap == null) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	handleEvent(event, focusTrap, eventTarget);
}

class FocusTrap {
	readonly tabIndex: number;

	constructor(element: HTMLElement) {
		this.tabIndex = element.tabIndex;

		element.tabIndex = -1;
	}

	static create(element: HTMLElement): void {
		if (!store.has(element)) {
			store.set(element, new FocusTrap(element));
		}
	}

	static destroy(element: HTMLElement): void {
		const focusTrap = store.get(element);

		if (focusTrap == null) {
			return;
		}

		element.tabIndex = focusTrap.tabIndex;

		store.delete(element);
	}
}

((): void => {
	const context: {palmerFocusTrap?: number} = globalThis as never;

	if (context.palmerFocusTrap != null) {
		return;
	}

	context.palmerFocusTrap = 1;

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

	document.addEventListener('keydown', onKeydown, eventOptions.active);
})();
