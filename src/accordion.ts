import {eventOptions} from './helpers';

type Stored = {
	elements: HTMLDetailsElement[];
	observer: MutationObserver;
};

const keys: string[] = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home'];

const store = new WeakMap<PalmerAccordion, Stored>();

function onKeydown(component: PalmerAccordion, event: KeyboardEvent): void {
	if (document.activeElement?.tagName !== 'SUMMARY' || !keys.includes(event.key)) {
		return;
	}

	const stored = store.get(component);

	if (stored == null || stored.elements.length === 0) {
		return;
	}

	const current = stored.elements.indexOf(document.activeElement.parentElement as never);

	if (current === -1) {
		return;
	}

	event.preventDefault();

	let destination = - 1;

	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowRight':
			destination = current + 1;
			break;
		case 'ArrowLeft':
		case 'ArrowUp':
			destination = current - 1;
			break;
		case 'End':
			destination = stored.elements.length - 1;
			break;
		case 'Home':
			destination = 0;
			break;
	}

	if (destination < 0) {
		destination = stored.elements.length - 1;
	} else if (destination >= stored.elements.length) {
		destination = 0;
	}

	if (destination === current) {
		return;
	}

	const summary = stored.elements[destination]?.querySelector(':scope > summary');

	if (summary != null) {
		(summary as HTMLButtonElement).focus?.();
	}
}

function onToggle(component: PalmerAccordion, element: HTMLDetailsElement) {
	if (element.open && !component.multiple) {
		toggleDetails(component, element);
	}
}

function setDetails(component: PalmerAccordion): void {
	const stored = store.get(component);

	if (stored == null) {
		return;
	}

	stored.elements = [...(component.querySelectorAll(':scope > details') as never)];

	for (const element of stored.elements) {
		element.addEventListener('toggle', () => onToggle(component, element));
	}
}

function toggleDetails(component: PalmerAccordion, active: HTMLDetailsElement | undefined): void {
	const stored = store.get(component);

	if (stored == null) {
		return;
	}

	for (const element of stored.elements) {
		if (element !== active && element.open) {
			element.open = false;
		}
	}
}

class PalmerAccordion extends HTMLElement {
	static observedAttributes = ['max', 'min', 'value'];

	get multiple(): boolean {
		return this.getAttribute('multiple') !== 'false';
	}

	set multiple(multiple: boolean) {
		if (typeof multiple === 'boolean') {
			this.setAttribute('multiple', multiple as never);
		}
	}

	constructor() {
		super();

		const stored: Stored = {
			elements: [],
			observer: new MutationObserver(_ => setDetails(this)),
		};

		store.set(this, stored);

		setDetails(this);

		this.addEventListener('keydown', event => onKeydown(this, event), eventOptions.active);

		if (!this.multiple) {
			toggleDetails(this, stored.elements.find(details => details.open));
		}
	}

	attributeChangedCallback(name: string): void {
		if (name === 'multiple' && !this.multiple) {
			toggleDetails(this, store.get(this)?.elements.find(details => details.open));
		}
	}

	connectedCallback(): void {
		store.get(this)?.observer.observe(this, {
			childList: true,
			subtree: true,
		});
	}

	disconnectedCallback(): void {
		store.get(this)?.observer.disconnect();
	}
}

customElements.define('palmer-accordion', PalmerAccordion);
