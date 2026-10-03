import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { parseArguments, syncAssets, validateManifest } from "./sync-assets.mjs"

const hash = (value) => createHash("sha256").update(value).digest("hex")
const destination = "public/images/themes/verified"
async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "bluum-assets-test-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  const repository = path.join(root, "theme")
  const storefront = path.join(root, "storefront")
  await mkdir(path.join(repository, "design"), { recursive: true })
  await mkdir(path.join(repository, "public"))
  await mkdir(path.join(storefront, destination), { recursive: true })
  await writeFile(path.join(storefront, "package.json"), '{"name":"storefront"}')
  const manifest = { schema_version: 1, assets: [
    { path: "first.png", sha256: hash("new first"), previous_sha256: [hash("old first")] },
    { path: "second.svg", sha256: hash("new second"), previous_sha256: [] },
  ] }
  const saveManifest = () => writeFile(path.join(repository, "design/assets.json"), JSON.stringify(manifest))
  await saveManifest()
  await writeFile(path.join(repository, "public/first.png"), "new first")
  await writeFile(path.join(repository, "public/second.svg"), "new second")
  return { root, repository, storefront, manifest, saveManifest, target: (name) => path.join(storefront, destination, name) }
}

test("manifest permits only unique, safe asset paths and explicit SHA-256 history", () => {
  for (const name of ["../evil.png", "/evil.png", "a/../evil.png", "a\\evil.png", "a//evil.png", "index.ts", "backend.json", "x.png?query", "x.svg#id", ".hidden.svg"]) {
    assert.throws(() => validateManifest({ schema_version: 1, assets: [{ path: name, sha256: hash("x"), previous_sha256: [] }] }), /Unsafe asset path/)
  }
  assert.throws(() => validateManifest({ schema_version: 1, assets: [
    { path: "x.png", sha256: hash("x"), previous_sha256: [] },
    { path: "X.png", sha256: hash("x"), previous_sha256: [] },
  ] }), /Duplicate/)
  assert.throws(() => validateManifest({ schema_version: 1, assets: [{ path: "x.png", sha256: "bad", previous_sha256: [] }] }), /Invalid asset hashes/)
  assert.throws(() => validateManifest({ schema_version: 2, assets: [] }), /Invalid asset manifest/)
})

test("CLI allows no alternate manifest, target, or duplicate flags", () => {
  assert.deepEqual(parseArguments(["--storefront", "/tmp/storefront", "--check"]), { storefront: "/tmp/storefront", check: true })
  for (const args of [[], ["--check"], ["--storefront"], ["--storefront", "/tmp", "--manifest", "other.json"], ["--storefront", "/tmp", "--check", "--check"]]) assert.throws(() => parseArguments(args))
})

test("check reports missing files without writes; sync creates only allowlisted assets", async (t) => {
  const f = await fixture(t)
  const untouched = path.join(f.storefront, "activation.json")
  await writeFile(untouched, '{"active":"current"}')
  assert.deepEqual((await syncAssets({ ...f, check: true })).changed, [`${destination}/first.png`, `${destination}/second.svg`])
  await assert.rejects(readFile(f.target("first.png")), { code: "ENOENT" })
  await syncAssets(f)
  assert.equal(await readFile(f.target("first.png"), "utf8"), "new first")
  assert.deepEqual((await syncAssets({ ...f, check: true })).changed, [])
  assert.deepEqual((await syncAssets(f)).changed, [])
  assert.equal(await readFile(untouched, "utf8"), '{"active":"current"}')
})

test("identical existing assets are adopted; only declared previous hashes may be replaced", async (t) => {
  const f = await fixture(t)
  await writeFile(f.target("first.png"), "old first")
  await writeFile(f.target("second.svg"), "new second")
  assert.deepEqual((await syncAssets({ ...f, check: true })).changed, [`${destination}/first.png`])
  assert.equal(await readFile(f.target("first.png"), "utf8"), "old first")
  await syncAssets(f)
  assert.equal(await readFile(f.target("first.png"), "utf8"), "new first")
})

test("unrecognized target stops the entire preflight, including --check", async (t) => {
  const f = await fixture(t)
  await writeFile(f.target("first.png"), "old first")
  await writeFile(f.target("second.svg"), "user edit")
  for (const check of [true, false]) await assert.rejects(syncAssets({ ...f, check }), /unrecognized or modified asset/)
  assert.equal(await readFile(f.target("first.png"), "utf8"), "old first")
  assert.equal(await readFile(f.target("second.svg"), "utf8"), "user edit")
})

test("source hash drift is rejected before any write", async (t) => {
  const f = await fixture(t)
  await writeFile(path.join(f.repository, "public/second.svg"), "unreviewed export")
  await assert.rejects(syncAssets(f), /Source hash mismatch/)
  await assert.rejects(readFile(f.target("first.png")), { code: "ENOENT" })
})

test("wrong package and absent target parent are rejected", async (t) => {
  const f = await fixture(t)
  await writeFile(path.join(f.storefront, "package.json"), '{"name":"backend"}')
  await assert.rejects(syncAssets(f), /must be named storefront/)
  await writeFile(path.join(f.storefront, "package.json"), '{"name":"storefront"}')
  await rm(path.join(f.storefront, destination), { recursive: true })
  await assert.rejects(syncAssets(f), { code: "ENOENT" })
})

test("symlink source, target, manifest, root and destination directory are rejected", async (t) => {
  const f = await fixture(t)
  const first = path.join(f.repository, "public/first.png")
  await rm(first)
  await symlink(path.join(f.repository, "public/second.svg"), first)
  await assert.rejects(syncAssets(f), /symbolic link/)
  await rm(first)
  await writeFile(first, "new first")
  await symlink(first, f.target("first.png"))
  await assert.rejects(syncAssets(f), /symbolic link/)
  await rm(f.target("first.png"))
  const manifestPath = path.join(f.repository, "design/assets.json")
  await rm(manifestPath)
  await symlink(first, manifestPath)
  await assert.rejects(syncAssets(f), /symbolic link/)
  await rm(manifestPath)
  await f.saveManifest()
  const linkedRoot = path.join(f.root, "linked-storefront")
  await symlink(f.storefront, linkedRoot)
  await assert.rejects(syncAssets({ ...f, storefront: linkedRoot }), /symbolic link/)
  await rm(path.join(f.storefront, destination), { recursive: true })
  await symlink(path.join(f.repository, "public"), path.join(f.storefront, destination))
  await assert.rejects(syncAssets(f), /symbolic link/)
})
