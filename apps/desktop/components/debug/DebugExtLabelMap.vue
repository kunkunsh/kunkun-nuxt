<script setup lang="ts">
import {
	getExtLabelMap,
	isWindowLabelRegistered,
	registerExtensionWindow,
	unregisterExtensionWindow
} from "@kksh/api/commands"
import type { ExtensionLabelMap } from "@kksh/api/models"
import { Button } from "@kksh/vue/button"
import { onMounted, ref } from "vue"
import CodeEditor from "./CodeEditor.vue"
import CodeEditorHtml from "./CodeEditorHtml.vue"

const extLabelMapping = ref<ExtensionLabelMap>({})

onMounted(async () => {
	//   await unregisterExtensionWindow("xyz");
	console.log(await getExtLabelMap())
})

async function obtainExtLabelMap() {
	extLabelMapping.value = await getExtLabelMap()
}
</script>
<template>
	<div class="flex flex-col space-y-3">
		<h1 class="text-3xl font-bold">Debug Extension Label</h1>
		<Button @click="obtainExtLabelMap">Obtain Extension Label Mapping</Button>
		<!-- <pre class="break-all whitespace-pre-wrap">{{ JSON.stringify(extLabelMapping, null, 2) }}</pre> -->
		<!-- <CodeEditor language="json" :value="JSON.stringify(extLabelMapping, null, 2)" /> -->
		<CodeEditorHtml
			lang="json"
			theme="one-dark-pro"
			:value="JSON.stringify(extLabelMapping, null, 2)"
		/>
	</div>
</template>
