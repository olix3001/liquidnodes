import type { NodeUID } from './node.ts';

export const EDITOR_CONTEXT = Symbol();
export interface IEditorContext {
	nodes: { [key: string]: HTMLDivElement };
	ports: { [key: string]: HTMLDivElement };
	currently_held: ICurrentlyHeldConnection | null;
}

export interface IPortPositions {
	sx: number;
	sy: number;
	tx: number;
	ty: number;
}

export function getPortPositions(
	source: HTMLElement | CustomRectPosition | undefined,
	target: HTMLElement | CustomRectPosition | undefined
): IPortPositions | null {
	if (!source || !target) {
		return null;
	}
	const source_rect = source.getBoundingClientRect();
	const target_rect = target.getBoundingClientRect();

	const source_center = {
		x: source_rect.left + source_rect.width / 2,
		y: source_rect.top + source_rect.height / 2
	};
	const target_center = {
		x: target_rect.left + target_rect.width / 2,
		y: target_rect.top + target_rect.height / 2
	};
	return {
		sx: source_center.x,
		sy: source_center.y,
		tx: target_center.x,
		ty: target_center.y
	};
}

export function createConnectionSplinePath(positions: IPortPositions): string | null {
	return `M ${positions.sx} ${positions.sy} \
    C ${positions.sx + 100} ${positions.sy} \
    ${positions.tx - 100} ${positions.ty} \
    ${positions.tx} ${positions.ty}`;
}

export class NodeMoveEvent extends Event {
	constructor() {
		super('node_move');
	}
}
export class EditorTickEvent extends Event {
	constructor() {
		super('editor_tick', {
			bubbles: true,
			cancelable: true
		});
	}
}

export interface ICurrentlyHeldConnection {
	node: NodeUID;
	port: string;
	isOutput: boolean;
}

export class CustomRectPosition {
	left: number;
	top: number;

	constructor(left: number = 0, top: number = 0) {
		this.left = left;
		this.top = top;
	}

	getBoundingClientRect() {
		return {
			left: this.left,
			top: this.top,
			width: 1,
			height: 1
		};
	}
}
