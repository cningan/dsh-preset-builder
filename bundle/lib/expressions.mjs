/**
 * `!!js` expressions inside a preset row's config.
 *
 * The Loader evaluates those expressions against the file that declares the
 * row (`baseUrl`). Copying such a row into another layer therefore cannot keep
 * the expression: it would be evaluated against the new file and point
 * somewhere else — or fail outright, as the shipped Creator preset's skill
 * directory does once it moves from the bundle into the profile patch.
 *
 * Values under `config` are data and are resolved where the preset is read;
 * `disabled` and `isolate` stay expressions because they are control.
 */
import { isJsExpr } from './yaml.mjs'

const MAX_DEPTH = 24

/**
 * Evaluate one expression the way the Loader does: `with (scope) { eval(expr) }`.
 * @param {object} scope - `{ baseUrl, ctx }`, mirroring a Loader entry context.
 * @param {string} expression - JavaScript source from a `!!js` tag.
 * @returns {unknown}
 */
export function evaluateExpression(scope, expression) {
  const run = new Function('scope', 'expr', 'with (scope) { return eval(expr) }')
  return run(scope, expression)
}

function evaluateNode(node, evaluate, failures) {
  try {
    return evaluate(node.__js)
  } catch (error) {
    failures.push({
      expression: node.__js,
      error: error instanceof Error ? error.message : String(error),
    })
    return node
  }
}

/** Resolve expressions anywhere inside one config value. */
export function resolveValue(value, evaluate, failures = [], depth = 0) {
  if (depth > MAX_DEPTH) return value
  if (isJsExpr(value)) return evaluateNode(value, evaluate, failures)
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, evaluate, failures, depth + 1))
  const result = {}
  for (const [key, child] of Object.entries(value)) {
    result[key] = resolveValue(child, evaluate, failures, depth + 1)
  }
  return result
}

/**
 * Resolve the config values of every row in a preset.
 *
 * A group's `config` is its child row list, so it recurses as rows instead of
 * as values. `disabled` and `isolate` are copied verbatim.
 *
 * With `skipDisabled`, a row that will not mount keeps its config untouched and
 * reports no failure: DSH never loads such a row, so its values — expressions
 * included — never reach a plugin schema.
 * @returns {{ plugins: unknown[], failures: Array<{ expression: string, error: string }> }}
 */
export function resolvePluginConfig(plugins, evaluate, options = {}) {
  const skipDisabled = options.skipDisabled === true
  const failures = []
  const mounts = (row) => {
    if (skipDisabled !== true) return true
    if (row.disabled === undefined || row.disabled === null || row.disabled === false) return true
    if (isJsExpr(row.disabled)) {
      try {
        return !evaluate(row.disabled.__js)
      } catch {
        // An unreadable condition is treated as mounted, the safe direction.
        return true
      }
    }
    return !row.disabled
  }
  const rows = (list, active) => {
    if (!Array.isArray(list)) return list
    return list.map((row) => {
      if (row === null || typeof row !== 'object' || Array.isArray(row)) return row
      const live = active && mounts(row)
      const next = { ...row }
      const isGroup = row.group === true && Array.isArray(row.config)
      if (next.config !== undefined) {
        if (!live) {
          if (isGroup) next.config = rows(row.config, false)
        } else if (isGroup) {
          next.config = rows(row.config, true)
        } else {
          const before = failures.length
          next.config = resolveValue(row.config, evaluate, failures)
          for (let index = before; index < failures.length; index += 1) {
            failures[index] = { ...failures[index], row: row.id }
          }
        }
      }
      return next
    })
  }
  return { plugins: rows(plugins, true), failures }
}
