import { type IPosition } from './common.js';

export interface INodeInterface<Ty> {
	type: NodeInterfaceType<Ty>;
	title: string;
	hasPort: boolean;
}
export class NodeInterfaceType<Ty> {
	declare readonly _type: Ty;
	id: string;
	color: string = '#fff';

	constructor(id: string) {
		this.id = id;
	}
}

export interface INodeIO {
	[key: string]: any;
}
export interface INode<Input extends INodeIO, Output extends INodeIO> {
	category: string;
	id: string;
	title: string;
	description: string;
	inputs: {
		[K in keyof Input]: () => INodeInterface<Input[K]>;
	};
	outputs: {
		[K in keyof Output]: () => INodeInterface<Output[K]>;
	};

	calculate(inputs: Input): Output;
}

export default class Node {
	public type_id: string;
	public position: IPosition;

	constructor(type_id: string, position?: IPosition) {
		this.type_id = type_id;
		this.position = position ?? { x: 0, y: 0 };
	}
}

export interface IConnection {
	source: NodeUID;
	target: NodeUID;
}

export type NodeUID = string;
