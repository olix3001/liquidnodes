<script lang="ts">
	import Editor from '$lib/view/Editor.svelte';
	import NodeTree from '$lib/core/nodeTree.ts';
	import { type INode, type INodeInterface } from '$lib/core/node.ts';
	import '$lib/style/defaultEditorStyle.css';
	import { NodeInterface, NumberInterface } from '$lib/core/interfaces.ts';

	let tree = new NodeTree();

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
			result: () => new NodeInterface<number>('Result')
		};

		calculate({ a, b }: { a: number; b: number }): { result: number } {
			return {
				result: a + b
			};
		}
	}

	tree.registerNodeType(new MyNodeType());
	let a = tree.insertNodeAt('mytestnode', { x: 0, y: 0 });
	let b = tree.insertNodeAt('mytestnode', { x: 250, y: 0 });
	let c = tree.insertNodeAt('mytestnode', { x: 100, y: 250 });
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
