import type Node from './node.js';
import type { IConnection, INode, NodeUID } from './node.js';

export default class NodeTree {
	registered_node_types: { [key: string]: INode<any, any> } = {};
	nodes: { [key: NodeUID]: Node } = {};
	connections: IConnection[] = [];
}
