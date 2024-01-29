import type { IPosition } from './common.ts';
import Node from './node.js';
import type { IConnection, INode, INodeIO, NodeUID } from './node.js';
import { v4 as uuidv4 } from 'uuid';

export default class NodeTree {
	private registered_node_types: { [key: string]: INode<any, any> } = {};
	public nodes: { [key: NodeUID]: Node } = {};
	public connections: IConnection[] = [];

	registerNodeType<I extends INodeIO, O extends INodeIO>(node: INode<I, O>) {
		this.registered_node_types[node.id] = node;
	}

	getNodeType<I extends INodeIO = any, O extends INodeIO = any>(type: string): INode<I, O> {
		return this.registered_node_types[type];
	}

	insertNodeAt(type: string, position: IPosition): string {
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
		return uid;
	}
}
