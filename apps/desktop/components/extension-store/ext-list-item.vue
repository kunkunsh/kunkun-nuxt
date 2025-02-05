<script setup lang="ts">
import IconMultiplexer from "@/components/IconMultiplexer.vue"
import { humanReadableNumber } from "@/lib/utils/format"
import { Icon, IconEnum } from "@kksh/api/models"
import type { Tables } from "@kksh/supabase"
import { Button } from "@kksh/vue"
import { CommandItem } from "~/components/ui/command"
import { ArrowRightIcon, CircleCheckBigIcon, MoveRightIcon } from "lucide-vue-next"
import { parse } from "valibot"
import { ExtItem } from "./types"

// type ExtItem = Tables<"extensions">

const props = defineProps<{
	data: Tables<"extensions">
	// data: ExtItem
	installedVersion?: string
	installed: boolean
	upgradeable: boolean
}>()

const emits = defineEmits<{
	(e: "select"): void
	(e: "upgrade"): void
}>()

function onUpgradeClicked(e: MouseEvent) {
	e.stopPropagation()
	emits("upgrade")
}
</script>
<template>
	<CommandItem :value="props.data" class="" @select="emits('select')">
		<div class="flex w-full items-center justify-between">
			<div class="flex items-center space-x-4">
				<IconMultiplexer :icon="parse(Icon, props.data.icon)" class="h-6 w-6" />
				<div>
					<div class="font-semibold">{{ props.data.name }}</div>
					<div class="text-muted-foreground font-mono text-xs">
						{{ props.data.short_description }}
					</div>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				<CircleCheckBigIcon v-if="props.installed" class="w-4 text-green-400" />
				<Button
					v-if="props.upgradeable"
					class="flex items-center space-x-1 px-2"
					variant="outline"
					@click="onUpgradeClicked"
				>
					<small>{{ props.installedVersion }}</small>
					<MoveRightIcon class="w-4" />
					<small>{{ props.data.version }}</small>
				</Button>
				<small v-else>{{ props.data.version }}</small>
				<div class="flex items-center space-x-1">
					<Button v-if="!props.installed" variant="ghost" size="icon">
						<Icon name="ic:round-download" class="inline h-5 w-5" />
					</Button>
					<span class="w-8 text-center">{{ humanReadableNumber(props.data.downloads) }}</span>
				</div>
			</div>
		</div>
	</CommandItem>
</template>
