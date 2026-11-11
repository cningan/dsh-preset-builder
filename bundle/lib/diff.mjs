/**
 * Preset comparison contract.
 *
 * A preset's composition is a tree of groups and leaf plugin rows. Comparing
 * two presets means aligning their leaf rows by Loader row id and reporting
 * presence, effective enabled state (a row inside a disabled group is disabled
 * too), config differences and group-path differences.
 *
 * The Web client ships as one plain-JS file, so it keeps a small copy of these
 * functions; test/unit.mjs treats this module as the golden contract. Keep the
 * two copies in sync when changing the comparison rules.
 */

export function isGroupRow(row) {
  return row !== null && typeof row === 'object' && row.group === true && Array.isArray(row.config)
}

/** State declared on the row itself: enabled, statically disabled or conditional. */
export function ownRowState(row) {
  if (row.disabled === true) return 'disabled'
  if (row.disabled !== undefined && row.disabled !== null) return 'conditional'
  return 'enabled'
}

/** A disabled group disables its children; a conditional group makes them conditional. */
export function combineRowState(inherited, own) {
  if (inherited === 'disabled' || own === 'disabled') return 'disabled'
  if (inherited === 'conditional' || own === 'conditional') return 'conditional'
  return 'enabled'
}

/** Stable JSON used to decide whether two configs are the same value. */
export function canonicalConfig(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(canonicalConfig).join(',') + ']'
  const keys = Object.keys(value).sort()
  if (keys.length === 0) return 'null'
  return '{' + keys.map((key) => JSON.stringify(key) + ':' + canonicalConfig(value[key])).join(',') + '}'
}

/**
 * Flatten a config object into leaf fields (`a.b[0].c`), so two rows can be
 * compared field by field rather than as one opaque blob.
 */
export function configFields(value, prefix = '', out = []) {
  if (value === null || value === undefined) {
    out.push({ path: prefix, value: null })
    return out
  }
  if (typeof value !== 'object') {
    out.push({ path: prefix, value })
    return out
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      out.push({ path: prefix, value: [] })
      return out
    }
    value.forEach((item, index) => configFields(item, prefix + '[' + index + ']', out))
    return out
  }
  const keys = Object.keys(value).sort()
  if (keys.length === 0) {
    out.push({ path: prefix, value: {} })
    return out
  }
  for (const key of keys) {
    configFields(value[key], prefix.length === 0 ? key : prefix + '.' + key, out)
  }
  return out
}

/**
 * Field-level differences between two configs. Each entry is `added`,
 * `removed` or `changed`; equal fields are omitted.
 */
export function configFieldDiff(left, right) {
  const leftFields = new Map(configFields(left).map((field) => [field.path, field.value]))
  const rightFields = new Map(configFields(right).map((field) => [field.path, field.value]))
  const paths = [...new Set([...leftFields.keys(), ...rightFields.keys()])].sort()
  const diff = []
  for (const path of paths) {
    const hasLeft = leftFields.has(path)
    const hasRight = rightFields.has(path)
    const leftValue = leftFields.get(path)
    const rightValue = rightFields.get(path)
    if (hasLeft && hasRight && canonicalConfig(leftValue) === canonicalConfig(rightValue)) continue
    diff.push({
      path,
      left: hasLeft ? leftValue : undefined,
      right: hasRight ? rightValue : undefined,
      kind: !hasLeft ? 'added' : !hasRight ? 'removed' : 'changed',
    })
  }
  return diff
}

/**
 * Flatten a preset composition into leaf rows.
 *
 * @param {unknown} rows `config.plugins` of a preset declaration.
 * @returns {{ leaves: object[], groups: object[] }} Leaves carry the effective
 *   state, the declared state, the group path and the row config.
 */
