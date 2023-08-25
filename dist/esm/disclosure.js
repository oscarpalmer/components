// src/helpers/index.js
function isNullableOrWhitespace(value) {
	return (value ?? '').trim().length === 0;
}

// src/helpers/event.js
var toggleClosed = 'closed';
var toggleOpen = 'open';
function getOptions(passive, capture) {
	return {
		capture: capture ?? false,
		passive: passive ?? true,
	};
}
function getToggleState(open) {
	return {
		newState: open ? toggleOpen : toggleClosed,
		oldState: open ? toggleClosed : toggleOpen,
	};
}

// src/disclosure.js
var selector = 'palmer-disclosure';
var skip = /* @__PURE__ */ new WeakSet();
var index = 0;
function setAttributes(component, button, open) {
	skip.add(component);
	if (open) {
		component.setAttribute('open', '');
	} else {
		component.removeAttribute('open');
	}
	button.setAttribute('aria-expanded', open);
}
function setExpanded(component, open) {
	if (component.open === open || skip.has(component)) {
		skip.delete(component);
		return;
	}
	const detail = getToggleState(open);
	if (
		!component.dispatchEvent(
			new CustomEvent('beforetoggle', {
				detail,
				cancelable: true,
			}),
		)
	) {
		return;
	}
	setAttributes(component, component.button, open);
	component.content.hidden = !open;
	component.dispatchEvent(
		new CustomEvent('toggle', {
			detail,
		}),
	);
}
var PalmerDisclosure = class extends HTMLElement {
	/** @returns {boolean} */
	get open() {
		const open = this.getAttribute('open');
		return !(open === null || open === 'false');
	}
	/** @param {boolean} value */
	set open(value) {
		if (typeof value === 'boolean') {
			setExpanded(this, value);
		}
	}
	constructor() {
		super();
		const button = this.querySelector(`[${selector}-button]`);
		const content = this.querySelector(`[${selector}-content]`);
		if (!(button instanceof HTMLButtonElement)) {
			throw new TypeError(
				`<${selector}> needs a <button>-element with the attribute '${selector}-button'`,
			);
		}
		if (!(content instanceof HTMLElement)) {
			throw new TypeError(
				`<${selector}> needs an element with the attribute '${selector}-content'`,
			);
		}
		this.button = button;
		this.content = content;
		button.hidden = false;
		content.hidden = true;
		let {id} = content;
		if (isNullableOrWhitespace(id)) {
			id = `palmer_disclosure_${++index}`;
		}
		button.setAttribute('aria-controls', id);
		button.setAttribute('aria-expanded', false);
		content.id = id;
		button.addEventListener(
			'click',
			_ => setExpanded(this, !this.open),
			getOptions(),
		);
		if (!this.open) {
			return;
		}
		content.hidden = false;
		setExpanded(this, true);
	}
	/**
	 * @param {string} name
	 * @param {string|null} newValue
	 */
	attributeChangedCallback(name, _, newValue) {
		if (name === 'open') {
			setExpanded(this, !(newValue === null || newValue === 'false'));
		}
	}
	hide() {
		setExpanded(this, false);
	}
	show() {
		setExpanded(this, true);
	}
	toggle() {
		setExpanded(this, !this.open);
	}
};
PalmerDisclosure.observedAttributes = ['open'];
customElements.define(selector, PalmerDisclosure);
export {PalmerDisclosure};
