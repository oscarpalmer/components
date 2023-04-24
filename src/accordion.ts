import {eventOptions} from './helpers';

const keys: string[] = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'End', 'Home'];

function onKeydown(component: AccurateAccordion, event: KeyboardEvent): void {
	if (document.activeElement?.tagName !== 'SUMMARY' || !keys.includes(event.key) || component.details.length === 0) {
		return;
	}

	const current = component.details.indexOf(document.activeElement.parentElement as never);

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
			destination = component.details.length - 1;
			break;
		case 'Home':
			destination = 0;
			break;
	}

	if (destination < 0) {
		destination = component.details.length - 1;
	} else if (destination >= component.details.length) {
		destination = 0;
	}

	if (destination === current) {
		return;
	}

	const summary = component.details[destination]?.querySelector(':scope > summary');

	if (summary != null) {
		(summary as HTMLButtonElement).focus?.();
	}
}

function updateChildren(component: AccurateAccordion): void {
	component.details.splice(0);
	component.details.push(...(component.querySelectorAll(':scope > details') as NodeListOf<HTMLDetailsElement>));
}

class AccurateAccordion extends HTMLElement {
	private readonly observer: MutationObserver;

	readonly details: HTMLDetailsElement[] = [];

	constructor() {
		super();

		updateChildren(this);

		this.observer = new MutationObserver(_ => updateChildren(this));

		this.addEventListener('keydown', event => onKeydown(this, event), eventOptions.active);
	}

	connectedCallback(): void {
		this.observer.observe(this, {
			childList: true,
			subtree: true,
		});
	}

	disconnectedCallback(): void {
		this.observer.disconnect();
	}
}

customElements.define('accurate-accordion', AccurateAccordion);
