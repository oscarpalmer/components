import {delay, eventOptions, findParent, getAttribute, setAttribute} from './helpers';

class Manager {
	static getChildren(component: DeliciousDetailsList): HTMLDetailsElement[] {
		return Array.from(component.querySelectorAll(':scope > delicious-details > details, :scope > details'));
	}

	static initializeList(component: DeliciousDetailsList): void {
		const {children, connected, observer, open} = Store.list;

		connected.set(component);

		children.set(component, Manager.getChildren(component));
		open.set(component, []);

		observer.set(component, new MutationObserver(records => {
			Observer.callback(component, records);
		}));

		observer.get(component)?.observe(component, Observer.options);

		component.addEventListener('keydown', Manager.onLocalKeydown.bind(component), eventOptions.passive);

		Manager.open(component, getAttribute(component, 'open', ''));
	}

	static onGlobalKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape') {
			return;
		}

		const {containers} = Store.details;

		const parent = findParent(document.activeElement as HTMLElement, element =>
			containers.has(element as DeliciousDetails)
			&& (containers.get(element as DeliciousDetails)?.open ?? true));

		if (parent instanceof DeliciousDetails) {
			Manager.onToggle.call(parent, false);
		}
	}

	static onLocalKeydown(event: KeyboardEvent): void {
		if (event.isComposing
				|| (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
				|| !(this instanceof DeliciousDetailsList)) {
			return;
		}

		const {target} = event;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const children = Store.list.children.get(this) ?? [];
		const parent = target.parentElement;
		const index = children.indexOf(parent as HTMLDetailsElement);

		if (index === -1) {
			return;
		}

		let position = index + (event.key === 'ArrowDown' ? 1 : -1);

		if (position < 0) {
			position = children.length - 1;
		} else if (position >= children.length) {
			position = 0;
		}

		const details = children[position];
		const summary = details?.querySelector(':scope > summary');

		(summary as HTMLButtonElement)?.focus();
	}

	static onToggle(open?: boolean): void {
		if (!(this instanceof DeliciousDetails)) {
			return;
		}

		const {buttons, containers} = Store.details;

		const container = containers.get(this);

		if (typeof container === 'undefined') {
			return;
		}

		container.open = open ?? !container.open;

		if (!container.open) {
			buttons.get(this)?.focus();
		}
	}

	static open(component: DeliciousDetailsList, value: string): void {
		if (value.length > 0 && !/^[\s\d,]+$/.test(value)) {
			throw new Error('The \'selected\'-attribute of a \'delicious-details-list\'-element must be a comma-separated string of numbers, e.g. \'\', \'0\' or \'0,1,2\'');
		}

		const parts = value.length > 0
			? value
				.split(',')
				.filter(index => index.trim().length > 0)
				.map(index => Number.parseInt(index, 10))
			: [];

		Manager.update(component, parts);
	}

	static update(component: DeliciousDetailsList, selection: number[] | undefined): void {
		if (typeof selection === 'undefined') {
			return;
		}

		const {children, observer, open} = Store.list;

		let sorted = selection
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort((f, s) => f - s);

		if (!component.multiple) {
			sorted = sorted.length > 0 && sorted[0] != null
				? sorted.length > 1
					? [sorted[0]]
					: sorted
				: [];
		}

		if (sorted.every((v, i) => component.open[i] === v)) {
			return;
		}

		observer.get(component)?.disconnect();

		const elements = children.get(component) ?? [];

		for (const element of elements) {
			if (sorted.includes(elements.indexOf(element)) !== element.open) {
				element.open = !element.open;
			}
		}

		open.set(component, sorted);

		delay(() => {
			const emit = component.open !== sorted;

			setAttribute(component, 'open', sorted.length === 0 ? null : sorted);

			if (emit) {
				component.dispatchEvent(new Event('toggle'));
			}

			delay(() => observer.get(component)?.observe(component, Observer.options));
		});
	}
}

class Observer {
	static readonly options: MutationObserverInit = {
		attributeFilter: ['open'],
		attributes: true,
		childList: true,
		subtree: true,
	};

	static callback(component: DeliciousDetailsList, records: MutationRecord[]): void {
		if (records.length === 0) {
			return;
		}

		const {children} = Store.list;
		const record = records[0];
		const added = Array.from(record?.addedNodes ?? []);
		const removed = Array.from(record?.removedNodes ?? []);

		if (added.concat(removed).some(element => element.parentElement === component)) {
			children.set(component, Manager.getChildren(component));

			return;
		}

		if (record?.type !== 'attributes' || !(record?.target instanceof HTMLDetailsElement)) {
			return;
		}

		const element = record.target;
		const elements = children.get(component) ?? [];
		const index = elements.indexOf(element);

		if (index === -1) {
			return;
		}

		let selection: number[] = [];

		if (component.multiple) {
			selection = element.open
				? component.open.concat([index])
				: component.open.filter(v => v !== index);
		} else {
			selection = element.open ? [index] : [];
		}

		Manager.update(component, selection);
	}
}

class Store {
	static readonly details = {
		buttons: new WeakMap<DeliciousDetails, HTMLButtonElement>(),
		connected: new WeakMap<DeliciousDetails, void>(),
		containers: new WeakMap<DeliciousDetails, HTMLDetailsElement>(),
	};

	static readonly list = {
		children: new WeakMap<DeliciousDetailsList, HTMLDetailsElement[]>(),
		connected: new WeakMap<DeliciousDetailsList, void>(),
		observer: new WeakMap<DeliciousDetailsList, MutationObserver>(),
		open: new WeakMap<DeliciousDetailsList, number[]>(),
	};
}

class DeliciousDetails extends HTMLElement {
	get open(): boolean {
		return Store.details.containers.get(this)?.open ?? false;
	}

	set open(open: boolean) {
		Manager.onToggle.call(this, open);
	}

	connectedCallback(): void {
		if (Store.details.connected.has(this)) {
			return;
		}

		const details = this.querySelector(':scope > details')!;
		const summary = details?.querySelector(':scope > summary');

		Store.details.connected.set(this);
		Store.details.buttons.set(this, summary as HTMLButtonElement);
		Store.details.containers.set(this, details as HTMLDetailsElement);
	}

	toggle(): void {
		Manager.onToggle.call(this);
	}
}

class DeliciousDetailsList extends HTMLElement {
	static get observedAttributes(): string[] {
		return ['multiple', 'open'];
	}

	get multiple(): boolean {
		return this.getAttribute('multiple') != null;
	}

	set multiple(multiple: boolean) {
		setAttribute(this, 'multiple', multiple ? '' : null);
	}

	get open(): number[] {
		return Store.list.open.get(this) ?? [];
	}

	set open(indices: number[]) {
		Manager.update(this, indices);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'multiple':
				Manager.open(this, getAttribute(this, 'open', ''));
				break;
			case 'open':
				Manager.open(this, newValue);
				break;
			default:
				break;
		}
	}

	connectedCallback(): void {
		if (!Store.list.connected.has(this)) {
			Manager.initializeList(this);
		}
	}
}

addEventListener?.('keydown', Manager.onGlobalKeydown, eventOptions.passive);

customElements?.define('delicious-details', DeliciousDetails);
customElements?.define('delicious-details-list', DeliciousDetailsList);
