<script setup lang="ts">
import { default as TauriLink } from "@/components/tauri/link.vue"
import { cn } from "@/lib/utils"
import { checkUpdateAndInstall } from "@/lib/utils/updater"
import { Button } from "@kksh/vue/button"
import { Card, CardContent } from "@kksh/vue/card"
import { getVersion } from "@tauri-apps/api/app"
import { onMounted, ref, type HTMLAttributes } from "vue"

const appVersion = ref("")
onMounted(() => {
	getVersion().then((version) => {
		appVersion.value = version
	})
})
const props = defineProps<{
	class?: HTMLAttributes["class"]
}>()
</script>
<template>
	<Card :class="cn('flex h-full items-center justify-center border-none', props.class)">
		<CardContent class="flex items-center space-x-5">
			<img src="/img/logo-w-bg.png" class="w-44" />
			<div class="flex flex-col space-y-1">
				<p class="text-3xl font-bold">{{ $t("common.appName") }}</p>
				<p class="text-xs">{{ $t("settings.about.version") }}: {{ appVersion }}</p>
				<p>
					<strong class="font-bold">{{ $t("settings.about.author") }}: </strong>
					<TauriLink href="https://github.com/HuakunShen">
						@HuakunShen
						<Icon name="mdi:github" class="inline -translate-y-0.5 text-white" />
					</TauriLink>
				</p>
				<TauriLink href="https://github.com/HuakunTech/kunkun">
					{{ $t("settings.about.sourceCode") }}
					<Icon name="mdi:github" class="inline -translate-y-0.5 text-white" />
				</TauriLink>
				<TauriLink href="https://github.com/HuakunTech/kunkunExtensions">
					{{ $t("settings.about.extensionsSourceCode") }}
					<Icon name="mdi:github" class="inline -translate-y-0.5 text-white" />
				</TauriLink>
				<Button @click="checkUpdateAndInstall" size="xs" variant="secondary">{{
					$t("settings.about.checkUpdate")
				}}</Button>
			</div>
		</CardContent>
	</Card>
</template>
