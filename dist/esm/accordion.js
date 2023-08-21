// src/helpers/event.js
function getOptions(passive, capture) {
	return {
		capture: capture ?? false,
		passive: passive ?? true,
	};
}

// src/accordion.js
var keys = /* @__PURE__ */ new Set([
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'End',
	'Home',
]);
var store = /* @__PURE__ */ new WeakMap();
function onKeydown(component, event) {
	if (
		document.activeElement?.getAttribute('palmer-disclosure-button') ===
			void 0 ||
		!keys.has(event.key)
	) {
		return;
	}
	const stored = store.get(component);
	if ((stored?.elements?.length ?? 0) === 0) {
		return;
	}
	const current = stored.elements.indexOf(document.activeElement.parentElement);
	if (current === -1) {
		return;
	}
	event.preventDefault();
	let destination = -1;
	switch (event.key) {
		case 'ArrowDown':
		case 'ArrowRight': {
			destination = current + 1;
			break;
		}
		case 'ArrowLeft':
		case 'ArrowUp': {
			destination = current - 1;
			break;
		}
		case 'End': {
			destination = stored.elements.length - 1;
			break;
		}
		case 'Home': {
			destination = 0;
			break;
		}
		default: {
			return;
		}
	}
	if (destination < 0) {
		destination = stored.elements.length - 1;
	} else if (destination >= stored.elements.length) {
		destination = 0;
	}
	if (destination !== current) {
		stored.elements[destination]?.button.focus();
	}
}
function onToggle(component, element) {
	if (element.open && !component.multiple) {
		toggleDisclosures(component, element);
	}
}
function setDisclosures(component) {
	const stored = store.get(component);
	if (stored === void 0) {
		return;
	}
	stored.elements = [
		...component.querySelectorAll(':scope > palmer-disclosure'),
	];
	for (const element of stored.elements) {
		element.addEventListener('toggle', () => onToggle(component, element));
	}
}
function toggleDisclosures(component, active) {
	const stored = store.get(component);
	if (stored === void 0) {
		return;
	}
	for (const element of stored.elements) {
		if (element !== active && element.open) {
			element.open = false;
		}
	}
}
var PalmerAccordion = class extends HTMLElement {
	/** @returns {boolean} */
	get multiple() {
		return this.getAttribute('multiple') !== 'false';
	}
	/** @param {boolean} multiple */
	set multiple(multiple) {
		this.setAttribute('multiple', multiple);
	}
	constructor() {
		super();
		const stored = {
			elements: [],
			observer: new MutationObserver(_ => setDisclosures(this)),
		};
		store.set(this, stored);
		setDisclosures(this);
		this.addEventListener(
			'keydown',
			event => onKeydown(this, event),
			getOptions(false),
		);
		if (!this.multiple) {
			toggleDisclosures(
				this,
				stored.elements.find(element => element.open),
			);
		}
	}
	attributeChangedCallback(name) {
		if (name === 'multiple' && !this.multiple) {
			toggleDisclosures(
				this,
				store.get(this)?.elements.find(element => element.open),
			);
		}
	}
	connectedCallback() {
		store.get(this)?.observer.observe(this, {
			childList: true,
			subtree: true,
		});
	}
	disconnectedCallback() {
		store.get(this)?.observer.disconnect();
	}
};
PalmerAccordion.observedAttributes = ['max', 'min', 'value'];
customElements.define('palmer-accordion', PalmerAccordion);
export {PalmerAccordion};
