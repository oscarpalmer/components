import {wait} from '@oscarpalmer/timer';
import {eventOptions, findParent, getFocusableElements, setAttribute} from './helpers';

export const attribute = 'formal-focus-trap';

const store = new WeakMap<HTMLElement, FocusTrap>();

function handle(event: KeyboardEvent, focusTrap: HTMLElement, element: HTMLElement): void {
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

		if (element.getAttribute(attribute) == null) {
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
	const focusTrap = findParent(eventTarget, `[${attribute}]`);

	if (focusTrap == null) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();

	handle(event, focusTrap, eventTarget);
}

class FocusTrap {
	readonly tabIndex: number;

	constructor(element: HTMLElement) {
		this.tabIndex = element.tabIndex;

		setAttribute(element, 'tabindex', '-1');
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

		setAttribute(element, 'tabindex', focusTrap.tabIndex);

		store.delete(element);
	}
}

((): void => {
	if (typeof (globalThis as any)._formalFocusTrap !== 'undefined') {
		return;
	}

	(globalThis as any)._formalFocusTrap = null;

	const observer = new MutationObserver(observe);

	observer.observe(document, {
		attributeFilter: [attribute],
		attributeOldValue: true,
		attributes: true,
		childList: true,
		subtree: true,
	});

	wait(() => {
		const focusTraps = Array.from(document.querySelectorAll(`[${attribute}]`));

		for (const focusTrap of focusTraps) {
			focusTrap.setAttribute(attribute, '');
		}
	}, 0);

	document.addEventListener('keydown', onKeydown, eventOptions.active);
})();
