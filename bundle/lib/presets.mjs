/**
 * Preset sources.
 *
 * Managed presets are read from the managed block. Built-in presets are read
 * from the shipped bundle's preset patch files, which keep groups, isolate and
 * `!!js` expressions that the registry's viewing API flattens away.
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { AGENT_PRESET } from './patch.mjs'
import { parseYaml } from './yaml.mjs'

const BUILT_IN = new Set(['minimal', 'standard', 'ptc', 'cordis'])

export function isBuiltInPresetId(id) {
  return BUILT_IN.has(id)
}

/** Locate the `dsh` installation root when the app is packaged. */
export function installRoot() {
  const candidates = []
  if (typeof process.resourcesPath === 'string' && process.resourcesPath.length > 0) {
    candidates.push(join(process.resourcesPath, 'app.asar', 'dsh'))
    candidates.push(join(process.resourcesPath, 'app', 'dsh'))
  }
  candidates.push(join(dirname(process.execPath), 'resources', 'app.asar', 'dsh'))
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'node_modules', '@deepseek-ai', 'dsh-web-app', 'presets'))) return candidate
  }
  return undefined
}

function presetFileCandidates(root, id) {
  const base = join(root, 'node_modules', '@deepseek-ai', 'dsh-web-app', 'presets')
  return [
    join(base, `${id}.patch.yml`),
    join(base, `${id}.patch.yaml`),
  ]
}

/** Read the declaration of a built-in preset from its shipped patch file. */
export async function readBuiltInPreset(id) {
  const root = installRoot()
  if (root === undefined) return null
  for (const file of presetFileCandidates(root, id)) {
    let text
    try {
      text = await readFile(file, 'utf8')
    } catch {
      continue
    }
    let data
    try {
      data = parseYaml(text)
    } catch {
      continue
    }
    if (!Array.isArray(data)) continue
    for (const patch of data) {
      if (patch === null || typeof patch !== 'object' || !Array.isArray(patch.insert)) continue
      for (const row of patch.insert) {
        if (row === null || typeof row !== 'object') continue
        if (row.name !== AGENT_PRESET) continue
        const config = row.config
        if (config === null || typeof config !== 'object') continue
        if (config.id !== id) continue
        return {
          id,
          name: typeof config.name === 'string' ? config.name : undefined,
          description: typeof config.description === 'string' ? config.description : undefined,
          order: typeof config.order === 'number' ? config.order : undefined,
          plugins: Array.isArray(config.plugins) ? config.plugins : [],
          kind: 'builtin',
          source: file,
        }
      }
    }
  }
  return null
}

/** Registry viewing API, used when no source file is reachable. */
export async function readRegistryDocument(ctx, id) {
  const presets = ctx.get('agentPresets')
  if (presets === undefined || typeof presets.readDocument !== 'function') return null
  try {
    const document = await presets.readDocument(id)
    if (document === null || typeof document !== 'object') return null
    let plugins = []
    try {
      const parsed = parseYaml(String(document.content ?? ''))
      if (Array.isArray(parsed)) plugins = parsed
    } catch {
      plugins = []
    }
    return {
      id,
      name: typeof document.name === 'string' ? document.name : undefined,
      description: typeof document.description === 'string' ? document.description : undefined,
      plugins,
      kind: 'view',
      yaml: typeof document.content === 'string' ? document.content : '',
    }
  } catch {
    return null
  }
}
