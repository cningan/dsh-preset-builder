/**
 * YAML helpers for preset declarations.
 *
 * `!!js` tags are kept as `{ __js: 'expression text' }` so they survive a
 * round trip through the client and back into the profile patch.
 */
import { parse } from 'yaml'

const JS_TAG = {
  // `!!js` resolves to the full tag URI; the shorthand alone does not match.
  tag: 'tag:yaml.org,2002:js',
  resolve: (value) => ({ __js: typeof value === 'string' ? value : String(value) }),
}

export function parseYaml(text) {
  return parse(text, { customTags: [JS_TAG] })
}

export function isJsExpr(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && typeof value.__js === 'string'
    && Object.keys(value).length === 1
}

const BARE_KEY = /^[A-Za-z0-9_$][A-Za-z0-9_$.-]*$/
const PLAIN_STRING = /^[A-Za-z0-9_][A-Za-z0-9_./-]*$/
const RESERVED = new Set(['true', 'false', 'null', 'yes', 'no', 'on', 'off', '~'])

function keyText(key) {
  return BARE_KEY.test(key) ? key : JSON.stringify(key)
}

/** A scalar in YAML flow-safe form. */
export function scalarText(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null'
  if (isJsExpr(value)) return `!!js ${JSON.stringify(value.__js)}`
  if (typeof value === 'string') {
    if (PLAIN_STRING.test(value) && !RESERVED.has(value.toLowerCase()) && !/^[+-]?(\d|\.\d)/.test(value)) {
      return value
    }
    return JSON.stringify(value)
  }
  return JSON.stringify(String(value))
}

function isMultilineString(value) {
  return typeof value === 'string' && value.includes('\n')
}

function blockLines(value, indent) {
  const body = value.endsWith('\n') ? value.slice(0, -1) : value
  const pad = ' '.repeat(indent)
  return body.split('\n').map((line) => (line.length === 0 ? '' : pad + line))
}

function emitValue(value, indent = 0) {
  const pad = ' '.repeat(indent)
  if (value === null || value === undefined || typeof value !== 'object' || isJsExpr(value)) {
    return [pad + scalarText(value)]
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [pad + '[]']
    const lines = []
    for (const item of value) {
      lines.push(...emitListItem(item, indent))
    }
    return lines
  }
  const keys = Object.keys(value).filter((key) => value[key] !== undefined)
  if (keys.length === 0) return [pad + '{}']
  const lines = []
  for (const key of keys) {
    const child = value[key]
    if (isMultilineString(child)) {
      const chomp = child.endsWith('\n') ? '|' : '|-'
      lines.push(`${pad}${keyText(key)}: ${chomp}`)
      lines.push(...blockLines(child, indent + 2))
    } else if (child !== null && typeof child === 'object' && !isJsExpr(child)) {
      lines.push(`${pad}${keyText(key)}:`)
      lines.push(...emitValue(child, indent + 2))
    } else {
      lines.push(`${pad}${keyText(key)}: ${scalarText(child)}`)
    }
  }
  return lines
}

function emitListItem(value, indent = 0) {
  const pad = ' '.repeat(indent)
  if (isMultilineString(value)) {
    const chomp = value.endsWith('\n') ? '|' : '|-'
    return [`${pad}- ${chomp}`, ...blockLines(value, indent + 2)]
  }
  const lines = emitValue(value, indent + 2)
  lines[0] = `${pad}- ${lines[0].slice(indent + 2)}`
  return lines
}

export function emitBlockValue(key, value, indent = 0) {
  const pad = ' '.repeat(indent)
  const lines = emitValue(value, indent + 2)
  return [`${pad}${keyText(key)}:`, ...lines]
}

export { emitListItem, emitValue }
