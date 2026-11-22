/**
 * Managed module inside the profile user patch layer.
 *
 * The module is a run of top-level entries this plugin owns:
 *  - `- insert:` rows created by this plugin (`preset-studio-<id>`);
 *  - override rows that adopt a declaration another layer already made;
 *  - tombstones (`- id: <row>\n  disabled: true`);
 *  - the `# locks:` comment.
 *
 * Ownership comes from the entries themselves, not from a closing marker.
 * DSH config editor appends rows with `document.add()`; a closing YAML comment
 * sits before those appended rows, so an append would land inside the module.
 * The module therefore has no closing marker at all. The opening comment is
 * documentation only: a lost or edited comment never hides the entries.
 */
import { createHash } from 'node:crypto'
import { isJsExpr, parseYaml, emitListItem } from './yaml.mjs'

export const BEGIN = '# >>> dsh-preset-builder managed block — 预设工坊维护，请勿手改标记内部'
export const LEGACY_BEGIN = '# >>> dsh-preset-studio managed block — 预设工坊维护，请勿手改标记内部'
/** Closing markers written before 0.8.0; dropped on the next save. */
export const END = '# <<< dsh-preset-builder managed block'
export const LEGACY_END = '# <<< dsh-preset-studio managed block'

export const AGENT_PRESET = '@deepseek-ai/dsh-agent-preset'
export const ROW_PREFIX = 'preset-studio-'
const LOCK_LINE = /^#\s*locks:\s*(.*)$/m
const TOP_LEVEL_ROW = /^-(?:[ \t]|$)/
const LOCK_COMMENT = /^#\s*locks:/
const MODULE_START = /^#\s*>>>\s+\S.*managed block/
const BEGIN_MARKERS = [BEGIN, LEGACY_BEGIN]
const END_MARKERS = [END, LEGACY_END]

function isBeginMarker(line) {
  return BEGIN_MARKERS.includes(line)
}

function isEndMarker(line) {
  return END_MARKERS.includes(line)
}

export function blockRevision(blockText) {
  return createHash('sha1').update(blockText ?? '').digest('hex')
}

/**
 * Whether a top-level patch entry can only have been written by this plugin.
 *
 * Anything that is not provably ours is foreign content: it must stay in the
 * file, but it does not belong to the module.
 */
function isOwnedEntry(entry) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return false
  if (Array.isArray(entry.insert)) {
    if (entry.insert.length === 0) return false
    return entry.insert.every((row) => row !== null && typeof row === 'object' && !Array.isArray(row)
      && row.name === AGENT_PRESET
      && typeof row.id === 'string'
      && row.id.startsWith(ROW_PREFIX)
      && row.config !== null && typeof row.config === 'object' && typeof row.config.id === 'string')
  }
  if (typeof entry.id !== 'string' || entry.id.length === 0) return false
  if (entry.name === AGENT_PRESET) {
    return entry.config !== null && typeof entry.config === 'object' && typeof entry.config.id === 'string'
  }
  return entry.disabled === true && entry.name === undefined && entry.config === undefined
}

/** Drop closing markers written by older versions; they are not content. */
function stripLegacyEnd(text) {
  if (typeof text !== 'string' || text.length === 0) return text
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const lines = text.split(eol)
  const kept = lines.filter((line) => !isEndMarker(line.trim()))
  if (kept.length === lines.length) return text
  return kept.join(eol)
}

/**
 * Scan the module: owned entries, foreign rows that sit inside it, and the
 * tail after the last owned entry.
 *
 * @returns `{ found, start, end, foreign, legacy, missingComment }`;
 *   `start`/`end` are character offsets of the region a save rewrites.
 */
