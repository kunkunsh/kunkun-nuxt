import { db } from "@kksh/api/commands"
import { ExtPackageJson, ExtPackageJsonExtra } from "@kksh/api/models"
import { basename, dirname, join } from "@tauri-apps/api/path"
import { readDir, readTextFile } from "@tauri-apps/plugin-fs"
import { debug, error } from "@tauri-apps/plugin-log"
import { flatten, safeParse } from "valibot"

/**
 *
 * @param manifestPath absolute path to package.json
 * @returns
 */
export function loadExtensionManifestFromDisk(manifestPath: string): Promise<ExtPackageJsonExtra> {
	debug(`loadExtensionManifestFromDisk: ${manifestPath}`)
	return readTextFile(manifestPath).then(async (content) => {
		const parse = safeParse(ExtPackageJson, JSON.parse(content))
		if (parse.issues) {
			error(`Fail to load extension from ${manifestPath}. See console for parse error.`)
			console.error(parse.issues)
			console.error(JSON.stringify(flatten<typeof ExtPackageJson>(parse.issues), null, 2))
			throw new Error(`Invalid manifest: ${manifestPath}`)
		} else {
			// debug(`Loaded extension ${parse.output.kunkun.identifier} from ${manifestPath}`)
			const extPath = await dirname(manifestPath)
			const extFolderName = await basename(extPath)
			return Object.assign(parse.output, {
				extPath,
				extFolderName
			})
		}
	})
}

export function loadAllExtensionsFromDisk(
	extensionsFolder: string
): Promise<ExtPackageJsonExtra[]> {
	return readDir(extensionsFolder).then(async (dirEntries) => {
		const results: ExtPackageJsonExtra[] = []
		for (const dirEntry of dirEntries) {
			const extFullPath = await join(extensionsFolder, dirEntry.name)
			const manifestPath = await join(extFullPath, "package.json")
			let extPkgJson: ExtPackageJson
			try {
				extPkgJson = await loadExtensionManifestFromDisk(manifestPath)
			} catch (error) {
				continue
			}
			upsertExtension(extPkgJson, extFullPath)
			results.push(
				Object.assign(extPkgJson, {
					extPath: extFullPath,
					extFolderName: dirEntry.name
				})
			)
		}
		return results
	})
}

export async function upsertExtension(extPkgJson: ExtPackageJson, extFullPath: string) {
	const extInDb = await db.getUniqueExtensionByIdentifier(extPkgJson.kunkun.identifier)
	if (!extInDb) {
		// create this extension in database
		await db.createExtension({
			identifier: extPkgJson.kunkun.identifier,
			version: extPkgJson.version,
			path: extFullPath
		})
	}
}

export async function loadAllExtensionsFromDb(): Promise<ExtPackageJsonExtra[]> {
	const allDbExts = await (await db.getAllExtensions()).filter((ext) => ext.path)
	const results: ExtPackageJsonExtra[] = []
	for (const ext of allDbExts) {
		if (!ext.path) continue
		try {
			const extPkgJson = await loadExtensionManifestFromDisk(await join(ext.path, "package.json"))
			results.push(extPkgJson)
		} catch (err) {
			console.error(err)
			error(`Failed to load extension ${ext.path} from database.`)
			// delete this extension from database
			await db.deleteExtensionByPath(ext.path)
		}
	}
	return results
}
