export const isTouchy = (() => {
	let value = false;

	try {
		if ('matchMedia' in window) {
			const media = matchMedia('(pointer: coarse)');

			if (typeof media?.matches === 'boolean') {
				value = media.matches;
			}
		}

		if (!value) {
			value =
				'ontouchstart' in window
				|| navigator.maxTouchPoints > 0
				|| (navigator.msMaxTouchPoints ?? 0) > 0;
		}
	}
	catch {
		value = false;
	}

	return value;
})();

export const methods = {
	begin: isTouchy ? 'touchstart' : 'mousedown',
	end: isTouchy ? 'touchend' : 'mouseup',
	move: isTouchy ? 'touchmove' : 'mousemove',
};
