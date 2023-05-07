import {Repeated, wait} from '@oscarpalmer/timer';
import {eventOptions, getFocusableElements, findParent, isNullOrWhitespace} from './helpers';
import {updateFloated} from './helpers/floated';
import {selector as focusTrapSelector} from './focus-trap';

type Callbacks = {
	click: (event: Event) => void;
	keydown: (event: Event) => void;
};

const selector = 'palmer-popover';

const store = new WeakMap<PalmerPopover, Callbacks>();

let index = 0;

function afterToggle(component: PalmerPopover, active: boolean): void {
	handleCallbacks(component, active);

	if (active && component.content) {
		(getFocusableElements(component.content)?.[0] ?? component.content).focus();
	} else {
		component.button?.focus();
	}
}

function handleCallbacks(component: PalmerPopover, add: boolean): void {
	const callbacks = store.get(component);

	if (callbacks == null) {
		return;
	}

	const method = add
		? 'addEventListener'
		: 'removeEventListener';

	document[method]('click', callbacks.click, eventOptions.passive);
	document[method]('keydown', callbacks.keydown, eventOptions.passive);
}

function handleGlobalEvent(event: Event, component: PalmerPopover, target: HTMLElement): void {
	const {button, content} = component;

	if (button == null || content == null) {
		return;
	}

	const floater = findParent(target, `[${selector}-content]`);

	if (floater == null) {
		handleToggle(component, false);

		return;
	}

	event.stopPropagation();

	const children = Array.from(document.body.children);
	const difference = children.indexOf(floater) - children.indexOf(content);

	if (difference < (event instanceof KeyboardEvent ? 1 : 0)) {
		handleToggle(component, false);
	}
}

function handleToggle(component: PalmerPopover, expand?: boolean | Event): void {
	const expanded = typeof expand === 'boolean'
		? !expand
		: component.open;

	component.button.setAttribute('aria-expanded', !expanded as never);

	if (expanded) {
		component.content.hidden = true;

		component.timer?.stop();

		afterToggle(component, false);
	} else {
		component.timer?.stop();

		component.timer = updateFloated({
			elements: {
				anchor: component.button,
				floater: component.content,
				parent: component,
			},
			position: {
				attribute: 'position',
				defaultValue: 'vertical',
				preferAbove: false,
			},
		});

		wait(() => {
			afterToggle(component, true);
		}, 50);
	}

	component.dispatchEvent(new Event('toggle'));
}

function initialise(component: PalmerPopover, button: HTMLButtonElement, content: HTMLElement): void {
	content.hidden = true;

	if (isNullOrWhitespace(component.id)) {
		component.id = `palmer_popover_${++index}`;
	}

	if (isNullOrWhitespace(button.id)) {
		button.id = `${component.id}_button`;
	}

	if (isNullOrWhitespace(content.id)) {
		content.id = `${component.id}_content`;
	}

	button.setAttribute('aria-controls', content.id);

	button.ariaExpanded = 'false';
	button.ariaHasPopup = 'dialog';

	if (!(button instanceof HTMLButtonElement)) {
		(button as HTMLElement).tabIndex = 0;
	}

	content.setAttribute(focusTrapSelector, '');

	content.role = 'dialog';
	content.ariaModal = 'false';

	store.set(component, {
		click: onClick.bind(component),
		keydown: onKeydown.bind(component),
	});

	button.addEventListener('click', toggle.bind(component), eventOptions.passive);
}

function isButton(node: any): boolean {
	if (node == null) {
		return false;
	}

	if (node instanceof HTMLButtonElement) {
		return true;
	}

	return node instanceof HTMLElement && node.getAttribute('role') === 'button';
}

function onClick(this: PalmerPopover, event: Event): void {
	if (this.open) {
		handleGlobalEvent(event, this, event.target as never);
	}
}

function onKeydown(this: PalmerPopover, event: Event): void {
	if (this.open && (event instanceof KeyboardEvent) && event.key === 'Escape') {
		handleGlobalEvent(event, this, document.activeElement as never);
	}
}

function toggle(this: PalmerPopover, expand?: boolean | Event): void {
	handleToggle(this, expand);
}

export class PalmerPopover extends HTMLElement {
	readonly button!: HTMLElement;
	readonly content!: HTMLElement;

	timer: Repeated | undefined;

	get open(): boolean {
		return this.button?.getAttribute('aria-expanded') === 'true';
	}

	set open(open: boolean) {
		toggle.call(this, open);
	}

	constructor() {
		super();

		const button = this.querySelector(`:scope > [${selector}-button]`);
		const content = this.querySelector(`:scope > [${selector}-content]`);

		if (!isButton(button)) {
			throw new Error(`<${selector}> must have a <button>-element (or button-like element) with the attribute '${selector}-button`);
		}

		if (content == null || !(content instanceof HTMLElement)) {
			throw new Error(`<${selector}> must have an element with the attribute '${selector}-content'`);
		}

		this.button = button as never;
		this.content = content;

		initialise(this, button as HTMLButtonElement, content);
	}

	toggle(): void {
		if (this.button && this.content) {
			toggle.call(this);
		}
	}
}

customElements.define(selector, PalmerPopover);
