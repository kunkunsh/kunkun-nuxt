import { exec } from "child_process"
import os from "node:os"
import {
	DEEP_LINK_PATH_REFRESH_DEV_EXTENSION,
	DESKTOP_SERVICE_NAME,
	KUNKUN_DESKTOP_APP_SERVER_PORTS
} from "../constants"

export function checkLocalKunkunService(port: number): Promise<boolean> {
	return fetch(`http://localhost:${port}/info`)
		.then((res) => {
			if (!res.ok) {
				return false
			}
			return res.json()
		})
		.then((data) => {
			return data["service_name"] === DESKTOP_SERVICE_NAME
		})
		.catch((err) => {
			// fetch fail, i.e. server not on this port
			return false
		})
}

export async function findLocalhostKunkunPorts(): Promise<number[]> {
	const onlinePorts = []
	for (const port of KUNKUN_DESKTOP_APP_SERVER_PORTS) {
		const online = await checkLocalKunkunService(port)
		if (online) {
			onlinePorts.push(port)
		}
	}
	return onlinePorts
}

export async function refreshTemplateWorkerExtensionViaServer() {
	const ports = await findLocalhostKunkunPorts()
	console.log("Kunkun ports", ports)
	if (ports.length === 0) {
		console.error("Failed to find localhost kunkun ports")
		return
	} else if (ports.length > 1) {
		console.warn("Found multiple localhost kunkun ports", ports)
		console.warn("Will Refresh Every Instance")
	}
	for (const port of ports) {
		fetch(`http://localhost:${port}/refresh-worker-extension`, { method: "POST" }).catch((err) => {
			console.error("Failed to send refresh worker extension request", err)
		})
	}
}

export async function refreshTemplateWorkerExtensionViaDeepLink() {
	console.log("Send Refresh Worker Extension Request")

	const platform = await os.platform()
	try {
		switch (platform) {
			case "darwin":
				exec(`open ${DEEP_LINK_PATH_REFRESH_DEV_EXTENSION}`)
				break
			case "win32":
				exec(`start ${DEEP_LINK_PATH_REFRESH_DEV_EXTENSION}`)
				break
			case "linux":
				exec(`xdg-open ${DEEP_LINK_PATH_REFRESH_DEV_EXTENSION}`)
				break
		}
	} catch (error) {
		console.error("Failed to refresh worker extension:", error)
	}
}

export const refreshTemplateWorkerExtension = refreshTemplateWorkerExtensionViaServer

export function kununWorkerTemplateExtensionRollupPlugin() {
	return {
		async writeBundle() {
			await refreshTemplateWorkerExtensionViaDeepLink()
		}
	}
}
