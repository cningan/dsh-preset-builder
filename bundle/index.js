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
import { buildInventory } from './lib/inventory.mjs'
import {
  AGENT_PRESET,
  ROW_PREFIX,
  blockRevision,
  buildBlock,
  cleanValue,
  extractBlock,
  readBlock,
  replaceBlock,
  validatePresets,
} from './lib/patch.mjs'
import { readBuiltInPreset, readRegistryDocument } from './lib/presets.mjs'
import { emitListItem, parseYaml } from './lib/yaml.mjs'

export const name = 'dsh-preset-studio'

export const inject = ['webServer']

export const Config = Schema.object({
  sidebarEntry: Schema.boolean().default(true)
    .description('在左侧栏显示「预设工坊」入口（Show the Preset Workshop entry in the left sidebar）'),
})

const PREFIX = '/plugins/preset-studio'
const BODY_LIMIT = 1024 * 1024

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

function sameOrigin(server, req) {
  let expected
  try {
    expected = server.getOrigin()
  } catch {
    expected = undefined
  }
  const origin = req.headers?.origin
  if (typeof origin === 'string' && origin.length > 0) {
    return expected !== undefined ? origin === expected : false
  }
  const host = req.headers?.host
  if (typeof expected === 'string' && typeof host === 'string') {
    try {
      return new URL(expected).host === host
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

async function buildState(ctx, config) {
  const path = ctx.get('profileContext')?.patchPath
  const text = typeof path === 'string' && path.length > 0 ? await readPatch(path) : '[]\n'
  const block = extractBlock(text)
  const managed = block === null ? [] : readBlock(block)
  const registry = await listRegistryPresets(ctx)
  const managedById = new Map(managed.map((preset) => [preset.id, preset]))
  const presets = []
  for (const row of registry) {
    const own = managedById.get(row.id)
    if (own !== undefined) {
      managedById.delete(row.id)
      presets.push({ ...row, ...own, plugins: cleanValue(own.plugins) })
    } else {
      presets.push({ ...row, kind: row.name === undefined ? 'builtin' : 'external' })
    }
  }
  for (const own of managedById.values()) {
    presets.push({ ...own, plugins: cleanValue(own.plugins), pending: true })
  }
  presets.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.id.localeCompare(b.id))
  const inventory = buildInventory(ctx)
  return {
    ok: true,
    profile: profileFacts(ctx),
    config: { sidebarEntry: config?.sidebarEntry !== false },
    revision: blockRevision(block ?? ''),
    hmr: Boolean(ctx.get('hmr')?.reconcileProfile),
    presets,
    packages: inventory.packages,
    rowCount: inventory.rows,
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
  const block = extractBlock(text)
  const managed = block === null ? [] : readBlock(block)
  const own = managed.find((preset) => preset.id === id)
  if (own !== undefined) {
    const row = {
      id: own.rowId ?? `${ROW_PREFIX}${own.id}`,
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
  if (typeof body?.revision === 'string' && body.revision !== blockRevision(previousBlock)) {
    return {
      ok: false,
      conflict: true,
      error: 'the managed block changed since this page read it; reload before saving',
      revision: blockRevision(previousBlock),
    }
  }
  const nextBlock = buildBlock(presets)
  const next = replaceBlock(previous, nextBlock)
  await writePatch(path, next)

  const hmr = ctx.get('hmr')
  if (hmr === undefined || typeof hmr.reconcileProfile !== 'function' || typeof hmr.runExclusive !== 'function') {
    return {
      ok: true,
      applied: false,
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
      revision: blockRevision(previousBlock),
    }
  }
}
