/**
 * Preset Studio Host half.
 *
 * The Host reads the current composition and the profile's user patch layer,
 * serves them to the Client workbench, and owns the writes that make a custom
 * preset an ordinary `@deepseek-ai/dsh-agent-preset` declaration in the marked
 * managed block of `cordis.patch.yml`.
 */
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import Schema from '@deepseek-ai/schemastery'
import { addInactiveBundlePackages, addPresetOnlyPackages, buildInventory } from './lib/inventory.mjs'
import {
  AGENT_PRESET,
  ROW_PREFIX,
  blockRevision,
  buildBlock,
  cleanValue,
  extractBlock,
  parseBlock,
  replaceBlock,
  validatePresets,
} from './lib/patch.mjs'
import { readBuiltInPreset, readRegistryDocument } from './lib/presets.mjs'
import { emitListItem, parseYaml } from './lib/yaml.mjs'

export const name = 'dsh-preset-builder'

export const inject = ['webServer']

export const Config = Schema.object({
  sidebarEntry: Schema.boolean().default(true)
    .description('在左侧栏显示「预设工坊」入口（Show the Preset Workshop entry in the left sidebar）'),
})

const PREFIX = '/plugins/preset-studio'
const BODY_LIMIT = 1024 * 1024
/** The four shipped presets; everything else is a custom preset. */
const OFFICIAL_PRESETS = new Set(['minimal', 'standard', 'ptc', 'cordis'])

export function apply(ctx, config) {
  ctx.inject(['webServer'], (scope) => {
    const server = scope.webServer
    scope.effect(() => server.register({
      kind: 'prefix',
      path: PREFIX,
      handler: (req, res) => dispatch(ctx, config, server, req, res),
    }), 'preset-studio: routes')
  })
}

async function dispatch(ctx, config, server, req, res) {
  let url
  try {
    url = new URL(req.url ?? '/', 'http://local')
  } catch {
    return sendJson(res, { ok: false, error: 'bad request target' }, 400)
  }
  const route = url.pathname.slice(PREFIX.length) || '/'
  try {
    if (req.method === 'GET' && route === '/state') {
      return sendJson(res, await buildState(ctx, config))
    }
    if (req.method === 'GET' && route === '/config') {
      return sendJson(res, {
        ok: true,
        config: { sidebarEntry: config?.sidebarEntry !== false },
        hmr: Boolean(ctx.get('hmr')?.reconcileProfile),
        profile: profileFacts(ctx),
      })
    }
    if (req.method === 'GET' && route === '/preset-source') {
      const id = url.searchParams.get('id') ?? ''
      return sendJson(res, await presetSource(ctx, id))
    }
    if (req.method === 'GET' && route === '/yaml') {
      const id = url.searchParams.get('id') ?? ''
      return sendJson(res, await presetYaml(ctx, id))
    }
    if (req.method === 'POST' && route === '/yaml-preview') {
      if (!sameOrigin(server, req)) return sendJson(res, 403, { ok: false, error: 'cross-origin request rejected' })
      return sendJson(res, yamlPreview(await readJsonBody(req)))
    }
    if (req.method === 'POST' && route === '/verify') {
      if (!sameOrigin(server, req)) return sendJson(res, 403, { ok: false, error: 'cross-origin request rejected' })
      const body = await readJsonBody(req)
      const presets = body?.presets
      const invalid = validatePresets(presets)
      const problems = invalid.length > 0 ? invalid : await probePresets(ctx, presets)
      return sendJson(res, { ok: problems.length === 0, problems })
    }
    if (req.method === 'POST' && route === '/presets/delete') {
      if (!sameOrigin(server, req)) return sendJson(res, { ok: false, error: 'cross-origin request rejected' }, 403)
      return sendJson(res, await deletePreset(ctx, await readJsonBody(req)))
    }
    if (req.method === 'POST' && route === '/presets/adopt') {
      if (!sameOrigin(server, req)) return sendJson(res, { ok: false, error: 'cross-origin request rejected' }, 403)
      return sendJson(res, await adoptPreset(ctx, await readJsonBody(req)))
    }
    if (req.method === 'POST' && route === '/presets/lock') {
      if (!sameOrigin(server, req)) return sendJson(res, { ok: false, error: 'cross-origin request rejected' }, 403)
      return sendJson(res, await lockPreset(ctx, await readJsonBody(req)))
    }
    if (req.method === 'POST' && route === '/save') {
      if (!sameOrigin(server, req)) return sendJson(res, { ok: false, error: 'cross-origin request rejected' }, 403)
      const body = await readJsonBody(req)
      return sendJson(res, await savePresets(ctx, config, body))
    }
    return sendJson(res, { ok: false, error: 'not found' }, 404)
  } catch (error) {
    return sendJson(res, { ok: false, error: messageOf(error) }, 500)
  }
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

function sendJson(res, body, status = 200) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  })
  res.end(text)
}

