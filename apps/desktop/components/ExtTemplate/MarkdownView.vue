<script setup lang="ts">
import { Button } from "@kksh/vue/button"
import { ArrowLeftIcon } from "@radix-icons/vue"
import clipboard from "tauri-plugin-clipboard-api"

defineProps<{
	markdown: string
}>()

const localePath = useLocalePath()
// clipboard.readFiles().then((files) => {
// 	console.log(files)
// })
onKeyStroke("Escape", () => {
	goBack()
})

function goBack() {
	navigateTo(localePath("/"))
}
</script>
<template>
	<main class="flex w-full justify-center py-10 container">
		<Button class="absolute left-2 top-2" size="icon" variant="outline" @click="goBack">
			<ArrowLeftIcon />
		</Button>
		<div class="prose dark:prose-invert">
			<MDC :value="markdown" />
		</div>
	</main>
</template>
