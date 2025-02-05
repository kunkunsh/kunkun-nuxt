<script setup lang="ts">
import ExtTemplateListView from "@/components/ExtTemplate/ListView.vue"
import { type Remote } from "@huakunshen/comlink"
import { db, unregisterExtensionWindow } from "@kksh/api/commands"
import type { ExtPackageJsonExtra } from "@kksh/api/models"
import {
	constructJarvisServerAPIWithPermissions,
	exposeApiToWorker,
	type IApp,
	type IUiWorker
} from "@kksh/api/ui"
import {
	// constructJarvisExtDBToServerDbAPI,
	FormNodeNameEnum,
	FormSchema,
	ListSchema,
	Markdown,
	MarkdownSchema,
	NodeNameEnum,
	wrap,
	type IComponent,
	type IDb,
	type WorkerExtension
} from "@kksh/api/ui/worker"
import { useStore } from "@nanostores/vue"
import type { UnlistenFn } from "@tauri-apps/api/event"
import { join } from "@tauri-apps/api/path"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { exists, readTextFile } from "@tauri-apps/plugin-fs"
import { debug } from "@tauri-apps/plugin-log"
import { loadExtensionManifestFromDisk } from "~/lib/commands/extensions"
import { GlobalEventBus } from "~/lib/utils/events"
import { buildFieldConfig, convertFormToZod } from "~/lib/utils/form"
import { sendNotificationWithPermission } from "~/lib/utils/notification"
import { listenToRefreshDevExt } from "~/lib/utils/tauri-events"
import { isInMainWindow } from "~/lib/utils/window"
import { useExtDisplayStore } from "~/stores/extState"
import { useWindowExtMapStore } from "~/stores/windowExtMap"
import { Command, executeBashScript } from "tauri-plugin-shellx-api"
import { parse } from "valibot"
import * as v from "valibot"
import { toast } from "vue-sonner"

// definePageMeta({
// 	layout: "ui-only"
// })
const localePath = useLocalePath()
const route = useRoute()
const appWin = getCurrentWindow()
const loaded = ref(false)
const appState = useAppStateStore()
const windowExtMapStore = useWindowExtMapStore()
let workerAPI: Remote<WorkerExtension> | undefined = undefined
const loading = ref(false)
const extensionLoadingBar = ref(false) // whether extension called showLoadingBar
const listViewContent = ref<ListSchema.List>()
const formViewContent = ref<FormSchema.Form>()
const markdownViewContent = ref<MarkdownSchema>()
const formFieldConfig = ref({})
const formViewZodSchema = ref<any>()
const extUrl = ref<string>()
// const extStateStore = useExtDisplayStore()
const appUiStore = useAppUiStore()
const searchTerm = ref("")
const searchBarPlaceholder = ref("")
const listViewRef = ref<{ onActionSelected: () => void }>()
const loadedExt = ref<ExtPackageJsonExtra>()
const pbar = ref<number | null>(null)
const { locale } = useI18n()

const loadingBar = computed(() => appState.loadingBar || extensionLoadingBar.value)

let unlistenRefreshWorkerExt: UnlistenFn | undefined

function clearViewContent(keep?: "list" | "form" | "markdown") {
	if (keep !== "list") {
		listViewContent.value = undefined
	}
	if (keep !== "form") {
		formViewContent.value = undefined
	}
	if (keep !== "markdown") {
		markdownViewContent.value = undefined
	}
}

async function goBack() {
	if (isInMainWindow()) {
		await unregisterExtensionWindow(appWin.label)
		windowExtMapStore.unregisterExtensionFromWindow(appWin.label)
		navigateTo(localePath("/"))
	} else {
		appWin.close()
	}
}

