/**
 * Managed block inside the profile user patch layer.
 *
 * The block is the only region this plugin may rewrite. Everything before and
 * after it — comments, other patches, user rows — is preserved byte for byte.
 *
 * A block holds three kinds of entries:
 *  - `- insert:` rows created by this plugin (`preset-studio-<id>`);
 *  - override rows that adopt a declaration another layer already made, keyed
 *    by that declaration's Loader row id;
 *  - tombstones (`- id: <row>\n  disabled: true`) that suppress a declaration
 *    the plugin no longer manages but must not resurrect.
 * The `# locks:` comment keeps the ids the user opted out of management.
 */
import { createHash } from 'node:crypto'
import { isJsExpr, parseYaml, emitListItem } from './yaml.mjs'

export const BEGIN = '# >>> dsh-preset-studio managed block — 预设工坊维护，请勿手改标记内部'
export const END = '# <<< dsh-preset-studio managed block'

export const AGENT_PRESET = '@deepseek-ai/dsh-agent-preset'
export const ROW_PREFIX = 'preset-studio-'
const LOCK_LINE = /^#\s*locks:\s*(.*)$/m

export function blockRevision(blockText) {
  return createHash('sha1').update(blockText ?? '').digest('hex')
}

/** Locate the managed block by its marker lines. */
export function locateBlock(text) {
  const beginAt = text.indexOf(BEGIN)
  if (beginAt < 0) return { found: false, start: -1, end: -1 }
  const endAt = text.indexOf(END, beginAt)
  if (endAt < 0) return { found: false, start: -1, end: -1, broken: true }
  let end = endAt + END.length
  if (text[end] === '\r') end += 1
  if (text[end] === '\n') end += 1
  return { found: true, start: beginAt, end }
}

export function extractBlock(text) {
  const located = locateBlock(text)
  if (!located.found) return null
  return text.slice(located.start, located.end)
}

/** Replace (or create) the managed block without touching the rest. */
export function replaceBlock(text, blockText) {
  const located = locateBlock(text)
  if (located.found) {
    return ensureArrayRoot(text.slice(0, located.start) + blockText + text.slice(located.end))
  }
  const emptyRoot = /^[ \t]*\[[ \t]*\][ \t]*$/m
  const match = emptyRoot.exec(text)
  if (match !== null) {
    return ensureArrayRoot(text.slice(0, match.index) + blockText + text.slice(match.index + match[0].length))
  }
  const separator = text.length === 0 || text.endsWith('\n') ? '' : '\n'
  return ensureArrayRoot(text + separator + blockText)
}

/**
 * Keep the profile patch a top-level YAML array.
 *
 * Removing the last managed entry can leave an empty document (or comments
 * only); Loader refuses such a file, so an explicit `[]` anchors it again.
 */
function ensureArrayRoot(text) {
  if (text.trim().length === 0) return '[]\n'
  let parsed
  try {
    parsed = parseYaml(text)
  } catch {
    return text
  }
  if (parsed !== null && parsed !== undefined) return text
  return text + (text.endsWith('\n') ? '' : '\n') + '[]\n'
}

function presetOf(config, rowId, adopted) {
  if (config === null || typeof config !== 'object' || typeof config.id !== 'string') return null
  return {
    id: config.id,
    name: typeof config.name === 'string' ? config.name : undefined,
    description: typeof config.description === 'string' ? config.description : undefined,
    order: typeof config.order === 'number' ? config.order : undefined,
    plugins: Array.isArray(config.plugins) ? config.plugins : [],
    rowId,
    adopted,
  }
}

/** The complete managed model held by one block. */
export function parseBlock(blockText) {
  const empty = { found: false, presets: [], tombstones: [], locks: [] }
  if (typeof blockText !== 'string' || blockText.length === 0) return empty
  const lockMatch = LOCK_LINE.exec(blockText)
  const locks = lockMatch === null
    ? []
    : lockMatch[1].split(',').map((value) => value.trim()).filter((value) => value.length > 0)
  let data
  try {
    data = parseYaml(blockText)
  } catch {
    return { ...empty, found: true, locks }
  }
  if (!Array.isArray(data)) return { ...empty, found: true, locks }
  const presets = []
  const tombstones = []
  const seen = new Set()
  for (const patch of data) {
    if (patch === null || typeof patch !== 'object') continue
    if (Array.isArray(patch.insert)) {
      for (const row of patch.insert) {
        if (row === null || typeof row !== 'object') continue
        if (typeof row.name !== 'string' || row.name.length === 0) continue
        const preset = presetOf(row.config, typeof row.id === 'string' ? row.id : `${ROW_PREFIX}${row.config?.id ?? ''}`, false)
        if (preset === null || seen.has(preset.id)) continue
        seen.add(preset.id)
        presets.push(preset)
      }
      continue
    }
    if (typeof patch.id !== 'string' || patch.id.length === 0) continue
    if (patch.disabled === true) {
      if (!tombstones.includes(patch.id)) tombstones.push(patch.id)
      continue
    }
    const preset = presetOf(patch.config, patch.id, true)
    if (preset === null || seen.has(preset.id)) continue
    seen.add(preset.id)
    presets.push(preset)
  }
  return { found: true, presets, tombstones, locks }
}

