/**
 * @param {MouseEvent|TouchEvent} event
 * @returns {{x: number; y: number}|undefined}
 */
export function getCoordinates(event) {
	if (event instanceof MouseEvent) {
		return {
			x: event.clientX,
			y: event.clientY,
		};
	}

	const x = event.touches[0]?.clientX;
	const y = event.touches[0]?.clientY;

	return typeof x === 'number' && typeof y === 'number' ? {x, y} : undefined;
}

/**
 * @param {boolean|undefined} passive
 * @param {boolean|undefined} capture
 * @returns {AddEventListenerOptions}
 */
export function getOptions(passive, capture) {
	return {
		capture: capture ?? false,
		passive: passive ?? true,
	};
}