const extUiAPI: IUiWorker = {
	async render(view: IComponent<ListSchema.List | FormSchema.Form | Markdown>) {
		if (view.nodeName === NodeNameEnum.List) {
			clearViewContent("list")
			const parsedListView = parse(ListSchema.List, view)
			const updateFields = {
				sections: true,
				items: true,
				detail: true,
				filter: true,
				actions: true,
				defaultAction: true
			}
			if (listViewContent.value) {
				if (parsedListView.inherits && parsedListView.inherits.length > 0) {
					if (parsedListView.inherits.includes("items")) {
						updateFields.items = false
					}
					if (parsedListView.inherits.includes("sections")) {
						updateFields.sections = false
					}
					if (parsedListView.inherits.includes("detail")) {
						updateFields.detail = false
					}
					if (parsedListView.inherits.includes("filter")) {
						updateFields.filter = false
					}
					if (parsedListView.inherits.includes("actions")) {
						updateFields.actions = false
					}
					if (parsedListView.inherits.includes("defaultAction")) {
						updateFields.defaultAction = false
					}
					if (updateFields.items) {
						listViewContent.value.items = parsedListView.items
					}
					if (updateFields.sections) {
						listViewContent.value.sections = parsedListView.sections
					}
					if (updateFields.detail) {
						listViewContent.value.detail = parsedListView.detail
					}
					if (updateFields.filter) {
						listViewContent.value.filter = parsedListView.filter
					}
					if (updateFields.actions) {
						listViewContent.value.actions = parsedListView.actions
					}
					if (updateFields.defaultAction) {
						listViewContent.value.defaultAction = parsedListView.defaultAction
					}
					listViewContent.value.inherits = parsedListView.inherits
				} else {
					listViewContent.value = parsedListView
				}
			} else {
				listViewContent.value = parsedListView
			}

			// if (parsedListView.updateDetailOnly) {
			// 	if (listViewContent.value) {
			// 		listViewContent.value.detail = parsedListView.detail
			// 	} else {
			// 		listViewContent.value = parsedListView
			// 	}
			// } else {
			// 	listViewContent.value = parsedListView
			// }
		} else if (view.nodeName === FormNodeNameEnum.Form) {
			listViewContent.value = undefined
			clearViewContent("form")
			const parsedForm = parse(FormSchema.Form, view)
			formViewContent.value = parsedForm
			const zodSchema = convertFormToZod(parsedForm)
			formViewZodSchema.value = zodSchema
			formFieldConfig.value = buildFieldConfig(parsedForm)
		} else if (view.nodeName === NodeNameEnum.Markdown) {
			clearViewContent("markdown")
			markdownViewContent.value = parse(MarkdownSchema, view)
		} else {
			toast.error(`Unsupported view type: ${view.nodeName}`)
		}
	},
	async showLoadingBar(loading: boolean) {
		// appState.setLoadingBar(loading)
		extensionLoadingBar.value = loading
	},
	async setProgressBar(progress: number | null) {
		pbar.value = progress
	},
	async setScrollLoading(_loading: boolean) {
		loading.value = _loading
	},
	async setSearchTerm(term: string) {
		searchTerm.value = term
	},
	async setSearchBarPlaceholder(placeholder: string) {
		searchBarPlaceholder.value = placeholder
	},
	async goBack() {
		goBack()
	}
}

function onActionSelected(actionVal: string) {
	listViewRef.value?.onActionSelected()
	if (workerAPI && workerAPI.onActionSelected) {
		workerAPI.onActionSelected(actionVal)
	}
}

