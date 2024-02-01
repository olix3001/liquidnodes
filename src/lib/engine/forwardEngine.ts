import { FlowInterface, type Flow } from '$lib/core/interfaces.ts';
import type { IConnection, NodeUID } from '$lib/core/node.ts';
import type NodeTree from '$lib/core/nodeTree.ts';

class ForwardEngineFlow implements Flow {
	private readonly engine: ForwardEngine;
	private readonly target_node: NodeUID;

	constructor(engine: ForwardEngine, target_node: NodeUID) {
		this.engine = engine;
		this.target_node = target_node;
	}

	fire(output?: any): void {
		this.engine.runFromID(this.target_node, false);
	}
}

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

	setContext(context: any) {
		this.ctx = context;
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
			const flowConn = this.tree.getConnectionFromSource(current, '__flow_out');
			if (!flowConn) break;
			current = flowConn[1].target;
		}
	}

	runNode(node: NodeUID) {
		const deps = this.getNodeDependencies(node);
		// Run node dependencies
		for (let conn of Object.values(deps)) {
			if (!(conn.source in this.cachedOutputs)) {
				if (this.isNodeUsingFlow(conn.source)) {
					throw {
						node: conn.source,
						message: 'Node has not been run yet.'
					};
				}
				this.runNode(conn.source);
			}
		}

		// Get node and type
		const n = this.tree.nodes[node];
		const NODE = this.tree.getNodeType(n.type_id);

		// Assign inputs
		const inputs: { [key: string]: any } = {};
		for (let conn of Object.values(deps)) {
			const value = this.cachedOutputs[conn.source][conn.source_port];
			const sourceNode = this.tree.nodes[conn.source];
			const sourceInter = sourceNode.output_interfaces[conn.source_port];
			const targetInter = n.input_interfaces[conn.target_port];
			inputs[conn.target_port] = sourceInter.type.convertTo(targetInter.type, value);
		}
		// Custom flow outputs
		for (let [interID, inter] of Object.entries(n.output_interfaces)) {
			if (inter instanceof FlowInterface) {
				const target = this.tree.getConnectionFromSource(node, interID);
				if (target) {
					inputs[interID] = new ForwardEngineFlow(this, target[1].target);
				}
			}
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

	isNodeUsingFlow(node: NodeUID): boolean {
		const n = this.tree.nodes[node];
		const ty = this.tree.getNodeType(n.type_id);

		return ty.flow.hasFlowInput || ty.flow.hasFlowOutput;
	}

	getNodeDependencies(node: NodeUID) {
		const dependencies: { [key: string]: IConnection } = {};
		for (let [connID, conn] of Object.entries(this.tree.connections)) {
			if (conn.target_port == '__flow_in') continue; // Skip flow
			if (conn.target == node) dependencies[connID] = conn;
		}
		return dependencies;
	}
}
