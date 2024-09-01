import path from "path"
import fs from "fs-extra"
import { getRootDir } from "../src/constants"
import { cleanExtension, patchManifestJsonSchema, patchPkgJsonDep } from "../src/patch"

const distPath = path.join(getRootDir(), "dist")

/* -------------------------------------------------------------------------- */
/*                   copy ../../templates to dist/templates                   */
/* -------------------------------------------------------------------------- */
const templatesPath = path.join(getRootDir(), "../..", "templates")
await fs.copy(templatesPath, path.join(distPath, "templates"))

/* -------------------------------------------------------------------------- */
/*                              Clean Dist Folder                             */
/* -------------------------------------------------------------------------- */
for (const p of fs.readdirSync(path.join(distPath, "templates"))) {
	cleanExtension(path.join(distPath, "templates", p))
}

/* -------------------------------------------------------------------------- */
/*                               Patch Templates                              */
/* -------------------------------------------------------------------------- */
for (const p of fs.readdirSync(path.join(distPath, "templates"))) {
	const pkgJsonPath = path.join(distPath, "templates", p, "package.json")
	if (fs.existsSync(pkgJsonPath)) {
		/* ----------------------- Patch Package Dependencies ----------------------- */
		// Replace local dependencies (workspace:*) with real dependencies
		await patchPkgJsonDep(pkgJsonPath)
		/* ----------------------- Patch Manifest JSON Schema ----------------------- */
		// Replace local template with remote schema
		patchManifestJsonSchema(pkgJsonPath)
		// remove node_modules
		fs.rmdirSync(path.join(distPath, "templates", p, "node_modules"), { recursive: true })
	}
}
