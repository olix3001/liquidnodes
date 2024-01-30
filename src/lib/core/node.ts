import type { ComponentType, SvelteComponent, SvelteComponentTyped } from 'svelte';
import { type IPosition } from './common.js';
import type NodeTree from './nodeTree.ts';
import type { Flow } from './interfaces.ts';

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
	private conversions: { [key: string]: (value: Ty) => any } = {};

	constructor(id: string) {
		this.id = id;
	}

	withColor(color: string) {
		this.color = color;
		return this;
	}

	addConversionUnsafe(type: string, f: (value: Ty) => any) {
		this.conversions[type] = f;
		return this;
	}
	addConversion<OT>(type: NodeInterfaceType<OT>, f: (value: Ty) => OT) {
		this.addConversionUnsafe(type.id, f);
		return this;
	}

	canConnectWith<OT>(target: NodeInterfaceType<OT>): boolean {
		return this.canConnectWithID(target.id);
	}
	canConnectWithID(target: string): boolean {
		if (this.id == target) return true;
		if (this.conversions['ANY']) return true;
		if (this.conversions[target]) return true;
		return false;
	}
}

export interface INodeIO {
	[key: string]: any;
}

export class FlowState {
	public static readonly IN_OUT = new FlowState(true, true);
	public static readonly IN = new FlowState(true, false);
	public static readonly OUT = new FlowState(false, true);
	public static readonly NONE = new FlowState(false, false);

	hasFlowInput: boolean;
	hasFlowOutput: boolean;

	constructor(hasFlowInput: boolean, hasFlowOutput: boolean) {
		this.hasFlowInput = hasFlowInput;
		this.hasFlowOutput = hasFlowOutput;
	}
}
export interface INode<Input extends INodeIO, Output extends INodeIO> {
	category: string;
	id: string;
	title: string;
	description: string;
	flow: FlowState;
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
	public flow_in_interface: INodeInterface<Flow, {}> | null = null;
	public flow_out_interface: INodeInterface<Flow, {}> | null = null;

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
