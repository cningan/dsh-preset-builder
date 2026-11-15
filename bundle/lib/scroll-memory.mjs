/**
 * Remembering where the user scrolled to.
 *
 * Golden contract: exercised by `test/unit.mjs`, mirrored in `bundle/client.js`
 * (the client ships as one plain script and cannot import this module, the same
 * arrangement as `rules.mjs` and `diff.mjs`).
 *
 * The page re-renders on its own schedule and a re-render can reset a container
 * to the top. Two rules keep that from being mistaken for the user:
 *
 *  - an offset is stored when the container is not at the top, or when the user
 *    touched it within `INPUT_WINDOW` ms — a jump to zero without input is the
 *    page re-rendering, not a person scrolling;
 *  - a stored offset is applied once, and only after the content has stopped
 *    changing for `SETTLE_MS` — applying while the page is still rendering is
 *    what makes it visibly jump up and down.
 */

export const SCROLL_KEYS = ['left', 'editor', 'drawer', 'page']
export const INPUT_WINDOW = 400
export const SETTLE_MS = 220

/** One stored offset: a non-negative integer, or nothing. */
export function rememberOffset(value) {
  if (typeof value !== 'number' || Number.isFinite(value) !== true) return null
  const offset = Math.round(value)
  return offset >= 0 ? offset : null
}

/** The whitelisted offsets of a stored record. */
export function rememberScroll(value) {
  const record = {}
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return record
  for (const key of SCROLL_KEYS) {
    const offset = rememberOffset(value[key])
    if (offset !== null) record[key] = offset
  }
  return record
}

/**
 * Should this scroll event be stored?
 *
 * `restoring` covers the moment between "a stored offset exists" and "it has
 * been applied": positions seen then belong to the page, not to the user.
 */
export function shouldRemember({ offset, lastInputAt, now, restoring }) {
  if (restoring === true) return false
  const value = rememberOffset(offset)
  if (value === null) return false
  if (value > 0) return true
  return now - lastInputAt < INPUT_WINDOW
}

/** Should the adapter write the stored offset into the container now? */
export function shouldApply({ offset, max, quietFor, restoring, touched }) {
  if (restoring !== true || touched === true) return false
  const value = rememberOffset(offset)
  if (value === null || value <= 0) return false
  if (typeof max !== 'number' || Number.isFinite(max) !== true || max < value) return false
  return quietFor >= SETTLE_MS
}
