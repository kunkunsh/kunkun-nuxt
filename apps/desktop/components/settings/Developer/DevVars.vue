<script setup lang="ts">
import { getExtensionsFolder, SUPABASE_URL } from "@/lib/constants"
import { getServerPort } from "@kksh/api/commands"
import { Button } from "@kksh/vue/button"
import { appDataDir, join } from "@tauri-apps/api/path"
import { open } from "tauri-plugin-shellx-api"
import { onMounted, ref } from "vue"

const runtimeConfig = useRuntimeConfig()
const extFolder = ref<string | null>()
const port = ref<number>()
const appDataPath = await appDataDir()
// const appConfigPath = await join(appDataPath, "appConfig.bin")
async function refreshFolderFetch() {
	extFolder.value = await getExtensionsFolder()
}

onMounted(async () => {
	refreshFolderFetch()
	port.value = await getServerPort()
})
</script>
<template>
	<div class="flex flex-col space-y-3 pr-5">
		<ul>
			<li
				class="text-muted-foreground flex cursor-pointer items-center space-x-2"
				@click="extFolder && open(extFolder)"
			>
				<strong>Extension Path: </strong><span class="">{{ extFolder }}</span
				><Icon name="ion:open-outline" />
			</li>

			<li
				v-if="runtimeConfig.public.isDev"
				class="text-muted-foreground flex cursor-pointer items-center space-x-2"
				@click="open(appDataPath)"
			>
				<strong>App Data Dir: </strong><span>{{ appDataPath }}</span
				><Icon name="ion:open-outline" />
			</li>

			<!-- <li class="text-muted-foreground cursor-pointer flex space-x-2 items-center">
        <strong>Supabase GraphQL Endpoint</strong><span>{{ SUPABASE_URL }}</span
        ><Icon name="ion:open-outline" />
      </li> -->
		</ul>
		<Button class="" size="xs" @click="refreshFolderFetch">Refresh</Button>
	</div>
</template>
