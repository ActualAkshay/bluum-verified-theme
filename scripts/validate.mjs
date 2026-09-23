import { readFile } from "node:fs/promises"

const manifest = JSON.parse(await readFile(new URL("../bluum-theme.json", import.meta.url)))
const handle = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/

if (manifest.schema_version !== 1) throw new Error("schema_version must be 1")
if (!handle.test(manifest.handle)) throw new Error("invalid handle")
if (!handle.test(manifest.renderer)) throw new Error("invalid renderer")
if (typeof manifest.name !== "string" || !manifest.name.trim()) throw new Error("name is required")
if (!manifest.preview_image_url.startsWith("https://")) throw new Error("preview_image_url must use HTTPS")

console.log(`Validated ${manifest.name} (${manifest.renderer})`)