export function scanModule(text) {
  const empty = { found: false, start: -1, end: -1, foreign: [], legacy: false, missingComment: false }
  if (typeof text !== 'string' || text.length === 0) return empty
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const lines = text.split(eol)
  const offsets = []
  let offset = 0
  for (const line of lines) {
    offsets.push(offset)
    offset += line.length + eol.length
  }
  const items = []
  let current = null
  const flush = () => {
    if (current === null) return
    while (current.lines.length > 1 && current.lines[current.lines.length - 1].trim() === '') current.lines.pop()
    current.lineEnd = current.lineStart + current.lines.length - 1
    items.push(current)
    current = null
  }
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed === '') { if (current !== null) current.lines.push(line); continue }
    if (TOP_LEVEL_ROW.test(line)) {
      flush()
      current = { kind: 'entry', lineStart: i, lines: [line] }
      continue
    }
    if (/^[ \t]*#/.test(line)) {
      if (current !== null && /^[ \t]+#/.test(line)) { current.lines.push(line); continue }
      flush()
      current = { kind: 'comment', lineStart: i, lines: [line] }
      continue
    }
    if (current !== null) current.lines.push(line)
    else current = { kind: 'other', lineStart: i, lines: [line] }
  }
  flush(lines.length - 1)
  let legacy = false
  let beginLine = -1
  const classified = []
  for (const item of items) {
    if (item.kind === 'comment') {
      const trimmed = item.lines[0].trim()
      if (isBeginMarker(trimmed)) {
        legacy = legacy || trimmed === LEGACY_BEGIN
        beginLine = item.lineStart
        classified.push({ ...item, owned: true, discard: false })
        continue
      }
      if (isEndMarker(trimmed)) {
        classified.push({ ...item, owned: false, discard: true })
        continue
      }
      if (LOCK_COMMENT.test(item.lines[0])) {
        classified.push({ ...item, owned: true, discard: false })
        continue
      }
      if (MODULE_START.test(trimmed)) {
        classified.push({ ...item, owned: false, discard: false, stop: true })
        break
      }
      classified.push({ ...item, owned: false, discard: false })
      continue
    }
    if (item.kind === 'entry') {
      let parsed
      try { parsed = parseYaml(item.lines.join(eol)) } catch { parsed = null }
      const owned = Array.isArray(parsed) && parsed.length === 1 && isOwnedEntry(parsed[0])
      classified.push({ ...item, owned, discard: false })
      continue
    }
    classified.push({ ...item, owned: false, discard: false })
  }
  const ownedItems = classified.filter((item) => item.owned && !item.discard)
  const ownedEntries = ownedItems.filter((item) => item.kind === 'entry')
  // A comment alone is not a module: the entries are the contract.
  if (ownedEntries.length === 0) return empty
  const firstOwned = ownedItems[0].lineStart
  const lastOwned = ownedEntries[ownedEntries.length - 1].lineEnd
  const startLine = beginLine >= 0 && beginLine < firstOwned ? beginLine : firstOwned
  const start = offsets[startLine]
  const end = offsets[lastOwned] + lines[lastOwned].length + eol.length
  const foreign = []
  for (const item of classified) {
    if (item.owned || item.discard) continue
    if (item.lineStart < startLine || item.lineStart > lastOwned) continue
    foreign.push(item.lines.join(eol))
  }
  return { found: true, start, end, foreign, legacy, missingComment: beginLine < 0 }
}

/**
 * Locate the module. `start`/`end` are the region a save rewrites; foreign
 * rows inside it move above the module on the next write.
 */
export function locateBlock(text) {
  const scanned = scanModule(text)
  return {
    found: scanned.found,
    start: scanned.start,
    end: scanned.end,
    legacy: scanned.legacy,
    missingComment: scanned.missingComment,
    // The content-owned module has no marker pair that can break; the field
    // stays for callers written against the marker model.
    broken: false,
  }
}

export function extractBlock(text) {
  const located = locateBlock(text)
  if (!located.found) return null
  return text.slice(located.start, located.end)
}

/**
 * The module exists but its opening comment is gone. The comment is only
 * documentation, so this is a repair suggestion, not an error.
 */
export function findOrphanBlock(text) {
  const scanned = scanModule(text)
  if (!scanned.found || !scanned.missingComment) return null
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const startLine = text.slice(0, scanned.start).split(eol).length - 1
  const rows = []
  let parsed
  try { parsed = parseYaml(text.slice(scanned.start, scanned.end)) } catch { parsed = null }
  if (Array.isArray(parsed)) {
    for (const entry of parsed) {
      if (entry && Array.isArray(entry.insert)) {
        for (const row of entry.insert) {
          if (row && typeof row.id === 'string') rows.push(row.id)
        }
      }
    }
  }
  return { line: startLine, rows }
}

/** Put the opening comment back above a module that lost it. */
export function insertBeginMarker(text) {
  const found = findOrphanBlock(text)
  if (found === null) return null
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const lines = text.split(eol)
  lines.splice(found.line, 0, BEGIN)
  return stripLegacyEnd(lines.join(eol))
}

/** Replace (or create) the module without touching the rest. */
export function replaceBlock(text, blockText) {
  const scanned = scanModule(text)
  if (scanned.found) {
    const head = text.slice(0, scanned.start)
    const moved = scanned.foreign.length === 0 ? '' : scanned.foreign.join('\n') + '\n'
    const prefix = head.length > 0 && !head.endsWith('\n') ? head + '\n' : head
    return ensureArrayRoot(prefix + moved + blockText + stripLegacyEnd(text.slice(scanned.end)))
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