const keyEventOptions = {capture: false, passive: true};

class DetailsHandler {
	static escape(event: KeyboardEvent): void {
		if (event.key !== 'Escape') {
			return;
		}

		let parent = document.activeElement?.parentElement;

		while (parent != null) {
			if (parent === document.body) {
				parent = null;

				break;
			}

			if (parent instanceof DeliciousDetails && (Store.details.containers.get(parent)?.open ?? true)) {
				break;
			}

			parent = parent.parentElement;
		}

		if (parent != null) {
			DetailsHandler.toggle(parent, false);
		}
	}

	static toggle(component: DeliciousDetails, open?: boolean): void {
		const {buttons, containers} = Store.details;

		const container = containers.get(component);

		if (container == null) {
			return;
		}

		container.open = open ?? !container.open;

		if (!container.open) {
			buttons.get(component)?.focus();
		}
	}
}

class ListHandler {
	static getChildren(component: DeliciousDetailsList): HTMLDetailsElement[] {
		return Array.from(component.querySelectorAll(':scope > delicious-details > details, :scope > details'));
	}

	static open(component: DeliciousDetailsList, value: string | undefined): void {
		if (value == null) {
			return;
		}

		if (value.length > 0 && !/^[\s\d,]+$/.test(value)) {
			throw new Error('The \'selected\'-attribute of a \'delicious-details-list\'-element must be a comma-separated string of numbers, e.g. \'\', \'0\' or \'0,1,2\'');
		}

		const parts = value.length > 0
			? value
				.split(',')
				.filter(index => index.trim().length > 0)
				.map(index => Number.parseInt(index, 10))
			: [];

		this.update(component, parts);
	}

	static traverse(component: DeliciousDetailsList, event: KeyboardEvent): void {
		if (event.isComposing || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) {
			return;
		}

		const {target} = event;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		const children = Store.list.children.get(component) ?? [];
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
			if (sorted.length === 0) {
				component.removeAttribute('open');
			} else {
				component.setAttribute('open', sorted.join(','));
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
			children.set(component, ListHandler.getChildren(component));

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

		ListHandler.update(component, selection);
	}
}

class Store {
	static readonly details = {
		buttons: new WeakMap<DeliciousDetails, HTMLButtonElement>(),
		containers: new WeakMap<DeliciousDetails, HTMLDetailsElement>(),
	};

	static readonly list = {
		children: new WeakMap<DeliciousDetailsList, HTMLDetailsElement[]>(),
		observer: new WeakMap<DeliciousDetailsList, MutationObserver>(),
		open: new WeakMap<DeliciousDetailsList, number[]>(),
	};
}

function delay(callback: () => void): number {
	return requestAnimationFrame?.(callback) ?? setTimeout?.(callback, 16);
}

class DeliciousDetails extends HTMLElement {
	close(): void {
		DetailsHandler.toggle(this, false);
	}

	connectedCallback(): void {
		const details = this.querySelector(':scope > details')!;
		const summary = details?.querySelector(':scope > summary');

		Store.details.buttons.set(this, summary as HTMLButtonElement);
		Store.details.containers.set(this, details as HTMLDetailsElement);
	}

	disconnectedCallback(): void {
		Store.details.buttons.delete(this);
		Store.details.containers.delete(this);
	}

	open(): void {
		DetailsHandler.toggle(this, true);
	}

	toggle(): void {
		DetailsHandler.toggle(this);
	}
}

class DeliciousDetailsList extends HTMLElement {
	static get observedAttributes() {
		return ['multiple', 'open'];
	}

	get multiple(): boolean {
		return this.getAttribute('multiple') != null;
	}

	set multiple(multiple: boolean) {
		if (multiple) {
			this.setAttribute('multiple', '');
		} else {
			this.removeAttribute('multiple');
		}
	}

	get open(): number[] {
		return Store.list.open.get(this) ?? [];
	}

	set open(indices: number[]) {
		ListHandler.update(this, indices);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'multiple':
				ListHandler.open(this, this.getAttribute('open') ?? undefined);
				break;
			case 'open':
				ListHandler.open(this, newValue);
				break;
			default:
				break;
		}
	}

	connectedCallback(): void {
		const {children, observer, open} = Store.list;

		children.set(this, ListHandler.getChildren(this));
		open.set(this, []);

		observer.set(this, new MutationObserver(records => {
			Observer.callback(this, records);
		}));

		observer.get(this)?.observe(this, Observer.options);

		this.addEventListener('keydown', event => {
			ListHandler.traverse(this, event);
		}, keyEventOptions);

		ListHandler.open(this, this.getAttribute('open') ?? undefined);
	}

	disconnectedCallback(): void {
		const {children, observer, open} = Store.list;

		children.delete(this);
		observer.get(this)?.disconnect();
		observer.delete(this);
		open.delete(this);
	}
}

addEventListener?.('keyup', DetailsHandler.escape, keyEventOptions);

customElements?.define('delicious-details', DeliciousDetails);
customElements?.define('delicious-details-list', DeliciousDetailsList);