function sendText(res, text, status = 200) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  })
  res.end(text)
}

function loopbackName(name) {
  return name === 'localhost' || name === '127.0.0.1' || name === '[::1]' || name === '::1'
}

function sameOrigin(server, req) {
  if (req.headers?.['sec-fetch-site'] === 'cross-site') return false
  const origin = req.headers?.origin
  if (typeof origin === 'string' && origin.length > 0) {
    // The Electron window loads over its own scheme and bridges fetch.
    if (origin.startsWith('dsh-app://')) return true
    try {
      return loopbackName(new URL(origin).hostname)
    } catch {
      return false
    }
  }
  const host = req.headers?.host
  if (typeof host === 'string' && host.length > 0) {
    try {
      return loopbackName(new URL('http://' + host).hostname)
    } catch {
      return false
    }
  }
  return false
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > BODY_LIMIT) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8')
      if (text.length === 0) return resolve({})
      try {
        resolve(JSON.parse(text))
      } catch {
        reject(new Error('request body is not valid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function profileFacts(ctx) {
  const profile = ctx.get('profileContext')
  return {
    name: typeof profile?.name === 'string' ? profile.name : '',
    dir: typeof profile?.dir === 'string' ? profile.dir : '',
    patchPath: typeof profile?.patchPath === 'string' ? profile.patchPath : '',
  }
}

function patchPathOf(ctx) {
  const profile = ctx.get('profileContext')
  if (typeof profile?.patchPath !== 'string' || profile.patchPath.length === 0) {
    throw new Error('profile patch path is unavailable; Preset Workshop needs a profile-launched Host')
  }
  return profile.patchPath
}

async function readPatch(path) {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return '[]\n'
    throw error
  }
}

async function writePatch(path, text) {
  const temporary = join(dirname(path), `.preset-studio-${process.pid}-${Date.now()}.tmp`)
  try {
    await writeFile(temporary, text, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, path)
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {})
    throw error
  }
}

