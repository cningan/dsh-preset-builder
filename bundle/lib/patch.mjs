/**
 * Managed block inside the profile user patch layer.
 *
 * The block is the only region this plugin may rewrite. Everything before and
 * after it — comments, other patches, user rows — is preserved byte for byte.
 */
import { createHash } from 'node:crypto'
import { isJsExpr, parseYaml, emitListItem } from './yaml.mjs'

export const BEGIN = '# >>> dsh-preset-studio managed block — 预设工坊维护，请勿手改标记内部'
export const END = '# <<< dsh-preset-studio managed block'

export const AGENT_PRESET = '@deepseek-ai/dsh-agent-preset'
export const ROW_PREFIX = 'preset-studio-'

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
    return text.slice(0, located.start) + blockText + text.slice(located.end)
  }
  const emptyRoot = /^[ \t]*\[[ \t]*\][ \t]*$/m
  const match = emptyRoot.exec(text)
  if (match !== null) {
    return text.slice(0, match.index) + blockText + text.slice(match.index + match[0].length)
  }
  const separator = text.length === 0 || text.endsWith('\n') ? '' : '\n'
  return text + separator + blockText
}

/** Presets declared inside a managed block, in declaration order. */
export function readBlock(blockText) {
  if (typeof blockText !== 'string' || blockText.length === 0) return []
  let data
  try {
    data = parseYaml(blockText)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const presets = []
  for (const patch of data) {
    if (patch === null || typeof patch !== 'object' || !Array.isArray(patch.insert)) continue
    for (const row of patch.insert) {
      if (row === null || typeof row !== 'object') continue
      if (row.name !== AGENT_PRESET) continue
      const config = row.config
      if (config === null || typeof config !== 'object' || typeof config.id !== 'string') continue
      presets.push({
        id: config.id,
        name: typeof config.name === 'string' ? config.name : undefined,
        description: typeof config.description === 'string' ? config.description : undefined,
        order: typeof config.order === 'number' ? config.order : undefined,
        plugins: Array.isArray(config.plugins) ? config.plugins : [],
        rowId: typeof row.id === 'string' ? row.id : `${ROW_PREFIX}${config.id}`,
        kind: 'managed',
      })
    }
  }
  return presets
}

export function buildBlock(presets) {
  if (!Array.isArray(presets) || presets.length === 0) return ''
  const lines = [BEGIN, '- insert:']
  for (const preset of presets) {
    const config = { id: preset.id }
    if (typeof preset.name === 'string' && preset.name.length > 0) config.name = preset.name
    if (typeof preset.description === 'string' && preset.description.length > 0) config.description = preset.description
    if (typeof preset.order === 'number' && Number.isFinite(preset.order)) config.order = preset.order
    config.plugins = Array.isArray(preset.plugins) ? preset.plugins : []
    const row = {
      id: `${ROW_PREFIX}${preset.id}`,
      name: AGENT_PRESET,
      config,
    }
    lines.push(...emitListItem(row, 4))
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
