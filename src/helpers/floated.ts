import {delay} from '.';

export type Coordinate = {
	left: number;
	top: number;
};

type Elements = {
	anchor: HTMLElement;
	floater: HTMLElement;
	parent?: HTMLElement;
};

export type Position = {
	coordinate: Coordinate;
	type: string;
};

export type Types = {
	all: string[];
	default: string;
};

export type Rects = {
	anchor: DOMRect;
	floater: DOMRect;
	parent?: DOMRect;
};

export class Floated {
	static update(
		elements: Elements,
		types: Types,
		getPosition: (type: string, elements: Rects) => Position,
		stopUpdate: () => boolean,
	): void {
		const {anchor, floater, parent} = elements;

		function step() {
			if (stopUpdate()) {
				return;
			}

			const type = Floated.getType(parent ?? anchor, types);

			const position = getPosition(type, {
				anchor: anchor.getBoundingClientRect(),
				floater: floater.getBoundingClientRect(),
				parent: parent?.getBoundingClientRect(),
			});

			Floated.setPosition(floater, position);

			delay(step);
		}

		delay(step);
	}

	private static getType(element: HTMLElement, types: Types): string {
		const position = element.getAttribute('position');
		const normalized = position?.trim().toLowerCase();

		return normalized != null && types.all.includes(normalized)
			? normalized
			: types.default;
	}

	private static setPosition(floater: HTMLElement, position: Position): void {
		const {left, top} = position.coordinate;

		floater.setAttribute('position', position.type);

		floater.style.inset = '0 auto auto 0';
		floater.style.position = 'fixed';
		floater.style.transform = `translate3d(${left}px, ${top}px, 0)`;

		if (floater.hidden) {
			delay(() => {
				floater.hidden = false;
			});
		}
	}
}