export function flattenPresetRows(rows) {
  const leaves = []
  const groups = []
  const visit = (list, path, inherited) => {
    if (!Array.isArray(list)) return
    for (const row of list) {
      if (row === null || typeof row !== 'object') continue
      if (isGroupRow(row)) {
        const state = combineRowState(inherited, ownRowState(row))
        groups.push({ id: typeof row.id === 'string' ? row.id : '', name: typeof row.name === 'string' ? row.name : '', path: [...path], state })
        visit(row.config, [...path, typeof row.id === 'string' ? row.id : ''], state)
        continue
      }
      leaves.push({
        id: typeof row.id === 'string' && row.id.length > 0 ? row.id : undefined,
        name: typeof row.name === 'string' ? row.name : '',
        path: [...path],
        state: combineRowState(inherited, ownRowState(row)),
        declared: ownRowState(row),
        config: row.config === undefined ? null : row.config,
        configKey: canonicalConfig(row.config),
      })
    }
  }
  visit(rows, [], 'enabled')
  return { leaves, groups }
}

function indexLeaves(leaves) {
  const map = new Map()
  const order = []
  for (const leaf of leaves) {
    const base = leaf.id ?? 'name:' + leaf.name
    let key = base
    let index = 2
    while (map.has(key)) {
      key = base + '#' + index
      index += 1
    }
    map.set(key, leaf)
    order.push(key)
  }
  return { map, order }
}

function samePath(left, right) {
  if (left.length !== right.length) return false
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false
  }
  return true
}

/**
 * Align two presets' leaf rows.
 *
 * Returns items in the left preset's order followed by rows only the right
 * preset declares. Each item carries a primary `status` and the individual
 * difference flags so the UI can group and annotate rows.
 */
export function diffPresetRows(leftRows, rightRows) {
  const left = indexLeaves(flattenPresetRows(leftRows).leaves)
  const right = indexLeaves(flattenPresetRows(rightRows).leaves)
  const keys = [...left.order, ...right.order.filter((key) => !left.map.has(key))]
  const items = []
  const summary = {
    leftRows: left.map.size,
    rightRows: right.map.size,
    leftEnabled: 0,
    rightEnabled: 0,
    leftConditional: 0,
    rightConditional: 0,
    onlyLeft: 0,
    onlyRight: 0,
    stateDiff: 0,
    configDiff: 0,
    pathDiff: 0,
    same: 0,
  }
  for (const key of keys) {
    const a = left.map.get(key)
    const b = right.map.get(key)
    if (a !== undefined) {
      if (a.state === 'enabled') summary.leftEnabled += 1
      if (a.state === 'conditional') summary.leftConditional += 1
    }
    if (b !== undefined) {
      if (b.state === 'enabled') summary.rightEnabled += 1
      if (b.state === 'conditional') summary.rightConditional += 1
    }
    const item = {
      key,
      id: a?.id ?? b?.id,
      name: a?.name ?? b?.name ?? '',
      left: a === undefined ? { present: false } : { present: true, state: a.state, declared: a.declared, path: a.path, config: a.config },
      right: b === undefined ? { present: false } : { present: true, state: b.state, declared: b.declared, path: b.path, config: b.config },
      status: 'same',
      stateDiff: false,
      configDiff: false,
      pathDiff: false,
    }
    if (a === undefined) {
      item.status = 'only-right'
    } else if (b === undefined) {
      item.status = 'only-left'
    } else {
      item.stateDiff = a.state !== b.state
      item.configDiff = a.configKey !== b.configKey
      item.pathDiff = !samePath(a.path, b.path)
      if (item.stateDiff) item.status = 'state'
      else if (item.configDiff) item.status = 'config'
      else if (item.pathDiff) item.status = 'path'
    }
    if (item.status === 'only-left') summary.onlyLeft += 1
    else if (item.status === 'only-right') summary.onlyRight += 1
    else if (item.status === 'state') summary.stateDiff += 1
    else if (item.status === 'config') summary.configDiff += 1
    else if (item.status === 'path') summary.pathDiff += 1
    else summary.same += 1
    items.push(item)
  }
  return { items, summary }
}
