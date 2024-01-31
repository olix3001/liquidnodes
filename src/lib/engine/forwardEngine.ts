import type { IConnection, NodeUID } from '$lib/core/node.ts';
import type NodeTree from '$lib/core/nodeTree.ts';

export default class ForwardEngine {
	private tree: NodeTree;
	private ctx: any;
	private cachedOutputs: {
		[key: string]: { [key: string]: any };
	} = {};

	constructor(tree: NodeTree) {
		if (!tree.supportsFlow) throw 'Forward execution engine required flow to be enabled';
		this.tree = tree;
	}

	runFromType(type: string, runMultiple: boolean = true) {
		for (let [nodeID, node] of Object.entries(this.tree.nodes)) {
			if (node.type_id == type) {
				this.runFromID(nodeID);
				if (!runMultiple) break;
			}
		}
	}
	runFromID(node: NodeUID, clearCache: boolean = true) {
		if (clearCache) {
			this.cachedOutputs = {};
		}
		let current = node;
		while (true) {
			this.runNode(current);
			const flowConn = this.findConnectionFrom(current, '__flow_out');
			if (!flowConn) break;
			current = flowConn[1].target;
		}
	}

	runNode(node: NodeUID) {
		const deps = this.getNodeDependencies(node);
		// Run node dependencies
		for (let conn of Object.values(deps)) {
			if (!(conn.source in this.cachedOutputs)) this.runNode(conn.source);
		}

		// Get node and type
		const n = this.tree.nodes[node];
		const NODE = this.tree.getNodeType(n.type_id);

		// Assign inputs
		// TODO: Custom flow inputs (fake outputs)
		const inputs: { [key: string]: any } = {};
		for (let conn of Object.values(deps)) {
			const value = this.cachedOutputs[conn.source][conn.source_port];
			const sourceNode = this.tree.nodes[conn.source];
			const sourceInter = sourceNode.output_interfaces[conn.source_port];
			const targetInter = n.input_interfaces[conn.target_port];
			inputs[conn.target_port] = sourceInter.type.convertTo(targetInter.type, value);
		}
		// Use default values for all non-connected interfaces
		for (let [interID, inter] of Object.entries(n.input_interfaces)) {
			if (!(interID in inputs)) {
				inputs[interID] = inter.value ?? null;
			}
		}

		// Run itself
		const result = NODE.calculate(inputs, this.ctx);
		this.cachedOutputs[node] = result;
	}

	getNodeDependencies(node: NodeUID) {
		const dependencies: { [key: string]: IConnection } = {};
		for (let [connID, conn] of Object.entries(this.tree.connections)) {
			if (conn.target_port == '__flow_in') continue; // Skip flow
			if (conn.target == node) dependencies[connID] = conn;
		}
		return dependencies;
	}

	findConnectionFrom(node: NodeUID, port: string): [string, IConnection] | null {
		for (let [connID, conn] of Object.entries(this.tree.connections)) {
			if (conn.source == node && conn.source_port == port) return [connID, conn];
		}
		return null;
	}
}