/** Presets declared inside a managed block, in declaration order. */
export function readBlock(blockText) {
  return parseBlock(blockText).presets
}

function presetConfig(preset) {
  const config = { id: preset.id }
  if (typeof preset.name === 'string' && preset.name.length > 0) config.name = preset.name
  if (typeof preset.description === 'string' && preset.description.length > 0) config.description = preset.description
  if (typeof preset.order === 'number' && Number.isFinite(preset.order)) config.order = preset.order
  config.plugins = Array.isArray(preset.plugins) ? preset.plugins : []
  return config
}

/** Render a managed model back into a block; an empty model removes it. */
export function buildBlock(model) {
  const presets = Array.isArray(model) ? model : (model?.presets ?? [])
  const tombstones = Array.isArray(model?.tombstones) ? model.tombstones : []
  const locks = Array.isArray(model?.locks) ? model.locks.filter((id) => typeof id === 'string' && id.length > 0) : []
  if (presets.length === 0 && tombstones.length === 0 && locks.length === 0) return ''
  const lines = [BEGIN]
  if (locks.length > 0) lines.push(`# locks: ${locks.join(', ')}`)
  const created = presets.filter((preset) => preset.adopted !== true)
  if (created.length > 0) {
    lines.push('- insert:')
    for (const preset of created) {
      lines.push(...emitListItem({
        id: `${ROW_PREFIX}${preset.id}`,
        name: AGENT_PRESET,
        config: presetConfig(preset),
      }, 4))
    }
  }
  for (const preset of presets.filter((candidate) => candidate.adopted === true)) {
    if (typeof preset.rowId !== 'string' || preset.rowId.length === 0) continue
    lines.push(...emitListItem({
      id: preset.rowId,
      name: AGENT_PRESET,
      config: presetConfig(preset),
    }, 0))
  }
  for (const rowId of tombstones) {
    lines.push(...emitListItem({ id: rowId, disabled: true }, 0))
  }
  lines.push(END)
  return `${lines.join('\n')}\n`
}

/** Structured value cleaning: loader JS expressions become `{ __js }`. */
export function cleanValue(value, depth = 0) {
  if (depth > 24) return null
  if (value === null || value === undefined) return value ?? null
  if (typeof value === 'function' || typeof value === 'symbol') return null
  if (typeof value !== 'object') return value
  if (isJsExpr(value)) return value
  if (Array.isArray(value)) return value.map((item) => cleanValue(item, depth + 1))
  if (typeof value.__jsExpr === 'string') return { __js: value.__jsExpr }
  const result = {}
  for (const [key, child] of Object.entries(value)) {
    if (child === undefined) continue
    result[key] = cleanValue(child, depth + 1)
  }
  return result
}

export function validatePresets(presets) {
  const problems = []
  if (!Array.isArray(presets)) return ['presets must be an array']
  const seen = new Set()
  for (const preset of presets) {
    if (preset === null || typeof preset !== 'object') { problems.push('preset must be an object'); continue }
    if (typeof preset.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(preset.id)) {
      problems.push(`invalid preset id: ${JSON.stringify(preset.id)}`)
      continue
    }
    if (seen.has(preset.id)) problems.push(`duplicate preset id: ${preset.id}`)
    seen.add(preset.id)
    if (!Array.isArray(preset.plugins)) { problems.push(`${preset.id}: plugins must be an array`); continue }
    const rowIds = new Set()
    for (const row of preset.plugins) {
      if (row === null || typeof row !== 'object') { problems.push(`${preset.id}: row must be an object`); continue }
      if (typeof row.name !== 'string' || row.name.length === 0) { problems.push(`${preset.id}: row name is required`); continue }
      if (typeof row.id !== 'string' || row.id.length === 0) { problems.push(`${preset.id}: row id is required`); continue }
      if (rowIds.has(row.id)) problems.push(`${preset.id}: duplicate row id ${row.id}`)
      rowIds.add(row.id)
    }
  }
  return problems
}
