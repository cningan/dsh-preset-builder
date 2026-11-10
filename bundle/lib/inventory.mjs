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

function metaOf(ctx, name, base) {
  const packages = ctx.get('pluginPackages')
  if (packages === undefined || typeof packages.metaOf !== 'function') return undefined
  try {
    const meta = packages.metaOf(name, base)
    if (meta === null || typeof meta !== 'object') return undefined
    return {
      title: typeof meta.title === 'string' ? meta.title : undefined,
      description: typeof meta.description === 'string' ? meta.description : undefined,
      icon: typeof meta.icon === 'string' ? meta.icon : undefined,
    }
  } catch {
    return undefined
  }
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
      const meta = metaOf(ctx, moduleName, base)
      record = {
        name: packageName,
        title: meta?.title || packageName,
        description: meta?.description || '',
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
