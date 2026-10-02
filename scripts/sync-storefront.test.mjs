import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"
import { parseArguments, runtimeFiles, snapshotContent, syncStorefront } from "./sync-storefront.mjs"

const sourceRoot = fileURLToPath(new URL("../src/runtime/", import.meta.url))

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "bluum-theme-sync-test-"))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.join(root, "src/themes"), { recursive: true })
  await mkdir(path.join(root, "src/styles"), { recursive: true })
  await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "storefront" }))
  for (const file of runtimeFiles) {
    const source = await readFile(path.join(sourceRoot, file.name), "utf8")
    await writeFile(path.join(root, file.target), snapshotContent(file.name, source))
  }
  return root
}

test("allowlist contains only the seven theme runtime snapshots", () => {
  assert.deepEqual(runtimeFiles.map((file) => file.target), ["src/themes/verified-theme.tsx", "src/themes/verified-home.tsx", "src/themes/verified-science.tsx", "src/styles/verified-theme.css", "src/themes/verified-catalog-controls.tsx", "src/themes/verified-catalog.ts", "src/themes/verified-support.tsx"])
  assert.throws(() => parseArguments(["--storefront", "/tmp", "--target", "../../backend"]))
  assert.throws(() => parseArguments(["--storefront"]))
  assert.throws(() => parseArguments(["--check"]))
})

test("check is reproducible, read-only, and succeeds for exact snapshots", async (t) => {
  const root = await fixture(t)
  const result = await syncStorefront({ storefront: root, check: true })
  assert.deepEqual(result.changed, [])
  assert.deepEqual((await syncStorefront({ storefront: root })).changed, [])
})

test("check detects drift without writing and CLI returns nonzero", async (t) => {
  const root = await fixture(t)
  const target = path.join(root, runtimeFiles[0].target)
  await writeFile(target, "local change\n")
  const result = await syncStorefront({ storefront: root, check: true })
  assert.deepEqual(result.changed, [runtimeFiles[0].target])
  assert.equal(await readFile(target, "utf8"), "local change\n")
  assert.throws(() => execFileSync(process.execPath, [fileURLToPath(new URL("./sync-storefront.mjs", import.meta.url)), "--storefront", root, "--check"], { stdio: "pipe" }), (error) => error.status === 1 && error.stderr.toString().includes("Theme snapshot drift"))
})

test("sync updates owned snapshots, preserves other files, and becomes clean", async (t) => {
  const root = await fixture(t)
  const target = path.join(root, runtimeFiles[0].target)
  await writeFile(target, snapshotContent(runtimeFiles[0].name, "// older source\n"))
  const unrelated = path.join(root, "src/themes/manifest.ts")
  await writeFile(unrelated, "activation remains untouched\n")
  assert.deepEqual((await syncStorefront({ storefront: root })).changed, [runtimeFiles[0].target])
  assert.deepEqual((await syncStorefront({ storefront: root, check: true })).changed, [])
  assert.equal(await readFile(unrelated, "utf8"), "activation remains untouched\n")
})

test("sync refuses hand edits and preflights all files before writing", async (t) => {
  const root = await fixture(t)
  const first = path.join(root, runtimeFiles[0].target)
  const older = snapshotContent(runtimeFiles[0].name, "// older source\n")
  await writeFile(first, older)
  const last = path.join(root, runtimeFiles[3].target)
  await writeFile(last, `${await readFile(last, "utf8")}/* hand edit */`)
  await assert.rejects(syncStorefront({ storefront: root }), /modified or unrecognized/)
  assert.equal(await readFile(first, "utf8"), older)
})

test("rejects wrong packages and missing integration targets", async (t) => {
  const root = await fixture(t)
  await writeFile(path.join(root, "package.json"), '{"name":"backend"}')
  await assert.rejects(syncStorefront({ storefront: root }), /must be named storefront/)
  await writeFile(path.join(root, "package.json"), '{"name":"storefront"}')
  await rm(path.join(root, runtimeFiles[0].target))
  await assert.rejects(syncStorefront({ storefront: root }), { code: "ENOENT" })
})

test("rejects symlink files and parent directories", async (t) => {
  const root = await fixture(t)
  const target = path.join(root, runtimeFiles[0].target)
  await rm(target)
  await symlink(path.join(root, runtimeFiles[1].target), target)
  await assert.rejects(syncStorefront({ storefront: root }), /symbolic link/)
  await rm(path.join(root, "src/themes"), { recursive: true })
  await symlink(path.join(root, "src/styles"), path.join(root, "src/themes"))
  await assert.rejects(syncStorefront({ storefront: root, check: true }), /symbolic link/)
})

test("creates only explicitly allowlisted new files and reports absence in check", async (t) => {
  const root = await fixture(t)
  const additions = runtimeFiles.filter((file) => file.allowCreation)
  for (const file of additions) await rm(path.join(root, file.target))
  assert.deepEqual((await syncStorefront({ storefront: root, check: true })).changed, additions.map((file) => file.target))
  assert.deepEqual((await syncStorefront({ storefront: root })).changed, additions.map((file) => file.target))
  assert.deepEqual((await syncStorefront({ storefront: root, check: true })).changed, [])
})
