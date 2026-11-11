/**
 * Pure collectability and conflict rules shared by the client contract tests.
 *
 * The Web client ships as one plain-JS file, so it keeps a small copy of these
 * functions; test/unit.mjs treats this module as the golden contract. Keep the
 * two copies in sync when changing the matching rules.
 */

export function isGroup(row) {
  return row !== null && typeof row === 'object' && row.group === true && Array.isArray(row.config)
}

export function walkRows(rows, visit) {
  if (!Array.isArray(rows)) return
  for (const row of rows) {
    visit(row)
    if (isGroup(row)) walkRows(row.config, visit)
  }
}

export function rowState(row) {
  if (row.disabled === true) return 'disabled'
  if (row.disabled !== undefined && row.disabled !== null) return 'conditional'
  return 'enabled'
}

export function isCollectableRow(row) {
  if (row.bundleActive === false) {
    return row.disabled?.kind === 'static' || row.disabled?.kind === 'none'
  }
  return row.enabled === false && (row.disabled?.kind === 'static' || row.disabled?.kind === 'none')
}

/** Rows in a preset whose module also came from a bundle that is not active. */
export function inactiveUsage(preset, inactiveModules) {
  const found = new Map()
  walkRows(preset?.plugins, (row) => {
    const hit = inactiveModules.get(row.name)
    if (hit !== undefined && !found.has(row.name)) {
      found.set(row.name, { moduleName: row.name, bundle: hit.bundle, bundleEnabled: hit.bundleEnabled })
    }
  })
  return [...found.values()]
}

/**
 * A preset row conflicts only with an active Host row that has the same Loader
 * row id. The same module under different ids is a scoped use (for example
 * Standard's skill-filesystem and the Host's skill-filesystem-global).
 */
export function conflictUsage(preset, activeRowIds) {
  const found = []
  const seen = new Set()
  walkRows(preset?.plugins, (row) => {
    if (row.disabled === true || typeof row.id !== 'string' || row.id.length === 0) return
    const hit = activeRowIds.get(row.id)
    if (hit === undefined) return
    const key = row.id + '|' + row.name
    if (seen.has(key)) return
    seen.add(key)
    found.push({ id: row.id, name: row.name, hostModule: hit.moduleName, packageName: hit.packageName })
  })
  return found
}
