<script setup lang="ts">
import { Checkbox } from "@kksh/vue/checkbox"
import { useStore } from "@nanostores/vue"
import { useAppConfigStore } from "~/stores/appConfig"
import { computed, ref, watch } from "vue"

const appConfig = useAppConfigStore()
const checked = computed({
	get() {
		return appConfig.showInTray
	},
	set(val) {
		appConfig.setShowInTray(val)
	}
})
</script>
<template>
	<div class="grid grid-cols-2 gap-4">
		<span class="justify-self-end">{{ $t("settings.general.menubarIcon") }}</span>
		<div class="flex items-center space-x-2">
			<Checkbox id="menu-bar" v-model:checked="checked" />
			<label
				for="menu-bar"
				class="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{{ $t("settings.general.showInMenuBar") }}
			</label>
		</div>
	</div>
</template>
