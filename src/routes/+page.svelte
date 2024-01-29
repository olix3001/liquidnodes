<script>
	import Editor from '$lib/view/Editor.svelte';
	import NodeTree from '$lib/core/nodeTree.ts';
	import '$lib/style/defaultEditorStyle.css';

	let tree = new NodeTree();
</script>

<div class="screen">
	<Editor nodeTree={tree} />
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
