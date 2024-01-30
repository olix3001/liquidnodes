import type { ComponentType, SvelteComponent, SvelteComponentTyped } from 'svelte';
import { type IPosition } from './common.js';
import type NodeTree from './nodeTree.ts';

export interface INodeInterface<Ty, Props> {
	type: NodeInterfaceType<Ty>;
	title: string;
	hasPort: boolean;
	displayDefaultTitle: boolean;
	component?: NodeInterfaceComponent<Ty, Props>;
	value?: Ty;
	props: Props;
	hideWhenConnected: boolean;
}
export type NodeInterfaceComponent<Ty, Props> = ComponentType<
	SvelteComponent<
		{
			tree: NodeTree;
			inter: INodeInterface<Ty, Props>;
		},
		{},
		{}
	>
>;

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
		[K in keyof Input]: () => INodeInterface<Input[K], any>;
	};
	outputs: {
		[K in keyof Output]: () => INodeInterface<Output[K], any>;
	};

	calculate(inputs: Input): Output;
}

export default class Node {
	public type_id: string;
	public position: IPosition;
	public input_interfaces: {
		[key: string]: INodeInterface<any, any>;
	} = {};
	public output_interfaces: {
		[key: string]: INodeInterface<any, any>;
	} = {};

	constructor(type_id: string, position?: IPosition) {
		this.type_id = type_id;
		this.position = position ?? { x: 0, y: 0 };
	}
}

export interface IConnection {
	source: NodeUID;
	source_port: string;
	target: NodeUID;
	target_port: string;
}

export type NodeUID = string;
