import type { ComponentType, SvelteComponent } from 'svelte';
import { type INodeInterface, NodeInterfaceType, type NodeInterfaceComponent } from './node.ts';
import NumberInputInterface from '$lib/view/interface/NumberInputInterface.svelte';

abstract class NodeInterfaceBuilderMethods<Ty, Props> implements INodeInterface<Ty, Props> {
	abstract type: NodeInterfaceType<Ty>;
	title: string;
	hasPort: boolean = true;
	displayDefaultTitle: boolean = true;
	component?: NodeInterfaceComponent<Ty, Props> = undefined;
	value?: Ty = undefined;
	props: Props;
	hideWhenConnected: boolean = true;

	constructor(title: string, props: Props) {
		this.title = title;
		this.props = props;
	}

	setPort(hasPort: boolean) {
		this.hasPort = hasPort;
		return this;
	}

	hideDefaultTitle() {
		this.displayDefaultTitle = false;
		return this;
	}

	withComponent(component: NodeInterfaceComponent<Ty, Props>) {
		this.component = component;
		return this;
	}

	withDefaultValue(value: Ty) {
		this.value = value;
		return this;
	}
}

export class NodeInterface<Ty> extends NodeInterfaceBuilderMethods<Ty, {}> {
	type = new NodeInterfaceType<Ty>('');

	constructor(title: string) {
		super(title, {});
	}
}

export interface NumberInterfaceProps {
	min: number;
	max: number;
}
export class NumberInterface extends NodeInterfaceBuilderMethods<number, NumberInterfaceProps> {
	type = new NodeInterfaceType<number>('number');

	constructor(title: string) {
		super(title, {
			min: 0,
			max: 100
		});
		this.hideDefaultTitle().withComponent(NumberInputInterface).withDefaultValue(0);
	}
}
