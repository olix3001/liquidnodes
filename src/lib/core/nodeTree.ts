import { Result, type IPosition } from './common.ts';
import { Flow, FlowInterface } from './interfaces.ts';
import Node, { FlowState } from './node.js';
import type { IConnection, INode, INodeIO, INodeInterface, NodeUID } from './node.js';
import { v4 as uuidv4 } from 'uuid';

export default class NodeTree {
	private registered_node_types: { [key: string]: INode<any, any> } = {};
	public nodes: { [key: NodeUID]: Node } = {};
	public connections: { [key: string]: IConnection } = {};
	public readonly categories: { [key: string]: string[] } = {};
	public readonly supportsFlow: boolean = true;

	registerNodeType<I extends INodeIO, O extends INodeIO>(node: INode<I, O>) {
		if (!this.supportsFlow && node.flow != FlowState.NONE) {
			throw 'This node tree does not support flow';
		}
		this.registered_node_types[node.id] = node;
		if (!(node.category in this.categories)) {
			this.categories[node.category] = [];
		}
		this.categories[node.category].push(node.id);
	}

	getNodeType<I extends INodeIO = any, O extends INodeIO = any>(type: string): INode<I, O> {
		return this.registered_node_types[type];
	}

	getInterface(node: NodeUID, inter: string, isOutput: boolean): INodeInterface<any, any> {
		const n = this.nodes[node];
		if (isOutput) {
			if (inter == '__flow_out') return n.flow_out_interface as INodeInterface<Flow, {}>;
			return n.output_interfaces[inter];
		} else {
			if (inter == '__flow_in') return n.flow_in_interface as INodeInterface<Flow, {}>;
			return n.input_interfaces[inter];
		}
	}

	insertNodeAt(type: string, position: IPosition): Result<NodeUID, string> {
		if (!(type in this.registered_node_types)) {
			return Result.err(`Requested node type '${type}' does not exist.`);
		}
		let uid = uuidv4();
		let node = new Node(type, position);
		const ty = this.registered_node_types[type];
		for (let key of Object.keys(ty.inputs)) {
			const i = ty.inputs[key]();
			if (i instanceof FlowInterface) {
				node.output_interfaces[key] = i;
			} else {
				node.input_interfaces[key] = i;
			}
		}
		for (let key of Object.keys(ty.outputs)) {
			node.output_interfaces[key] = ty.outputs[key]();
		}
		if (ty.flow.hasFlowInput) {
			node.flow_in_interface = new FlowInterface('<flow_in>').alwaysHide();
		}
		if (ty.flow.hasFlowOutput) {
			node.flow_out_interface = new FlowInterface('<flow_out>').alwaysHide();
		}
		this.nodes[uid] = node;
		return Result.ok(uid);
	}

	connect(nodeA: NodeUID, portA: string, nodeB: NodeUID, portB: string) {
		// Do not allow cyclic connections
		if (nodeA == nodeB) return;
		// If this is input port ensure it is not yet connected,
		// and replace connection if it is
		if (this.hasConnection(nodeB, portB)) this.removeConnection(nodeB, portB);

		// Quick type check :D
		const A_inter = this.getInterface(nodeA, portA, true);
		const B_inter = this.getInterface(nodeB, portB, false);
		if (!A_inter.type.canConnectWith(B_inter.type)) return;

		let uid = uuidv4();
		this.connections[uid] = {
			source: nodeA,
			source_port: portA,
			target: nodeB,
			target_port: portB
		};
	}

	hasConnection(node: NodeUID, inter: string): boolean {
		return !!Object.values(this.connections).find(
			(c) =>
				(c.source == node && c.source_port == inter) || (c.target == node && c.target_port == inter)
		);
	}

	removeConnection(node: NodeUID, inter: string) {
		let connection = Object.entries(this.connections).find(
			(c) =>
				(c[1].source == node && c[1].source_port == inter) ||
				(c[1].target == node && c[1].target_port == inter)
		);

		if (connection) {
			delete this.connections[connection[0]];
			return connection[1];
		}
		return null;
	}
}
