// node_modules/@oscarpalmer/timer/dist/timer.js
var milliseconds = Math.round(1e3 / 60);
var request =
	requestAnimationFrame ??
	function (callback) {
		return setTimeout?.(() => {
			callback(Date.now());
		}, milliseconds);
	};
function run(timed) {
	timed.state.active = true;
	timed.state.finished = false;
	const isRepeated = timed instanceof Repeated;
	let index = 0;
	let start;
	function step(timestamp) {
		if (!timed.state.active) {
			return;
		}
		start ?? (start = timestamp);
		const elapsed = timestamp - start;
		const elapsedMinimum = elapsed - milliseconds;
		const elapsedMaximum = elapsed + milliseconds;
		if (
			elapsedMinimum < timed.configuration.time &&
			timed.configuration.time < elapsedMaximum
		) {
			if (timed.state.active) {
				timed.callbacks.default(isRepeated ? index : void 0);
			}
			index += 1;
			if (isRepeated && index < timed.configuration.count) {
				start = void 0;
			} else {
				timed.state.finished = true;
				timed.stop();
				return;
			}
		}
		timed.state.frame = request(step);
	}
	timed.state.frame = request(step);
}
var Timed = class {
	get active() {
		return this.state.active;
	}
	get finished() {
		return !this.active && this.state.finished;
	}
	/**
	 * @param {RepeatedCallback} callback
	 * @param {number} time
	 * @param {number} count
	 * @param {AfterCallback|undefined} afterCallback
	 */
	constructor(callback, time, count, afterCallback) {
		const isRepeated = this instanceof Repeated;
		const type = isRepeated ? 'repeated' : 'waited';
		if (typeof callback !== 'function') {
			throw new TypeError(`A ${type} timer must have a callback function`);
		}
		if (typeof time !== 'number' || time < 0) {
			throw new TypeError(
				`A ${type} timer must have a non-negative number as its time`,
			);
		}
		if (isRepeated && (typeof count !== 'number' || count < 2)) {
			throw new TypeError(
				'A repeated timer must have a number above 1 as its repeat count',
			);
		}
		if (
			isRepeated &&
			afterCallback !== void 0 &&
			typeof afterCallback !== 'function'
		) {
			throw new TypeError(
				"A repeated timer's after-callback must be a function",
			);
		}
		this.configuration = {count, time};
		this.callbacks = {
			after: afterCallback,
			default: callback,
		};
		this.state = {
			active: false,
			finished: false,
			frame: null,
		};
	}
	restart() {
		this.stop();
		run(this);
		return this;
	}
	start() {
		if (!this.state.active) {
			run(this);
		}
		return this;
	}
	stop() {
		this.state.active = false;
		if (this.state.frame === void 0) {
			return this;
		}
		(cancelAnimationFrame ?? clearTimeout)?.(this.state.frame);
		this.callbacks.after?.(this.finished);
		this.state.frame = void 0;
		return this;
	}
};
var Repeated = class extends Timed {};
var Waited = class extends Timed {
	/**
	 * @param {Function} callback
	 * @param {number} time
	 */
	constructor(callback, time) {
		super(callback, time, 1, null);
	}
};
function wait(callback, time) {
	return new Waited(callback, time).start();
}

// src/helpers/index.js
function findParent(element, match, includeOriginal) {
	const matchIsSelector = typeof match === 'string';
	if (
		(includeOriginal ?? true) &&
		(matchIsSelector ? element.matches(match) : match(element))
	) {
		return element;
	}
	let parent = element?.parentElement;
	while (parent !== null) {
		if (parent === document.body) {
			return void 0;
		}
		if (matchIsSelector ? parent.matches(match) : match(parent)) {
			break;
		}
		parent = parent.parentElement;
	}
	return parent ?? void 0;
}

// src/helpers/event.js
function getOptions(passive, capture) {
	return {
		capture: capture ?? false,
		passive: passive ?? true,
	};
}

// src/helpers/focusable.js
var filters = [isDisabled, isNotTabbable, isInert, isHidden, isSummarised];
var selector = [
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]:not(slot)',
	'a[href]',
	'audio[controls]',
	'button',
	'details',
	'details > summary:first-of-type',
	'iframe',
	'input',
	'select',
	'textarea',
	'video[controls]',
]
	.map(selector3 => `${selector3}:not([inert])`)
	.join(',');
