<script setup lang="ts">
import { getExtensionsFolder, HTMLElementId } from "@/lib/constants"

const appState = useAppStateStore()
const qlinkStore = useQuicklinkLoader()
const emit = defineEmits<{
	(e: "quicklink-enter"): void
}>()
</script>
<template>
	<CmdPaletteCommandInput
		@quicklink-enter="emit('quicklink-enter')"
		:id="HTMLElementId.MainSearchInput"
		ref="cmdInputRef"
		:searchTerm="appState.searchTermSync"
		class="text-md ml-1 h-12"
		:placeholder="$t('main.searchBarSearchForAppsOrCmds')"
		:quickLinkInputs="qlinkStore.quickLinkInputs"
	>
		<template v-slot:end>
			<div pl-8 data-tauri-drag-region>
				<CmdPaletteSearchBarDropdown />
			</div>
		</template>
	</CmdPaletteCommandInput>
</template>
