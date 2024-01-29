<script lang="ts">
	export let isOutput: boolean = true;
</script>

<div
	class="liquidnodes_port"
	class:liquidnodes_port_right={isOutput}
	class:liquidnodes_port_left={!isOutput}
></div>

<style>
	.liquidnodes_port {
		width: 10px;
		height: 10px;
		background-color: white;
		border-radius: 50%;
		position: absolute;
		top: 5px;
	}

	.liquidnodes_port_right {
		right: -7px;
	}

	.liquidnodes_port_left {
		left: -7px;
	}
</style>
