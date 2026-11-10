/**
 * Read model of the composition: packages and the rows they contribute.
 */
import { cleanValue } from './patch.mjs'
import { describeDisabledExpression } from './platform.mjs'

/** Package name of a module specifier: `@scope/name/sub` -> `@scope/name`. */
export function packageNameOf(specifier) {
  if (typeof specifier !== 'string') return ''
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/')
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier
  }
  return specifier.split('/')[0]
}

/** Describe a loader `disabled` value from an entry's raw options. */
export function describeDisabled(value) {
  if (value === undefined) return { kind: 'none' }
  if (typeof value === 'boolean') return { kind: 'static', value }
  if (typeof value === 'string') return describeDisabledExpression(value)
  if (value !== null && typeof value === 'object') {
    if (typeof value.__jsExpr === 'string') return describeDisabledExpression(value.__jsExpr)
    for (const key of ['text', 'source', 'value']) {
      if (typeof value[key] === 'string') return describeDisabledExpression(value[key])
    }
  }
  return { kind: 'unknown' }
}

/** Pick display text from a localized map, preferring Chinese. */
export function pickText(value) {
  if (typeof value === 'string' && value.trim() !== '') return value
  if (value === null || typeof value !== 'object') return undefined
  for (const key of ['zh', 'zh-cn', 'zh-hans', 'en']) {
    const text = value[key]
    if (typeof text === 'string' && text.trim() !== '') return text
  }
  for (const text of Object.values(value)) {
    if (typeof text === 'string' && text.trim() !== '') return text
  }
  return undefined
}

/** Normalize a `LocalizedText` value to a plain lowercase-id map. */
export function textMap(value) {
  if (typeof value === 'string') return value.trim() === '' ? undefined : { en: value }
  if (value === null || typeof value !== 'object') return undefined
  const map = {}
  for (const [key, text] of Object.entries(value)) {
    if (typeof text === 'string' && text.trim() !== '') map[String(key).toLowerCase()] = text
  }
  return Object.keys(map).length === 0 ? undefined : map
}

function metaOf(ctx, name, base) {
  const packages = ctx.get('pluginPackages')
  if (packages === undefined || typeof packages.metaOf !== 'function') return undefined
  try {
    const meta = packages.metaOf(name, base)
    if (meta === null || typeof meta !== 'object') return undefined
    return {
      title: pickText(meta.title),
      titles: textMap(meta.title),
      description: pickText(meta.description),
      descriptions: textMap(meta.description),
      icon: typeof meta.icon === 'string' ? meta.icon : undefined,
    }
  } catch {
    return undefined
  }
}

function slugOf(text) {
  const tail = String(text).replace(/^@/, '').split('/').pop()
  return tail.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'row'
}

/**
 * Add packages that are only mounted by presets: their modules never appear in
 * the Host loader. Rows found in preset trees become collectable, so the drawer
 * offers persona and friends without hand-typed module names.
 */
export function addPresetOnlyPackages(ctx, packages, trees) {
  const knownModules = new Set()
  for (const pkg of packages) {
    for (const row of pkg.rows) knownModules.add(row.moduleName)
  }
  const byPackage = new Map(packages.map((pkg) => [pkg.name, pkg]))
  const walk = (rows) => {
    for (const row of rows ?? []) {
      if (row === null || typeof row !== 'object') continue
      if (row.group === true && Array.isArray(row.config)) {
        walk(row.config)
        continue
      }
      if (typeof row.name !== 'string' || row.name.length === 0) continue
      if (row.name.startsWith('cordis:') || knownModules.has(row.name)) continue
      const packageName = packageNameOf(row.name)
      let record = byPackage.get(packageName)
      if (record === undefined) {
        const meta = metaOf(ctx, packageName, ctx?.baseUrl)
        record = {
          name: packageName,
          title: meta?.title || packageName,
          titles: meta?.titles,
          description: meta?.description || '',
          descriptions: meta?.descriptions,
          icon: meta?.icon,
          official: packageName.startsWith('@deepseek-ai/'),
          presetOnly: true,
          rows: [],
        }
        byPackage.set(packageName, record)
        packages.push(record)
      }
      const id = typeof row.id === 'string' && row.id.length > 0 ? row.id : slugOf(packageName)
      const existing = record.rows.find((candidate) => candidate.id === id && candidate.moduleName === row.name)
      if (existing !== undefined) {
        if (existing.config === undefined && row.config !== null && typeof row.config === 'object') {
          existing.config = cleanValue(row.config)
        }
        continue
      }
      const next = {
        id,
        moduleName: row.name,
        enabled: false,
        disabled: { kind: 'none' },
        source: 'preset',
      }
      if (row.config !== null && typeof row.config === 'object' && Object.keys(row.config).length > 0) {
        next.config = cleanValue(row.config)
      }
      record.rows.push(next)
    }
  }
  for (const tree of trees) walk(tree)
  for (const record of byPackage.values()) {
    record.rows.sort((a, b) => a.id.localeCompare(b.id))
  }
  packages.sort((a, b) => a.name.localeCompare(b.name))
  return packages
}

export function buildInventory(ctx) {
  const byPackage = new Map()
  let entries
  try {
    entries = [...ctx.loader.entries()]
  } catch {
    return { packages: [], rows: 0 }
  }
  let rowCount = 0
  for (const entry of entries) {
    const options = entry?.options ?? {}
    if (options.group === true) continue
    const moduleName = options.name
    if (typeof moduleName !== 'string' || moduleName.length === 0) continue
    if (moduleName.startsWith('cordis:')) continue
    const packageName = packageNameOf(moduleName)
    let record = byPackage.get(packageName)
    if (record === undefined) {
      const base = entry?.parent?.tree?.ctx?.baseUrl ?? ctx.baseUrl
      const meta = metaOf(ctx, packageName, base)
      record = {
        name: packageName,
        title: meta?.title || packageName,
        titles: meta?.titles,
        description: meta?.description || '',
        descriptions: meta?.descriptions,
        icon: meta?.icon,
        official: packageName.startsWith('@deepseek-ai/'),
        rows: [],
      }
      byPackage.set(packageName, record)
    }
    let enabled = true
    try {
      enabled = !entry.disabled
    } catch {
      enabled = false
    }
    let config = null
    try {
      config = cleanValue(options.config)
    } catch {
      config = null
    }
    record.rows.push({
      id: typeof options.id === 'string' ? options.id : '',
      moduleName,
      enabled,
      disabled: describeDisabled(options.disabled),
      config,
      source: 'global',
    })
    rowCount += 1
  }
  const packages = [...byPackage.values()]
    .map((record) => ({ ...record, rows: record.rows.sort((a, b) => a.id.localeCompare(b.id)) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return { packages, rows: rowCount }
}
