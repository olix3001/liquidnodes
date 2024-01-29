import { type INodeInterface, NodeInterfaceType } from './node.ts';

abstract class NodeInterfaceBuilderMethods<Ty> implements INodeInterface<Ty> {
	abstract type: NodeInterfaceType<Ty>;
	title: string;
	hasPort: boolean = true;

	constructor(title: string) {
		this.title = title;
	}

	setPort(hasPort: boolean) {
		this.hasPort = hasPort;
	}
}

export class NodeInterface<Ty> extends NodeInterfaceBuilderMethods<Ty> {
	type = new NodeInterfaceType<Ty>('');

	constructor(title: string) {
		super(title);
	}
}

export class NumberInterface extends NodeInterfaceBuilderMethods<number> {
	type = new NodeInterfaceType<number>('number');

	constructor(title: string) {
		super(title);
	}
}
