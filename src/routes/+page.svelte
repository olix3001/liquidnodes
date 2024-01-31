<script lang="ts">
	import Editor from '$lib/view/Editor.svelte';
	import NodeTree from '$lib/core/nodeTree.ts';
	import { FlowState, type INode, type INodeInterface } from '$lib/core/node.ts';
	import '$lib/style/defaultEditorStyle.css';
	import {
		BaseTypes,
		Flow,
		FlowInterface,
		NodeInterface,
		NumberInterface
	} from '$lib/core/interfaces.ts';
	import ForwardEngine from '$lib/engine/forwardEngine.ts';

	let tree = new NodeTree();

	class GreaterThanNode
		implements
			INode<
				{
					a: number;
					b: number;
					trueF: Flow;
					falseF: Flow;
				},
				{}
			>
	{
		category = 'Comparison';
		id = 'greaterthan';
		title = 'Greater Than';
		description = 'Check if a > b.';
		flow = FlowState.IN;
		inputs = {
			a: () => new NumberInterface('A'),
			b: () => new NumberInterface('B'),
			trueF: () => new FlowInterface('True'),
			falseF: () => new FlowInterface('False')
		};
		outputs = {};

		calculate({ a, b, trueF, falseF }: { a: number; b: number; trueF: Flow; falseF: Flow }): {} {
			if (a > b) {
				trueF.fire();
			} else {
				falseF.fire();
			}
			return {};
		}
	}

	class AddNode
		implements
			INode<
				{
					a: number;
					b: number;
				},
				{
					result: number;
				}
			>
	{
		category = 'Math';
		id = 'addition';
		title = 'Add';
		description = 'Add two numbers together.';
		flow = FlowState.NONE;
		inputs = {
			a: () => new NumberInterface('Number'),
			b: () => new NumberInterface('Number')
		};
		outputs = {
			result: () => new NodeInterface<number>('Result', BaseTypes.NUMBER)
		};

		calculate({ a, b }: { a: number; b: number }): { result: number } {
			return {
				result: a + b
			};
		}
	}

	class ConsoleLogNode
		implements
			INode<
				{
					value: any;
				},
				{}
			>
	{
		category = 'Util';
		id = 'consolelog';
		title = 'Debug Print';
		description = 'Prints value to the debug console.';
		flow = FlowState.IN_OUT;
		inputs = {
			value: () => new NodeInterface('Value', BaseTypes.ANY)
		};
		outputs = {};
		calculate({ value }: { value: any }): {} {
			console.log(value);
			return {};
		}
	}

	class StartNode implements INode<{}, {}> {
		category = 'Flow';
		id = 'start';
		title = 'Start';
		description = 'Entry point for your program';
		flow = FlowState.OUT;
		inputs = {};
		outputs = {};
		calculate(inputs: {}): {} {
			return {};
		}
	}

	tree.registerNodeType(new AddNode());
	tree.registerNodeType(new GreaterThanNode());
	tree.registerNodeType(new ConsoleLogNode());
	tree.registerNodeType(new StartNode());

	function runTree() {
		const engine = new ForwardEngine(tree);
		engine.runFromType('start');
	}
</script>

<div class="screen">
	<Editor {tree} />
	<div class="runner">
		<button on:click={runTree}>Run from start</button>
	</div>
</div>

<style>
	.screen {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		position: relative;
	}

	:global(body) {
		padding: 0;
		margin: 0;
	}

	.runner {
		position: absolute;
		right: 0;
		top: 0;
		backdrop-filter: blur(2px) saturate(180%);
		border-radius: 10px;
		padding: 1em;
	}
</style>
