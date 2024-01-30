import { Result, type IPosition } from './common.ts';
import Node from './node.js';
import type { IConnection, INode, INodeIO, NodeUID } from './node.js';
import { v4 as uuidv4 } from 'uuid';

export default class NodeTree {
	private registered_node_types: { [key: string]: INode<any, any> } = {};
	public nodes: { [key: NodeUID]: Node } = {};
	public connections: { [key: string]: IConnection } = {};

	registerNodeType<I extends INodeIO, O extends INodeIO>(node: INode<I, O>) {
		this.registered_node_types[node.id] = node;
	}

	getNodeType<I extends INodeIO = any, O extends INodeIO = any>(type: string): INode<I, O> {
		return this.registered_node_types[type];
	}

	insertNodeAt(type: string, position: IPosition): Result<NodeUID, string> {
		if (!(type in this.registered_node_types)) {
			return Result.err(`Requested node type '${type}' does not exist.`);
		}
		let uid = uuidv4();
		let node = new Node(type, position);
		const ty = this.registered_node_types[type];
		for (let key of Object.keys(ty.inputs)) {
			node.input_interfaces[key] = ty.inputs[key]();
		}
		for (let key of Object.keys(ty.outputs)) {
			node.output_interfaces[key] = ty.outputs[key]();
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