async function listRegistryPresets(ctx) {
  const presets = ctx.get('agentPresets')
  if (presets === undefined || typeof presets.list !== 'function') return []
  try {
    const rows = await presets.list()
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

/**
 * Mount every candidate preset under a throwaway id to prove it can activate.
 *
 * The registry activates a definition eagerly and keeps its diagnostic, so a
 * failed probe is exactly the failure a session would meet. The probe is
 * disposed before returning; a registry without `register`/`resolve` skips.
 */
async function probePresets(ctx, presets) {
  const registry = ctx.get('agentPresets')
  if (registry === undefined || typeof registry.register !== 'function' || typeof registry.resolve !== 'function') {
    return []
  }
  const problems = []
  for (const preset of presets) {
    const probeId = `preset-studio-probe-${Date.now().toString(36)}`
    const registration = registry.register({ id: probeId, plugins: preset.plugins })
    const guarded = registration.then((dispose) => ({ dispose }), (error) => ({ error }))
    const outcome = await Promise.race([
      guarded,
      new Promise((resolve) => { setTimeout(() => resolve(null), 8000) }),
    ])
    if (outcome === null) {
      // The mount is still busy; dispose it whenever it settles.
      void registration.then((dispose) => { void Promise.resolve().then(dispose).catch(() => {}) }, () => {})
      problems.push(`${preset.id}: activation did not finish within 8s`)
      continue
    }
    if (outcome.error !== undefined) {
      problems.push(`${preset.id}: ${messageOf(outcome.error)}`)
      continue
    }
    try {
      const info = await registry.resolve(probeId)
      if (typeof info?.broken === 'string' && info.broken.length > 0) {
        problems.push(`${preset.id}: ${info.broken}`)
      }
    } finally {
      try {
        await outcome.dispose()
      } catch {
        // disposal failure must not mask the composition result
      }
    }
  }
  return problems
}

/**
 * Loader rows that declare an Agent preset, keyed by preset id. The declaration
 * row id is what an adopted preset must override.
 */
function presetDeclarations(ctx) {
  const found = new Map()
  let entries = []
  try {
    entries = [...ctx.loader.entries()]
  } catch {
    return found
  }
  for (const entry of entries) {
    const options = entry?.options ?? {}
    if (options.group === true) continue
    if (options.name !== AGENT_PRESET) continue
    const config = options.config
    if (config === null || typeof config !== 'object' || typeof config.id !== 'string') continue
    if (found.has(config.id)) continue
    const rowId = typeof options.id === 'string' && options.id.length > 0
      ? options.id
      : (typeof entry.id === 'string' ? entry.id : '')
    found.set(config.id, { rowId, config: cleanValue(config) })
  }
  return found
}

/** Loader row ids that currently declare an Agent preset (tombstones included). */
function presetRowIds(ctx) {
  const ids = new Set()
  try {
    for (const entry of ctx.loader.entries()) {
      const options = entry?.options ?? {}
      if (options.name !== AGENT_PRESET) continue
      if (typeof options.id === 'string' && options.id.length > 0) ids.add(options.id)
    }
  } catch {
    return ids
  }
  return ids
}

/**
 * Drop tombstones whose declaration row no longer exists (the owning bundle was
 * removed); a stale override would otherwise warn on every start.
 */
function liveTombstones(ctx, model) {
  const ids = presetRowIds(ctx)
  return model.tombstones.filter((rowId) => ids.has(rowId))
}

async function buildState(ctx, config) {
  const path = ctx.get('profileContext')?.patchPath
  const text = typeof path === 'string' && path.length > 0 ? await readPatch(path) : '[]\n'
  const model = parseBlock(extractBlock(text))
  const registry = await listRegistryPresets(ctx)
  const declarations = presetDeclarations(ctx)
  const managedById = new Map(model.presets.map((preset) => [preset.id, preset]))
  const presets = []
  for (const row of registry) {
    const own = managedById.get(row.id)
    if (own !== undefined) {
      managedById.delete(row.id)
      presets.push({
        ...row,
        id: own.id,
        name: own.name ?? row.name ?? '',
        description: own.description ?? row.description,
        order: own.order ?? row.order,
        plugins: cleanValue(own.plugins),
        kind: 'managed',
        adopted: own.adopted === true,
        rowId: own.rowId,
        locked: model.locks.includes(own.id),
        official: false,
      })
      continue
    }
    const official = OFFICIAL_PRESETS.has(row.id)
    const declaration = declarations.get(row.id)
    presets.push({
      ...row,
      kind: official ? 'official' : 'foreign',
      official,
      adopted: false,
      rowId: declaration?.rowId,
      canAdopt: !official && declaration !== undefined,
      locked: model.locks.includes(row.id),
    })
  }
  for (const own of managedById.values()) {
    presets.push({
      ...own,
      plugins: cleanValue(own.plugins),
      kind: 'managed',
      official: false,
      pending: true,
      locked: model.locks.includes(own.id),
    })
  }
  presets.sort((a, b) => {
    if (a.official !== b.official) return a.official ? -1 : 1
    return (a.order ?? Infinity) - (b.order ?? Infinity) || a.id.localeCompare(b.id)
  })
  const inventory = buildInventory(ctx)
  const profileDir = ctx.get('profileContext')?.dir
  const inactiveRows = await addInactiveBundlePackages(ctx, inventory.packages, profileDir)
  const presetTrees = []
  for (const preset of presets) {
    if (Array.isArray(preset.plugins)) presetTrees.push(preset.plugins)
  }
  for (const declaration of declarations.values()) {
    if (Array.isArray(declaration.config?.plugins)) presetTrees.push(declaration.config.plugins)
  }
  for (const id of OFFICIAL_PRESETS) {
    try {
      const builtIn = await readBuiltInPreset(id)
      if (builtIn !== null && Array.isArray(builtIn.plugins)) presetTrees.push(builtIn.plugins)
    } catch {
      // a missing built-in preset is not fatal; the drawer simply lacks its modules
    }
  }
  addPresetOnlyPackages(ctx, inventory.packages, presetTrees)
  return {
    ok: true,
    profile: profileFacts(ctx),
    config: { sidebarEntry: config?.sidebarEntry !== false },
    revision: blockRevision(extractBlock(text) ?? ''),
    hmr: Boolean(ctx.get('hmr')?.reconcileProfile),
    presets,
    locks: model.locks,
    tombstones: model.tombstones,
    packages: inventory.packages,
    rowCount: inventory.rows,
    inactiveRows,
  }
}

/** Structured source of a preset that is not managed by this plugin. */
async function presetSource(ctx, id) {
  if (typeof id !== 'string' || id.length === 0) throw new Error('id is required')
  const builtIn = await readBuiltInPreset(id)
  if (builtIn !== null) {
    return {
      ok: true,
      id,
      kind: 'builtin',
      name: builtIn.name,
      description: builtIn.description,
      order: builtIn.order,
      plugins: cleanValue(builtIn.plugins),
      source: builtIn.source,
    }
  }
  const document = await readRegistryDocument(ctx, id)
  if (document !== null) {
    return {
      ok: true,
      id,
      kind: document.kind,
      name: document.name,
      description: document.description,
      plugins: cleanValue(document.plugins),
      yaml: document.yaml,
    }
  }
  return { ok: false, error: `preset source not found: ${id}` }
}

async function presetYaml(ctx, id) {
  if (typeof id !== 'string' || id.length === 0) throw new Error('id is required')
  const path = patchPathOf(ctx)
  const text = await readPatch(path)
  const model = parseBlock(extractBlock(text))
  const own = model.presets.find((preset) => preset.id === id)
  if (own !== undefined) {
    const row = {
      id: own.adopted === true && typeof own.rowId === 'string' ? own.rowId : `${ROW_PREFIX}${own.id}`,
      name: AGENT_PRESET,
      config: {
        id: own.id,
        ...(own.name === undefined ? {} : { name: own.name }),
        ...(own.description === undefined ? {} : { description: own.description }),
        ...(own.order === undefined ? {} : { order: own.order }),
        plugins: own.plugins,
      },
    }
    return { ok: true, id, kind: 'managed', yaml: `${emitListItem(row, 0).join('\n')}\n` }
  }
  const document = await readRegistryDocument(ctx, id)
  if (document !== null) {
    return { ok: true, id, kind: document.kind, yaml: document.yaml }
  }
  const builtIn = await readBuiltInPreset(id)
  if (builtIn !== null) {
    const row = {
      id: `${ROW_PREFIX}${id}`,
      name: AGENT_PRESET,
      config: {
        id,
        ...(builtIn.name === undefined ? {} : { name: builtIn.name }),
        ...(builtIn.description === undefined ? {} : { description: builtIn.description }),
        ...(builtIn.order === undefined ? {} : { order: builtIn.order }),
        plugins: builtIn.plugins,
      },
    }
    return { ok: true, id, kind: 'builtin', yaml: `${emitListItem(row, 0).join('\n')}\n` }
  }
  return { ok: false, error: `preset not found: ${id}` }
}

/** Render the draft preset as YAML without touching the profile. */
function yamlPreview(body) {
  const preset = body?.preset
  if (preset === null || typeof preset !== 'object' || Array.isArray(preset)) throw new Error('preset is required')
  if (typeof preset.id !== 'string' || preset.id.length === 0) throw new Error('preset id is required')
  const rowId = typeof body?.rowId === 'string' && body.rowId.length > 0 ? body.rowId : `${ROW_PREFIX}${preset.id}`
  const config = { id: preset.id }
  if (typeof preset.name === 'string' && preset.name.length > 0) config.name = preset.name
  if (typeof preset.description === 'string' && preset.description.length > 0) config.description = preset.description
  if (typeof preset.order === 'number' && Number.isFinite(preset.order)) config.order = preset.order
  config.plugins = Array.isArray(preset.plugins) ? preset.plugins : []
  return { ok: true, yaml: `${emitListItem({ id: rowId, name: AGENT_PRESET, config }, 0).join('\n')}\n` }
}

function conflictOf(body, blockText) {
  if (typeof body?.revision !== 'string') return null
  const current = blockRevision(blockText)
  if (body.revision === current) return null
  return {
    ok: false,
    conflict: true,
    error: 'the managed block changed since this page read it; reload before saving',
    revision: current,
  }
}

/** Write a new block, reconcile the profile, and roll back on failure. */
async function applyAndReconcile(ctx, path, previous, nextBlock) {
  await writePatch(path, replaceBlock(previous, nextBlock))
  const hmr = ctx.get('hmr')
  if (hmr === undefined || typeof hmr.reconcileProfile !== 'function' || typeof hmr.runExclusive !== 'function') {
    return {
      ok: true,
      applied: false,
      appliedNow: false,
      needsRestart: true,
      revision: blockRevision(nextBlock),
      message: 'saved; HMR is unavailable, restart the application to apply',
    }
  }
  try {
    const result = await hmr.runExclusive(() => hmr.reconcileProfile())
    return {
      ok: true,
      applied: true,
      appliedNow: true,
      needsRestart: result?.restartReason !== undefined,
      restartReason: result?.restartReason ?? null,
      warnings: Array.isArray(result?.warnings) ? result.warnings : [],
      revision: blockRevision(nextBlock),
    }
  } catch (error) {
    let rolledBack = false
    try {
      await writePatch(path, previous)
      await hmr.runExclusive(() => hmr.reconcileProfile())
      rolledBack = true
    } catch {
      rolledBack = false
    }
    return {
      ok: false,
      rolledBack,
      error: `applying the preset failed: ${messageOf(error)}`,
      revision: blockRevision(extractBlock(previous) ?? ''),
    }
  }
}

async function savePresets(ctx, config, body) {
  const presets = body?.presets
  const problems = validatePresets(presets)
  if (problems.length > 0) return { ok: false, error: 'invalid preset payload', problems }
  const path = patchPathOf(ctx)
  const previous = await readPatch(path)
  try {
    const parsed = parseYaml(previous)
    if (parsed !== null && !Array.isArray(parsed)) {
      return { ok: false, error: 'profile patch is not a top-level YAML array; refusing to write' }
    }
  } catch (error) {
    return { ok: false, error: `profile patch is not valid YAML: ${messageOf(error)}` }
  }
  const previousBlock = extractBlock(previous) ?? ''
  const conflict = conflictOf(body, previousBlock)
  if (conflict !== null) return conflict
  const current = parseBlock(previousBlock)
  current.tombstones = liveTombstones(ctx, current)
  const locked = new Set(current.locks)
  const adoptedRows = new Map(current.presets.filter((preset) => preset.adopted === true).map((preset) => [preset.id, preset.rowId]))
  const tombstones = [...current.tombstones]
  const removed = []
  const merged = []
  for (const preset of presets) {
    if (locked.has(preset.id)) {
      const own = current.presets.find((candidate) => candidate.id === preset.id)
      if (own !== undefined) {
        merged.push(own)
        continue
      }
    }
    const rowId = adoptedRows.get(preset.id)
    if (rowId !== undefined) merged.push({ ...preset, adopted: true, rowId })
    else merged.push({ ...preset, adopted: false })
  }
  for (const own of current.presets) {
    if (presets.some((preset) => preset.id === own.id)) continue
    removed.push(own.id)
    if (own.adopted === true && typeof own.rowId === 'string' && !tombstones.includes(own.rowId)) {
      tombstones.push(own.rowId)
    }
  }
  const locks = current.locks.filter((id) => !removed.includes(id))
  const probeProblems = await probePresets(ctx, merged)
  if (probeProblems.length > 0) {
    return { ok: false, error: 'preset composition cannot activate', problems: probeProblems }
  }
  const nextBlock = buildBlock({ presets: merged, tombstones, locks })
  return applyAndReconcile(ctx, path, previous, nextBlock)
}

/** Remove a preset: managed entries are dropped, adopted/foreign declarations are tombstoned. */
async function deletePreset(ctx, body) {
  const id = body?.id
  if (typeof id !== 'string' || id.length === 0) return { ok: false, error: 'id is required' }
  if (OFFICIAL_PRESETS.has(id)) return { ok: false, error: 'official presets cannot be deleted' }
  const path = patchPathOf(ctx)
  const previous = await readPatch(path)
  const previousBlock = extractBlock(previous) ?? ''
  const conflict = conflictOf(body, previousBlock)
  if (conflict !== null) return conflict
  const model = parseBlock(previousBlock)
  model.tombstones = liveTombstones(ctx, model)
  if (model.locks.includes(id)) return { ok: false, error: 'preset is locked; unlock it first' }
  const own = model.presets.find((preset) => preset.id === id)
  if (own !== undefined) {
    model.presets = model.presets.filter((preset) => preset.id !== id)
    if (own.adopted === true && typeof own.rowId === 'string' && !model.tombstones.includes(own.rowId)) {
      model.tombstones.push(own.rowId)
    }
  } else {
    const declaration = presetDeclarations(ctx).get(id)
    if (declaration === undefined) return { ok: false, error: `preset declaration not found: ${id}` }
    if (!model.tombstones.includes(declaration.rowId)) model.tombstones.push(declaration.rowId)
  }
  model.locks = model.locks.filter((lockId) => lockId !== id)
  return applyAndReconcile(ctx, path, previous, buildBlock(model))
}

/** Take management of another layer's declaration by overriding its Loader row. */
async function adoptPreset(ctx, body) {
  const id = body?.id
  if (typeof id !== 'string' || id.length === 0) return { ok: false, error: 'id is required' }
  if (OFFICIAL_PRESETS.has(id)) return { ok: false, error: 'official presets cannot be adopted' }
  const path = patchPathOf(ctx)
  const previous = await readPatch(path)
  const previousBlock = extractBlock(previous) ?? ''
  const conflict = conflictOf(body, previousBlock)
  if (conflict !== null) return conflict
  const model = parseBlock(previousBlock)
  model.tombstones = liveTombstones(ctx, model)
  if (model.locks.includes(id)) return { ok: false, error: 'preset is locked; unlock it first' }
  if (model.presets.some((preset) => preset.id === id)) return { ok: false, error: 'preset is already managed' }
  const declaration = presetDeclarations(ctx).get(id)
  if (declaration === undefined) {
    return { ok: false, error: 'cannot adopt: this preset has no Loader declaration row (it may be registered at runtime)' }
  }
  const config = declaration.config ?? {}
  const plugins = Array.isArray(config.plugins) ? cleanValue(config.plugins) : []
  const problems = await probePresets(ctx, [{ id, plugins }])
  if (problems.length > 0) return { ok: false, error: 'preset composition cannot activate', problems }
  model.presets.push({
    id,
    name: typeof config.name === 'string' ? config.name : undefined,
    description: typeof config.description === 'string' ? config.description : undefined,
    order: typeof config.order === 'number' ? config.order : undefined,
    plugins,
    rowId: declaration.rowId,
    adopted: true,
  })
  return applyAndReconcile(ctx, path, previous, buildBlock(model))
}

/** Lock or unlock a custom preset; locked presets are never rewritten. */
async function lockPreset(ctx, body) {
  const id = body?.id
  if (typeof id !== 'string' || id.length === 0) return { ok: false, error: 'id is required' }
  if (OFFICIAL_PRESETS.has(id)) return { ok: false, error: 'official presets are always read-only' }
  const path = patchPathOf(ctx)
  const previous = await readPatch(path)
  const previousBlock = extractBlock(previous) ?? ''
  const conflict = conflictOf(body, previousBlock)
  if (conflict !== null) return conflict
  const model = parseBlock(previousBlock)
  model.tombstones = liveTombstones(ctx, model)
  const locked = body?.locked === true
  model.locks = locked
    ? [...new Set([...model.locks, id])]
    : model.locks.filter((lockId) => lockId !== id)
  const nextBlock = buildBlock(model)
  await writePatch(path, replaceBlock(previous, nextBlock))
  return { ok: true, locked, revision: blockRevision(nextBlock), appliedNow: false }
}
