import type { ComponentType, SvelteComponent, SvelteComponentTyped } from 'svelte';
import { type IPosition } from './common.js';
import type NodeTree from './nodeTree.ts';
import { NodeInterface, type Flow } from './interfaces.ts';
import type { Writable } from 'svelte/store';

export class NodeUpdateEvent {
	private _isCancelled: boolean = false;

	cancel() {
		this._isCancelled = true;
	}
	isCancelled() {
		return this._isCancelled;
	}
}
export class NewConnectionNodeEvent extends NodeUpdateEvent {
	public readonly isOutgoing: boolean;
	public readonly connection: IConnection;
	public readonly types: {
		in: NodeInterfaceType<any>;
		out: NodeInterfaceType<any>;
	};
	public readonly port: string;

	constructor(
		connection: IConnection,
		isOutput: boolean,
		port: string,
		types: {
			in: NodeInterfaceType<any>;
			out: NodeInterfaceType<any>;
		}
	) {
		super();
		this.connection = connection;
		this.isOutgoing = isOutput;
		this.port = port;
		this.types = types;
	}
}
export class RemoveConnectionNodeEvent extends NodeUpdateEvent {
	public readonly isOutgoing: boolean;
	public readonly port: string;
	public readonly connection: IConnection;

	constructor(connection: IConnection, isOutput: boolean, port: string) {
		super();
		this.isOutgoing = isOutput;
		this.connection = connection;
		this.port = port;
	}
}
export class ChangeInterfaceValueNodeEvent<T> extends NodeUpdateEvent {
	public readonly oldValue?: T;
	public readonly newValue: T;
	public readonly isOutputPort: boolean;
	public readonly port: string;
	public readonly inter: INodeInterface<T, any>;

	constructor(data: {
		oldValue?: T;
		newValue: T;
		isOutput: boolean;
		port: string;
		inter: INodeInterface<T, any>;
	}) {
		super();
		this.oldValue = data.oldValue;
		this.newValue = data.newValue;
		this.isOutputPort = data.isOutput;
		this.port = data.port;
		this.inter = data.inter;
	}
}

export class InterfaceNodeEvent<T> extends NodeUpdateEvent {
	public readonly data: T;
	public readonly isOutputPort: boolean;
	public readonly port: string;
	public readonly inter: INodeInterface<any, any>;
	public readonly type: string;

	constructor(data: {
		data: T;
		isOutput: boolean;
		port: string;
		inter: INodeInterface<any, any>;
		type: string;
	}) {
		super();
		this.data = data.data;
		this.isOutputPort = data.isOutput;
		this.port = data.port;
		this.inter = data.inter;
		this.type = data.type;
	}
}