function getFocusableElements(element) {
	const items = Array.from(element.querySelectorAll(selector))
		.map(element2 => ({element: element2, tabIndex: getTabIndex(element2)}))
		.filter(item => isFocusableFilter(item));
	const indiced = [];
	for (const item of items) {
		if (indiced[item.tabIndex] === void 0) {
			indiced[item.tabIndex] = [item.element];
		} else {
			indiced[item.tabIndex].push(item.element);
		}
	}
	return indiced.flat();
}
function getTabIndex(element) {
	if (element.tabIndex > -1) {
		return element.tabIndex;
	}
	if (/^(audio|details|video)$/i.test(element.tagName) || isEditable(element)) {
		return hasTabIndex(element) ? -1 : 0;
	}
	return -1;
}
function hasTabIndex(element) {
	return !Number.isNaN(Number.parseInt(element.getAttribute('tabindex'), 10));
}
function isDisabled(item) {
	if (
		/^(button|input|select|textarea)$/i.test(item.element.tagName) &&
		isDisabledFromFieldset(item.element)
	) {
		return true;
	}
	return (
		(item.element.disabled ?? false) ||
		item.element.getAttribute('aria-disabled') === 'true'
	);
}
function isDisabledFromFieldset(element) {
	let parent = element.parentElement;
	while (parent !== null) {
		if (/^fieldset$/i.test(parent.tagName) && parent.disabled) {
			const children = Array.from(parent.children);
			for (const child of children) {
				if (/^legend$/i.test(child.tagName)) {
					return parent.matches('fieldset[disabled] *')
						? true
						: !child.contains(element);
				}
			}
			return true;
		}
		parent = parent.parentElement;
	}
	return false;
}
function isEditable(element) {
	return /^(|true)$/i.test(element.getAttribute('contenteditable'));
}
function isFocusableFilter(item) {
	return !filters.some(callback => callback(item));
}
function isHidden(item) {
	if (
		item.element.hidden ||
		(item.element instanceof HTMLInputElement && item.element.type === 'hidden')
	) {
		return true;
	}
	const style = getComputedStyle(item.element);
	if (style.display === 'none' || style.visibility === 'hidden') {
		return true;
	}
	const {height, width} = item.element.getBoundingClientRect();
	return height === 0 && width === 0;
}
function isInert(item) {
	return (
		(item.element.inert ?? false) ||
		/^(|true)$/i.test(item.element.getAttribute('inert')) ||
		(item.element.parentElement !== null &&
			isInert({element: item.element.parentElement}))
	);
}
function isNotTabbable(item) {
	return item.tabIndex < 0;
}
function isSummarised(item) {
	return (
		/^details$/i.test(item.element.tagName) &&
		Array.from(item.element.children).some(child =>
			/^summary$/i.test(child.tagName),
		)
	);
}

// src/focus-trap.js
var selector2 = 'palmer-focus-trap';
var store = /* @__PURE__ */ new WeakMap();
function create(element) {
	if (!store.has(element)) {
		store.set(element, new FocusTrap(element));
	}
}
function destroy(element) {
	const focusTrap = store.get(element);
	if (focusTrap === void 0) {
		return;
	}
	element.tabIndex = focusTrap.tabIndex;
	store.delete(element);
}
function handleEvent(event, focusTrap, element) {
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
function observe(records) {
	for (const record of records) {
		if (record.type !== 'attributes') {
			continue;
		}
		if (record.target.getAttribute(selector2) === void 0) {
			destroy(record.target);
		} else {
			create(record.target);
		}
	}
}
function onKeydown(event) {
	if (event.key !== 'Tab') {
		return;
	}
	const focusTrap = findParent(event.target, `[${selector2}]`);
	if (focusTrap === void 0) {
		return;
	}
	event.preventDefault();
	event.stopImmediatePropagation();
	handleEvent(event, focusTrap, event.target);
}
var FocusTrap = class {
	/**
	 * @param {HTMLElement} element
	 */
	constructor(element) {
		this.tabIndex = element.tabIndex;
		element.tabIndex = -1;
	}
};
var observer = new MutationObserver(observe);
observer.observe(document, {
	attributeFilter: [selector2],
	attributeOldValue: true,
	attributes: true,
	childList: true,
	subtree: true,
});
wait(() => {
	const elements = Array.from(document.querySelectorAll(`[${selector2}]`));
	for (const element of elements) {
		element.setAttribute(selector2, '');
	}
}, 0);
document.addEventListener('keydown', onKeydown, getOptions(false));
export {selector2 as selector};
