<script lang="ts">
	import Editor from '$lib/view/Editor.svelte';
	import NodeTree from '$lib/core/nodeTree.ts';
	import { FlowState, defineNode, type INode, type INodeInterface } from '$lib/core/node.ts';
	import '$lib/style/defaultEditorStyle.css';
	import {
		BaseTypes,
		type Flow,
		FlowInterface,
		NodeInterface,
		NumberInterface
	} from '$lib/core/interfaces.ts';
	import ForwardEngine from '$lib/engine/forwardEngine.ts';

	let tree = new NodeTree();

	const GreaterThanNode = defineNode(
		{
			category: 'Comparison',
			id: 'greaterthan',
			title: 'Greater Than',
			description: 'Check if A > B.',
			flow: FlowState.IN,
			inputs: {
				a: () => new NumberInterface('A'),
				b: () => new NumberInterface('B'),
				flow_true: () => new FlowInterface('True'),
				flow_false: () => new FlowInterface('False')
			}
		},
		({ a, b, flow_true, flow_false }) => {
			if (a > b) flow_true.fire();
			else flow_false.fire();
			return {};
		}
	);

	const AddNode = defineNode(
		{
			category: 'Math',
			id: 'addition',
			title: 'Add',
			description: 'Add two numbers together.',
			inputs: {
				a: () => new NumberInterface('Number'),
				b: () => new NumberInterface('Number')
			},
			outputs: {
				result: () => new NodeInterface('Result', BaseTypes.NUMBER)
			}
		},
		({ a, b }) => {
			return {
				result: a + b
			};
		}
	);
	const ConsoleLogNode = defineNode(
		{
			category: 'Util',
			id: 'consolelog',
			title: 'Debug Print',
			description: 'Prints value to the console.',
			flow: FlowState.IN_OUT,
			inputs: {
				value: () => new NodeInterface('Value', BaseTypes.ANY)
			}
		},
		({ value }) => {
			console.log(value);
			return {};
		}
	);

	const StartNode = defineNode({
		category: 'Flow',
		id: 'start',
		title: 'Start',
		description: 'Entry point for your program.'
	});

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
