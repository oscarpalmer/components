import {eventOptions, findParent, isNullOrWhitespace} from './helpers';

type Active = {
	id: string;
	index: number;
};

type Options = {
	elements: HTMLLIElement[];
	wrapper: HTMLElement;
};

type Stored = {
	active: Active;
	options: Options;
};

const store = new WeakMap<PalmerListbox, Stored>();

let index = 0;

function createHeader(original: HTMLOptGroupElement): HTMLLIElement {
	const header = document.createElement('li');

	header.role = 'presentation';
	header.textContent = original.label;

	return header;
}

function createOption(original: HTMLOptionElement, prefix: string, group: number, index: number): HTMLLIElement {
	const option = document.createElement('li');

	option.ariaSelected = (original.selected ?? false) as never;
	option.id = `${prefix}_${group}_${index}`;
	option.innerHTML = original.innerHTML;
	option.role = 'option';

	option.setAttribute('data-focused', false as never);
	option.setAttribute('data-value', original.value);

	return option;
}

function createList(tag: 'div' | 'ul', original?: HTMLSelectElement): HTMLElement {
	const wrapper = document.createElement(tag);

	wrapper.ariaMultiSelectable = (original?.multiple ?? false) as never;

	if (original != null) {
		wrapper.role = 'listbox';
		wrapper.tabIndex = 0;
	} else {
		wrapper.role = 'group';
	}

	return wrapper;
}

function initialise(component: PalmerListbox, select: HTMLSelectElement): void {
	const stored: Stored = {
		active: {
			id: '',
			index: -1,
		},
		options: {
			elements: [],
			wrapper: null as never,
		},
	};

	store.set(component, stored);

	let id = select.id;

	if (isNullOrWhitespace(id)) {
		id = `palmer_listbox_${++index}`;
	}

	component.id = id;

	component.setAttribute('multiple', select.multiple as never);

	select.parentElement?.removeChild(select);

	const groups = Array.from(select.querySelectorAll('optgroup'));

	if (groups.length > 0) {
		stored.options.wrapper = createList('div', select);

		stored.options.wrapper.id = `${id}_lists`;

		for (const group of groups) {
			const index = groups.indexOf(group);

			const list = createList('ul');

			list.appendChild(createHeader(group));

			const options = Array.from(group.querySelectorAll('option'));

			for (const option of options) {
				const optionElement = createOption(option, id, index, options.indexOf(option));

				stored.options.elements.push(optionElement);

				list.appendChild(optionElement);
			}

			stored.options.wrapper.appendChild(list);
		}
	} else {
		stored.options.wrapper = createList('ul', select);

		stored.options.wrapper.id = `${id}_list`;

		const options = Array.from(select.querySelectorAll('option'));

		for (const option of options) {
			const optionElement = createOption(option, id, 0, options.indexOf(option));

			stored.options.elements.push(optionElement);

			stored.options.wrapper.appendChild(optionElement);
		}
	}

	stored.options.wrapper.addEventListener('blur', () => onBlur(component), eventOptions.passive);
	stored.options.wrapper.addEventListener('click', event => onClick(component, event), eventOptions.passive);
	stored.options.wrapper.addEventListener('focus', () => onFocus(component), eventOptions.passive);
	stored.options.wrapper.addEventListener('keydown', event => onKeydown(component, event), eventOptions.active);

	component.appendChild(stored.options.wrapper);
}

function onBlur(component: PalmerListbox): void {
	const stored = store.get(component);

	stored?.options.elements[stored.active.index]?.setAttribute('data-focused', false as never);
}

function onClick(component: PalmerListbox, event: Event): void {
	const stored = store.get(component);

	if (stored == null) {
		return;
	}

	const option = findParent(event.target as never, '[role=option]');

	if (option != null) {
		setActiveOption(component, stored.options.elements.indexOf(option as never), true);
	}
}

function onFocus(component: PalmerListbox): void {
	const stored = store.get(component);

	if (stored != null) {
		setActiveOption(component, stored.active.index > -1 ? stored.active.index : 0, false);
	}
}

function onKeydown(component: PalmerListbox, event: KeyboardEvent): void {
	if (![' ', 'ArrowDown', 'ArrowUp', 'End', 'Enter', 'Home'].includes(event.key)) {
		return;
	}

	event.preventDefault();

	const stored = store.get(component);

	if (stored == null) {
		return;
	}

	switch (event.key) {
		case ' ':
		case 'Enter':
			break;
		case 'ArrowDown':
		case 'ArrowUp':
			setActiveOption(component, stored.active.index + (event.key === 'ArrowDown' ? 1 : -1), false);
			break;

		case 'End':
		case 'Home':
			setActiveOption(component, event.key === 'End' ? stored.options.elements.length - 1 : 0, false);
			break;

		default:
			break;
	}
}

function selectOption(component: PalmerListbox, index: number, stored?: Stored): void {
	stored = stored ?? store.get(component);

	if (stored == null) {
		return;
	}

	const {multiple} = component;

	for (const element of stored.options.elements) {
		const elementIndex = stored.options.elements.indexOf(element);

		element.ariaSelected = index === elementIndex
			? element.ariaSelected === 'false'
				? true as never
				: false as never
			: multiple
				? element.ariaSelected
				: false as never;
	}
}

function setActiveOption(component: PalmerListbox, index: number, select: boolean): void {
	const stored = store.get(component);

	if (stored == null) {
		return;
	}

	let actual = index;

	if (actual < 0) {
		actual = stored.options.elements.length - 1;
	} else if (actual >= stored.options.elements.length) {
		actual= 0;
	}

	const next = stored.options.elements[actual];

	if (next == null) {
		return;
	}

	next.setAttribute('data-focused', true as never);

	if (select) {
		selectOption(component, index);
	}

	if (actual === stored.active.index) {
		return;
	}

	stored.options.elements[stored.active.index]?.setAttribute('data-focused', false as never);

	stored.options.wrapper.setAttribute('aria-activedescendant', next.id);

	stored.active.id = next.id;
	stored.active.index = actual;
}

class PalmerListbox extends HTMLElement {
	get multiple(): boolean {
		return this.getAttribute('multiple') === 'true';
	}

	constructor() {
		super();

		const select = this.querySelector('select');

		if (select == null) {
			throw new Error('...');
		}

		initialise(this, select);
	}
}

customElements.define('palmer-listbox', PalmerListbox);
