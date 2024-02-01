import { Result, type IPosition } from './common.ts';
import { UpdateNodeEvent, type IEditorContext, EditorTickEvent } from './editor.ts';
import { type Flow, FlowInterface } from './interfaces.ts';
import Node, { FlowState, NewConnectionNodeEvent, RemoveConnectionNodeEvent } from './node.js';
import {
	type IConnection,
	type INode,
	type INodeIO,
	type INodeInterface,
	NodeUpdateEvent,
	type NodeUID
} from './node.js';
import { v4 as uuidv4 } from 'uuid';

export default class NodeTree {
	private registered_node_types: { [key: string]: INode<any, any, any> } = {};
	public nodes: { [key: NodeUID]: Node } = {};
	public connections: { [key: string]: IConnection } = {};
	public readonly categories: { [key: string]: string[] } = {};
	public readonly supportsFlow: boolean = true;
	private EDITOR_CONTEXT: IEditorContext | null = null;

	updateEditorContext(ctx: IEditorContext | null) {
		this.EDITOR_CONTEXT = ctx;
	}
	registerNodeType<I extends INodeIO, O extends INodeIO>(node: INode<I, O, any>) {
		if (!this.supportsFlow && node.flow != FlowState.NONE) {
			throw 'This node tree does not support flow';
		}
		this.registered_node_types[node.id] = node;
		if (!(node.category in this.categories)) {
			this.categories[node.category] = [];
		}
		this.categories[node.category].push(node.id);
	}

	getNodeType<I extends INodeIO = any, O extends INodeIO = any>(type: string): INode<I, O, any> {
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
		let node = new Node(uid, type, position);
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
		if (ty.onCreate) ty.onCreate(node, this);
		this.nodes[uid] = node;
		return Result.ok(uid);
	}

	connect(nodeA: NodeUID, portA: string, nodeB: NodeUID, portB: string) {
		// Do not allow cyclic connections
		if (nodeA == nodeB) return;
		// If this is input port ensure it is not yet connected,
		// and replace connection if it is
		if (this.hasConnection(nodeB, portB, false)) this.removeConnection(nodeB, portB, true);

		// Quick type check :D
		const A_inter = this.getInterface(nodeA, portA, true);
		const B_inter = this.getInterface(nodeB, portB, false);
		if (!A_inter.type.canConnectWith(B_inter.type)) return;

		let uid = uuidv4();
		const conn: IConnection = {
			source: nodeA,
			source_port: portA,
			target: nodeB,
			target_port: portB
		};
		const types = {
			out: A_inter.type,
			in: B_inter.type
		};
		if (
			!this.notifyNodeUpdate(
				nodeA,
				new NewConnectionNodeEvent(conn, true, conn.source_port, types)
			).isCancelled() &&
			!this.notifyNodeUpdate(
				nodeB,
				new NewConnectionNodeEvent(conn, false, conn.target_port, types)
			).isCancelled()
		)
			this.connections[uid] = conn;
	}

	hasConnection(node: NodeUID, inter: string, isOutput: boolean): boolean {
		return (
			Object.values(this.connections).find(
				(c) =>
					(isOutput && c.source == node && c.source_port == inter) ||
					(!isOutput && c.target == node && c.target_port == inter)
			) !== undefined
		);
	}

	removeConnection(node: NodeUID, inter: string, isOutput: boolean) {
		let connection = Object.entries(this.connections).find(
			(c) =>
				(isOutput && c[1].source == node && c[1].source_port == inter) ||
				(!isOutput && c[1].target == node && c[1].target_port == inter)
		);

		if (connection) {
			delete this.connections[connection[0]];
			if (
				this.notifyNodeUpdate(
					connection[1].source,
					new RemoveConnectionNodeEvent(connection[1], true, connection[1].source_port)
				).isCancelled() ||
				this.notifyNodeUpdate(
					connection[1].target,
					new RemoveConnectionNodeEvent(connection[1], false, connection[1].target_port)
				).isCancelled()
			) {
				this.connections[connection[0]] = connection[1];
			}

			return connection[1];
		}
		return null;
	}

	removeNode(node: NodeUID) {
		const n = this.nodes[node];
		if (!n) return;
		// Ensure it has no connections
		for (let inter of [
			...Object.keys(n.input_interfaces),
			...Object.keys(n.output_interfaces),
			'__flow_in',
			'__flow_out'
		]) {
			this.removeConnection(node, inter, true);
			this.removeConnection(node, inter, false);
		}

		// Remove node
		delete this.nodes[node];
	}

	notifyNodeUpdate(node: NodeUID, event: NodeUpdateEvent): NodeUpdateEvent {
		const n = this.nodes[node];
		const nTy = this.getNodeType(n.type_id);
		if (nTy?.onUpdate) {
			nTy.onUpdate(event, n, this);
		}
		return event;
	}

	getConnectionToTarget(node: NodeUID, port: string): [string, IConnection] | null {
		const conn = Object.entries(this.connections).find(
			(c) => c[1].target == node && c[1].target_port == port
		);

		if (!conn) return null;

		return conn;
	}

	getConnectionFromSource(node: NodeUID, port: string): [string, IConnection] | null {
		const conn = Object.entries(this.connections).find(
			(c) => c[1].source == node && c[1].source_port == port
		);

		if (!conn) return null;

		return conn;
	}
}