async function launchWorkerExt() {
	// const currentWorkerExt = extStateStore.currentWorkerExt
	const route = useRoute()
	// const parseUrl = v.safeParse(v.string(), route.query.url)

	// if (!parseUrl.success) {
	// 	sendNotificationWithPermission("Invalid Extension URL", "")
	// 	if (appWin.label !== "main") {
	// 		return appWin.close()
	// 	} else {
	// 		return navigateTo(localePath("/"))
	// 	}
	// }
	// extUrl.value = parseUrl.output
	const parseExtPath = v.safeParse(v.string(), route.query.extPath)
	if (!parseExtPath.success) {
		sendNotificationWithPermission("Invalid Extension Path", "")
		return goBack()
	}
	const extPath = parseExtPath.output
	const parseCmdName = v.safeParse(v.string(), route.query.cmdName)
	if (!parseCmdName.success) {
		console.error("Invalid Command Name")

		sendNotificationWithPermission("Invalid Command Name", "")
		return goBack()
	}
	const cmdName = parseCmdName.output
	try {
		loadedExt.value = await loadExtensionManifestFromDisk(await join(extPath, "package.json"))
	} catch (error) {
		console.error("Error loading extension", error)
		sendNotificationWithPermission("Error loading extension", "")
		goBack()
	}
	if (!loadedExt.value) {
		console.error("No loaded extension")
		return
	}
	// const identifier = loadedExt.value.kunkun.identifier
	// if (!identifier) {
	// 	return navigateTo(localePath("/"))
	// }

	// if (!currentWorkerExt) {
	// 	toast.error("No worker extension selected")
	// 	return navigateTo(localePath("/"))
	// }
	// const manifest = await loadExtensionManifestFromDisk(
	// 	await join(currentWorkerExt.manifest.extPath, "package.json")
	// )
	// if (!exists(manifest.extPath)) {
	// 	toast.error("Worker extension not found")
	// 	return navigateTo(localePath("/"))
	// }

	const cmd = loadedExt.value.kunkun.templateUiCmds.find((cmd) => cmd.name === cmdName)
	if (!cmd) {
		toast.error(`Worker extension command ${cmdName} not found`)
		return goBack()
	}
	const scriptPath = await join(loadedExt.value.extPath, cmd.main)
	if (!exists(scriptPath)) {
		toast.error(`Worker extension script ${cmd.main} not found`)
		return goBack()
	}
	const extInfoInDB = await db.getUniqueExtensionByPath(loadedExt.value.extPath)
	if (!extInfoInDB) {
		toast.error("Unexpected Error", {
			description: `Worker extension ${loadedExt.value.kunkun.identifier} not found in database. Run Troubleshooter.`
		})
		return goBack()
	}

	const workerScript = await readTextFile(scriptPath)
	const blob = new Blob([workerScript], { type: "application/javascript" })
	const blobURL = URL.createObjectURL(blob)
	const worker = new Worker(blobURL)
	// Expose Jarvis APIs to worker with permissions constraints
	const serverAPI: Record<string, any> = constructJarvisServerAPIWithPermissions(
		loadedExt.value.kunkun.permissions,
		loadedExt.value.extPath
	)
	serverAPI.iframeUi = undefined
	serverAPI.workerUi = extUiAPI
	serverAPI.db = new db.JarvisExtDB(extInfoInDB.extId)
	serverAPI.app = {
		language: () => Promise.resolve(locale.value as "en" | "zh")
	} satisfies IApp
	// const extDBApi: IDb = constructJarvisExtDBToServerDbAPI(dbAPI)
	exposeApiToWorker(worker, serverAPI)
	// exposeApiToWorker(worker, {
	// 	...constructJarvisServerAPIWithPermissions(manifest.kunkun.permissions),
	// 	...extUiAPI,
	// 	...extDBApi
	// })
	// exposeApiToWorker(worker, { render }) // Expose render function to worker
	workerAPI = wrap<WorkerExtension>(worker) // Call worker exposed APIs
	await workerAPI.load()
}

onMounted(async () => {
	setTimeout(() => {
		appState.setLoadingBar(true)
		appWin.show()
	}, 100)
	unlistenRefreshWorkerExt = await listenToRefreshDevExt(() => {
		debug("Refreshing Worker Extension")
		launchWorkerExt()
	})
	launchWorkerExt()
	GlobalEventBus.onActionSelected(onActionSelected)
	setTimeout(() => {
		appState.setLoadingBar(false)
		loaded.value = true
	}, 500)
})

onUnmounted(() => {
	unlistenRefreshWorkerExt?.()
	extensionLoadingBar.value = false
	GlobalEventBus.offActionSelected(onActionSelected)
})
</script>
<template>
	<div class="h-full grow">
		<LoadingBar v-if="loadingBar" class="absolute" />
		<Transition>
			<FunDance v-if="!loaded" class="absolute w-full" />
		</Transition>
		<ExtTemplateFormView
			v-if="loaded && formViewContent && formViewZodSchema"
			@go-back="goBack"
			:workerAPI="workerAPI!"
			:formViewZodSchema="formViewZodSchema"
			:fieldConfig="formFieldConfig"
		/>
		<ExtTemplateListView
			v-else-if="loaded && listViewContent"
			@go-back="goBack"
			class=""
			v-model:search-term="searchTerm"
			v-model:search-bar-placeholder="searchBarPlaceholder"
			:pbar="pbar"
			ref="listViewRef"
			:model-value="listViewContent"
			:workerAPI="workerAPI!"
			:loading="loading"
		/>
		<ExtTemplateMarkdownView
			v-else-if="loaded && markdownViewContent"
			:markdown="markdownViewContent.content"
		/>
	</div>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
