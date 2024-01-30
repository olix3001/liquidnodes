<script lang="ts">
	import Editor from '$lib/view/Editor.svelte';
	import NodeTree from '$lib/core/nodeTree.ts';
	import { type INode, type INodeInterface } from '$lib/core/node.ts';
	import '$lib/style/defaultEditorStyle.css';
	import { BaseTypes, NodeInterface, NumberInterface } from '$lib/core/interfaces.ts';

	let tree = new NodeTree();

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
	let a = tree.insertNodeAt('mytestnode', { x: 0, y: 0 });
	let b = tree.insertNodeAt('mytestnode', { x: 250, y: 0 });
	let c = tree.insertNodeAt('myothernode', { x: 100, y: 250 });
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
