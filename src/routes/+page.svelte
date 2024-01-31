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
		description = 'Check if a > b';
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
	class MySecondNodeType
		implements
			INode<
				{
					string: string;
				},
				{
					number: number;
				}
			>
	{
		category = 'Test';
		id = 'myothernode';
		title = 'Convert';
		description = 'Convert string to number';
		flow = FlowState.IN_OUT;
		inputs = {
			string: () => new NodeInterface('String', BaseTypes.STRING)
		};
		outputs = {
			number: () => new NodeInterface('Number', BaseTypes.NUMBER)
		};

		calculate({ string }: { string: string }): { number: number } {
			return {
				number: parseInt(string)
			};
		}
	}
	class MyNodeType
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
		category = 'Test';
		id = 'mytestnode';
		title = 'Add';
		description = 'Add two numbers together';
		flow = FlowState.IN;
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

	tree.registerNodeType(new MyNodeType());
	tree.registerNodeType(new MySecondNodeType());
	tree.registerNodeType(new GreaterThanNode());
	let a = tree.insertNodeAt('mytestnode', { x: 0, y: 0 });
	let b = tree.insertNodeAt('mytestnode', { x: 250, y: 0 });
	let c = tree.insertNodeAt('myothernode', { x: 100, y: 250 });
	let d = tree.insertNodeAt('greaterthan', { x: 280, y: 250 });
</script>

<div class="screen">
	<Editor {tree} />
</div>

<style>
	.screen {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		padding: 0;
		margin: 0;
	}
</style>
