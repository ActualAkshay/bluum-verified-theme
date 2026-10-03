import { createHash, randomUUID } from "node:crypto"
import { lstat, readFile, realpath, rename, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const assetDirectory = "public/images/themes/verified"
const checksum = (content) => createHash("sha256").update(content).digest("hex")
const digestPattern = /^[a-f0-9]{64}$/

// The checked-in manifest is the only allowlist. CLI callers cannot select a
// manifest or destination. New source hashes must be reviewed; an older target
// can be replaced only when its hash is explicitly recorded as previously owned.
export function validateManifest(manifest) {
  if (manifest?.schema_version !== 1 || !Array.isArray(manifest.assets)) throw new Error("Invalid asset manifest")
  const seen = new Set()
  return manifest.assets.map((asset) => {
    const name = asset?.path
    if (typeof name !== "string" || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:png|jpe?g|webp|avif|svg|gif|woff2?)$/.test(name)) {
      throw new Error(`Unsafe asset path: ${String(name)}`)
    }
    const normalized = name.toLowerCase()
    if (seen.has(normalized)) throw new Error(`Duplicate asset path: ${name}`)
    seen.add(normalized)
    if (!digestPattern.test(asset.sha256) || !Array.isArray(asset.previous_sha256) || asset.previous_sha256.some((hash) => !digestPattern.test(hash))) {
      throw new Error(`Invalid asset hashes: ${name}`)
    }
    return { path: name, sha256: asset.sha256, previous_sha256: [...asset.previous_sha256] }
  })
}

async function checkedRoot(root) {
  const absolute = path.resolve(root)
  const info = await lstat(absolute)
  if (info.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${absolute}`)
  if (!info.isDirectory()) throw new Error(`Expected directory: ${absolute}`)
  return realpath(absolute)
}

async function checkedFile(root, relative, allowMissing = false) {
  const segments = relative.split("/")
  let current = root
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment)
    let info
    try { info = await lstat(current) }
    catch (error) {
      if (allowMissing && index === segments.length - 1 && error.code === "ENOENT") return current
      throw error
    }
    if (info.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${relative}`)
    if (index < segments.length - 1 ? !info.isDirectory() : !info.isFile()) throw new Error(`Invalid asset file or directory: ${relative}`)
  }
  return current
}

async function readOptional(file) {
  try { return await readFile(file) }
  catch (error) { if (error.code === "ENOENT") return undefined; throw error }
}

export async function syncAssets({ storefront, check = false, repository = repositoryRoot }) {
  if (!storefront) throw new Error("--storefront must point to an existing Medusa apps/storefront directory")
  const sourceRoot = await checkedRoot(repository)
  const targetRoot = await checkedRoot(storefront)
  const packagePath = await checkedFile(targetRoot, "package.json")
  if (JSON.parse(await readFile(packagePath, "utf8")).name !== "storefront") throw new Error("Target package must be named storefront")
  const manifestPath = await checkedFile(sourceRoot, "design/assets.json")
  const assets = validateManifest(JSON.parse(await readFile(manifestPath, "utf8")))
  const changes = []
  // Preflight the entire manifest before making any changes.
  for (const asset of assets) {
    const sourcePath = await checkedFile(sourceRoot, `public/${asset.path}`)
    const relative = `${assetDirectory}/${asset.path}`
    const targetPath = await checkedFile(targetRoot, relative, true)
    const content = await readFile(sourcePath)
    if (checksum(content) !== asset.sha256) throw new Error(`Source hash mismatch: ${asset.path}. Review and update design/assets.json.`)
    const existing = await readOptional(targetPath)
    if (existing?.equals(content)) continue
    if (existing && !asset.previous_sha256.includes(checksum(existing))) throw new Error(`Refusing unrecognized or modified asset: ${relative}`)
    changes.push({ relative, targetPath, content, existing })
  }
  if (!check) {
    for (const change of changes) {
      await checkedFile(targetRoot, change.relative, true)
      const latest = await readOptional(change.targetPath)
      if (latest === undefined ? change.existing !== undefined : !change.existing?.equals(latest)) throw new Error(`Target changed during sync: ${change.relative}`)
      const temporary = `${change.targetPath}.theme-sync-${randomUUID()}`
      try {
        await writeFile(temporary, change.content, { flag: "wx" })
        await rename(temporary, change.targetPath)
      } finally {
        await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error })
      }
    }
  }
  return { changed: changes.map((change) => change.relative), check }
}

export function parseArguments(args) {
  let storefront
  let check = false
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--check" && !check) check = true
    else if (args[index] === "--storefront" && !storefront && args[index + 1] && !args[index + 1].startsWith("--")) storefront = args[++index]
    else throw new Error(`Unsupported or duplicate argument: ${args[index]}`)
  }
  if (!storefront) throw new Error("Usage: node scripts/sync-assets.mjs --storefront /path/to/medusa/apps/storefront [--check]")
  return { storefront, check }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await syncAssets(parseArguments(process.argv.slice(2)))
    if (result.check && result.changed.length) {
      console.error(`Theme asset drift:\n${result.changed.join("\n")}`)
      process.exitCode = 1
    } else console.log(result.check ? "All managed theme assets match standalone sources." : `Synced ${result.changed.length} theme asset(s). Activation unchanged.`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