export interface IInterfaceInfo {
	isOutput: boolean;
	name: string;
}
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
			node: NodeUID;
			info: IInterfaceInfo;
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

	removeConversion(type_id: string) {
		delete this.conversions[type_id];
	}

	canConnectWith<OT>(target: NodeInterfaceType<OT>): boolean {
		return this.canConnectWithID(target.id);
	}
	canConnectWithID(target: string): boolean {
		if (this.id == target) return true;
		if (target == 'ANY') return true;
		if (this.conversions['ANY']) return true;
		if (this.conversions[target]) return true;
		return false;
	}

	convertTo<OT>(target: NodeInterfaceType<OT>, value: Ty): OT {
		return this.convertToID(target.id, value) as OT;
	}
	convertToID(target: string, value: Ty): any {
		if (this.id == target) return value;
		if (target == 'ANY') return value;
		if (this.conversions[target]) return this.conversions[target](value);
		if (this.conversions['ANY']) return value;
		return null;
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
export interface INode<Input extends INodeIO, Output extends INodeIO, Ctx = {}> {
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

	onCreate?(node: Node, tree: NodeTree): void;
	onUpdate?(event: NodeUpdateEvent, node: Node, tree: NodeTree): void;
	calculate(inputs: Input, context?: Ctx): Output;
}

export function defineNode(
	data: {
		category: string;
		id: string;
		title: string;
		description: string;
		flow?: FlowState;
		inputs?: {
			[key: string]: () => INodeInterface<any, any>;
		};
		outputs?: {
			[key: string]: () => INodeInterface<any, any>;
		};
		onCreate?(node: Node, tree: NodeTree): void;
		onUpdate?(event: NodeUpdateEvent, node: Node, tree: NodeTree): void;
	},
	calculate?: (inputs: { [key: string]: any }, ctx: any) => { [key: string]: any }
): new () => INode<any, any> {
	const mynodeclass = class MyNodeClass implements INode<any, any> {
		category = data.category;
		id = data.id;
		title = data.title;
		description = data.description;
		flow = data.flow ?? FlowState.NONE;

		inputs = data.inputs ?? {};
		outputs = data.outputs ?? {};
		onCreate = data.onCreate;
		onUpdate = data.onUpdate;

		calculate = calculate ?? (() => ({}));
	};
	// Object.defineProperty(mynodeclass.constructor, 'name', `NodeType_${data.id}`);
	return mynodeclass;
}

export default class Node {
	public readonly id;
	public readonly type_id: string;
	public position: IPosition;
	public input_interfaces: {
		[key: string]: INodeInterface<any, any>;
	} = {};
	public output_interfaces: {
		[key: string]: INodeInterface<any, any>;
	} = {};
	public flow_in_interface: INodeInterface<Flow, {}> | null = null;
	public flow_out_interface: INodeInterface<Flow, {}> | null = null;
	public data: { [key: string]: any } = {};

	constructor(id: NodeUID, type_id: string, position?: IPosition) {
		this.id = id;
		this.type_id = type_id;
		this.position = position ?? { x: 0, y: 0 };
	}

	public addInputInterface(name: string, inter: INodeInterface<any, any>) {
		this.input_interfaces[name] = inter;
	}
	public addOutputInterface(name: string, inter: INodeInterface<any, any>) {
		this.output_interfaces[name] = inter;
	}
	public addInputInterfaces(interfaces: { [key: string]: INodeInterface<any, any> }) {
		for (let [interID, inter] of Object.entries(interfaces)) {
			this.input_interfaces[interID] = inter;
		}
	}
	public addOutputInterfaces(interfaces: { [key: string]: INodeInterface<any, any> }) {
		for (let [interID, inter] of Object.entries(interfaces)) {
			this.output_interfaces[interID] = inter;
		}
	}

	public removeInputInterfaces(tree: NodeTree, interfaces: string[]) {
		for (let inter of interfaces) {
			if (tree.hasConnection(this.id, inter, false)) {
				tree.removeConnection(this.id, inter, false);
			}

			delete this.input_interfaces[inter];
		}
	}
	public removeOutputInterfaces(tree: NodeTree, interfaces: string[]) {
		for (let inter of interfaces) {
			if (tree.hasConnection(this.id, inter, true)) {
				tree.removeConnection(this.id, inter, true);
			}

			delete this.output_interfaces[inter];
		}
	}
	public retainInputs(tree: NodeTree, interfaces: string[]) {
		for (let inter of Object.keys(this.input_interfaces)) {
			if (!interfaces.includes(inter)) {
				if (tree.hasConnection(this.id, inter, false)) {
					tree.removeConnection(this.id, inter, false);
				}

				delete this.input_interfaces[inter];
			}
		}
	}

	public changeNIType<Ty>(
		tree: NodeTree,
		inter: string,
		new_type: NodeInterfaceType<Ty>,
		isOutput: boolean,
		removeInvalid: boolean = true
	) {
		const INTER = isOutput ? this.output_interfaces[inter] : this.input_interfaces[inter];
		if (!(INTER instanceof NodeInterface)) return;
		// Check if this connection would still be valid and remove invalid connections
		if (removeInvalid) {
			const conn = isOutput
				? tree.getConnectionFromSource(this.id, inter)
				: tree.getConnectionToTarget(this.id, inter);
			if (conn) {
				if (!isOutput) {
					const source = tree.getInterface(conn[1].source, conn[1].source_port, true);
					if (!source.type.canConnectWith(new_type)) {
						tree.removeConnection(this.id, inter, isOutput);
					}
				} else {
					const target = tree.getInterface(conn[1].target, conn[1].target_port, false);
					if (!new_type.canConnectWith(target.type)) {
						tree.removeConnection(this.id, inter, isOutput);
					}
				}
			}
		}

		INTER.type = new_type;
	}
	public changeInputNIType<Ty>(
		tree: NodeTree,
		inter: string,
		new_type: NodeInterfaceType<Ty>,
		removeInvalid: boolean = true
	) {
		this.changeNIType(tree, inter, new_type, false, removeInvalid);
	}
	public changeOutputNIType<Ty>(
		tree: NodeTree,
		inter: string,
		new_type: NodeInterfaceType<Ty>,
		removeInvalid: boolean = true
	) {
		this.changeNIType(tree, inter, new_type, true, removeInvalid);
	}

	public getInputInterface(inter: string): INodeInterface<any, any> {
		return this.input_interfaces[inter];
	}
	public getOutputInterface(inter: string): INodeInterface<any, any> {
		return this.output_interfaces[inter];
	}
}

export interface IConnection {
	source: NodeUID;
	source_port: string;
	target: NodeUID;
	target_port: string;
}

export type NodeUID = string;
