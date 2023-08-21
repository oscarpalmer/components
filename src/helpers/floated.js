import {Repeated} from '@oscarpalmer/timer';
import {getTextDirection} from './index.js';

/**
 * @typedef AbsoluteParameters
 * @property {number} end
 * @property {number} max
 * @property {number} offset
 * @property {boolean} preferMin
 * @property {number} start
 */

/**
 * @typedef Elements
 * @property {HTMLElement} anchor
 * @property {HTMLElement} floater
 * @property {HTMLElement?} parent
 */

/**
 * @typedef ParametersPosition
 * @property {string} attribute
 * @property {string} defaultValue
 * @property {boolean} preferAbove
 */

/**
 * @typedef Rectangles
 * @property {DOMRect} anchor
 * @property {DOMRect} floater
 */

/**
 * @typedef Values
 * @property {number} left
 * @property {number} top
 */

const allPositions = [
	'above',
	'above-left',
	'above-right',
	'below',
	'below-left',
	'below-right',
	'horizontal',
	'horizontal-bottom',
	'horizontal-top',
	'left',
	'left-bottom',
	'left-top',
	'right',
	'right-bottom',
	'right-top',
	'vertical',
	'vertical-left',
	'vertical-right',
];

const domRectKeys = ['bottom', 'height', 'left', 'right', 'top', 'width'];

/**
 * @param {AbsoluteParameters} parameters
 * @returns {number}
 */
function getAbsolute(parameters) {
	const {end, max, offset, preferMin, start} = parameters;

	const maxPosition = end + offset;
	const minPosition = start - offset;

	if (preferMin) {
		if (minPosition >= 0) {
			return minPosition;
		}

		return maxPosition <= max ? end : minPosition;
	}

	if (maxPosition <= max) {
		return end;
	}

	return minPosition >= 0 ? minPosition : end;
}

/**
 * @param {string} position
 * @param {DOMRect} anchor
 * @param {Values} values
 * @returns {string}
 */
function getAttribute(position, anchor, values) {
	const {left, top} = values;

	switch (position) {
		case 'horizontal':
		case 'horizontal-bottom':
		case 'horizontal-top': {
			return position.replace(
				'horizontal',
				anchor.right - 1 < left && left < anchor.right + 1 ? 'right' : 'left',
			);
		}

		case 'vertical':
		case 'vertical-left':
		case 'vertical-right': {
			return position.replace(
				'vertical',
				anchor.bottom - 1 < top && top < anchor.bottom + 1 ? 'below' : 'above',
			);
		}

		default: {
			return position;
		}
	}
}

/**
 * @param {boolean} xAxis
 * @param {string} position
 * @param {Rectangles} rectangles
 * @param {boolean} parameters
 * @returns {number|undefined}
 */
function getCentered(xAxis, position, rectangles, preferMin) {
	const {anchor, floater} = rectangles;

	if (
		(xAxis
			? ['above', 'below', 'vertical']
			: ['horizontal', 'left', 'right']
		).includes(position)
	) {
		const offset = (xAxis ? anchor.width : anchor.height) / 2;
		const size = (xAxis ? floater.width : floater.height) / 2;

		return (xAxis ? anchor.left : anchor.top) + offset - size;
	}

	if (
		xAxis ? position.startsWith('horizontal') : position.startsWith('vertical')
	) {
		return getAbsolute({
			preferMin,
			end: xAxis ? anchor.right : anchor.bottom,
			max: xAxis ? innerWidth : innerHeight,
			offset: xAxis ? floater.width : floater.height,
			start: xAxis ? anchor.left : anchor.top,
		});
	}

	return undefined;
}

/**
 * @param {string} currentPosition
 * @param {string} defaultPosition
 * @returns {string}
 */
function getPosition(currentPosition, defaultPosition) {
	if (currentPosition === null) {
		return defaultPosition;
	}

	const normalized = currentPosition.trim().toLowerCase();

	const index = allPositions.indexOf(normalized);

	return index > -1 ? allPositions[index] ?? defaultPosition : defaultPosition;
}

/**
 * @param {boolean} xAxis
 * @param {string} position
 * @param {Rectangles} rectangles
 * @param {boolean} preferMin
 * @returns {number}
 */
function getValue(xAxis, position, rectangles, preferMin) {
	const {anchor, floater} = rectangles;

	if (xAxis ? position.startsWith('right') : position.endsWith('top')) {
		return xAxis ? anchor.right : anchor.top;
	}

	if (xAxis ? position.startsWith('left') : position.endsWith('bottom')) {
		return (
			(xAxis ? anchor.left : anchor.bottom) -
			(xAxis ? floater.width : floater.height)
		);
	}

	if (xAxis ? position.endsWith('right') : position.startsWith('above')) {
		return (
			(xAxis ? anchor.right : anchor.top) -
			(xAxis ? floater.width : floater.height)
		);
	}

	const centered = getCentered(xAxis, position, rectangles, preferMin);

	if (centered !== undefined) {
		return centered;
	}

	return xAxis ? anchor.left : anchor.bottom;
}

/**
 * @param {{elements: Elements; position: ParametersPosition;}} parameters
 * @returns {Repeated}
 */
export function updateFloated(parameters) {
	const {anchor, floater, parent} = parameters.elements;
	const {attribute, defaultValue, preferAbove} = parameters.position;

	const position = getPosition(
		(parent ?? anchor).getAttribute(attribute) ?? '',
		defaultValue,
	);

	const rightToLeft = getTextDirection(floater) === 'rtl';

	/** @type {DOMRect?} */
	let previous;

	function afterRepeat() {
		anchor.after(floater);
	}

	function onRepeat(step) {
		const rectangle = anchor.getBoundingClientRect();

		if (
			step > 10 &&
			domRectKeys.every(key => previous?.[key] === rectangle[key])
		) {
			return;
		}

		previous = rectangle;

		const rectangles = {
			anchor: rectangle,
			floater: floater.getBoundingClientRect(),
		};

		const values = {
			left: getValue(true, position, rectangles, rightToLeft),
			top: getValue(false, position, rectangles, preferAbove),
		};

		const matrix = `matrix(1, 0, 0, 1, ${values.left}, ${values.top})`;

		if (floater.style.transform === matrix) {
			return;
		}

		floater.setAttribute('position', getAttribute(position, anchor, values));

		floater.style.position = 'fixed';
		floater.style.inset = '0 auto auto 0';
		floater.style.transform = matrix;
	}

	document.body.append(floater);

	floater.hidden = false;

	return new Repeated(
		onRepeat,
		0,
		Number.POSITIVE_INFINITY,
		afterRepeat,
	).start();
}
