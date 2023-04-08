import {wait} from '@oscarpalmer/timer';
import {eventOptions} from './helpers';

type DeliciousDetailsCallbacks = {
	onKeydown: (event: KeyboardEvent) => void;
	onToggle: () => void;
};

const attribute = 'delicious-details';

const store = new WeakMap<HTMLDetailsElement, DeliciousDetails>();

function observe(records: MutationRecord[]): void {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}

		const element = record.target as HTMLElement;

		if (!(element instanceof HTMLDetailsElement)) {
			throw new Error(`An element with the '${attribute}'-attribute must be a <details>-element`);
		}

		if (element.getAttribute(attribute) == null) {
			DeliciousDetails.destroy(element);
		} else {
			DeliciousDetails.create(element);
		}
	}
}

class DeliciousDetails {
	private readonly callbacks!: DeliciousDetailsCallbacks;

	readonly details: HTMLDetailsElement;
	readonly summary: HTMLElement | undefined;

	constructor(element: HTMLDetailsElement) {
		this.details = element;
		this.summary = element.querySelector(':scope > summary') as HTMLElement ?? undefined;

		this.callbacks = {
			onKeydown: this.onKeydown.bind(this),
			onToggle: this.onToggle.bind(this),
		};

		this.details.addEventListener('toggle', this.callbacks.onToggle, eventOptions.passive);
	}

	onKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || !this.details.open) {
			return;
		}

		const children = [...this.details.querySelectorAll(`[${attribute}][open]`)];

		if (children.some(child => child.contains(document.activeElement)) || !this.details.contains(document.activeElement)) {
			return;
		}

		this.details.open = false;

		wait(() => this.summary?.focus(), 0);
	}

	onToggle(): void {
		document[this.details.open ? 'addEventListener' : 'removeEventListener']?.('keydown', this.callbacks.onKeydown as never, eventOptions.passive);
	}

	static create(element: HTMLDetailsElement): void {
		if (!store.has(element)) {
			store.set(element, new DeliciousDetails(element));
		}
	}

	static destroy(element: HTMLDetailsElement): void {
		store.delete(element);
	}
}

const observer = new MutationObserver(observe);

observer.observe(document, {
	attributeFilter: [attribute],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});

wait(() => {
	const details = Array.from(document.querySelectorAll(`[${attribute}]`));

	for (const detail of details) {
		detail.setAttribute(attribute, '');
	}
}, 0);
