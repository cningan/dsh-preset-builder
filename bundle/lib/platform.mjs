/**
 * Read the platform meaning of a `!!js` disabled expression.
 *
 * The result is deliberately conservative: only expressions the reader can
 * attribute to a concrete platform get a platform label; anything else is
 * reported as a generic condition instead of a guess.
 */

const NAMES = {
  win32: 'Windows',
  darwin: 'macOS',
  linux: 'Linux',
  freebsd: 'FreeBSD',
  openbsd: 'OpenBSD',
  sunos: 'SunOS',
  aix: 'AIX',
  android: 'Android',
}

export function describeDisabledExpression(text) {
  const source = typeof text === 'string' ? text.trim() : ''
  if (source.length === 0) return { kind: 'expression', text: source, label: '条件启用' }
  if (!source.includes('process.platform')) {
    return { kind: 'expression', text: source, label: '条件启用' }
  }

  const positive = new Set()
  const negative = new Set()

  const equality = /process\.platform\s*===?\s*['"]([a-z0-9]+)['"]/g
  const equalityReversed = /['"]([a-z0-9]+)['"]\s*===?\s*process\.platform/g
  const inequality = /process\.platform\s*!==?\s*['"]([a-z0-9]+)['"]/g
  const inequalityReversed = /['"]([a-z0-9]+)['"]\s*!==?\s*process\.platform/g
  const includes = /\[([^\]]*)\]\s*\.includes\(\s*process\.platform\s*\)/g
  const notIncludes = /!\s*\[([^\]]*)\]\s*\.includes\(\s*process\.platform\s*\)/g

  let match
  while ((match = equality.exec(source)) !== null) positive.add(match[1])
  while ((match = equalityReversed.exec(source)) !== null) positive.add(match[1])
  while ((match = inequality.exec(source)) !== null) negative.add(match[1])
  while ((match = inequalityReversed.exec(source)) !== null) negative.add(match[1])
  while ((match = includes.exec(source)) !== null) {
    for (const name of literalsOf(match[1])) positive.add(name)
  }
  while ((match = notIncludes.exec(source)) !== null) {
    for (const name of literalsOf(match[1])) negative.add(name)
  }

  if (positive.size > 0 && negative.size === 0) {
    return {
      kind: 'platform',
      text: source,
      platforms: [...positive],
      label: `仅 ${[...positive].map(display).join(' / ')}`,
    }
  }
  if (negative.size > 0 && positive.size === 0) {
    return {
      kind: 'platform',
      text: source,
      platforms: [...negative],
      negated: true,
      label: `非 ${[...negative].map(display).join(' / ')}`,
    }
  }
  return { kind: 'expression', text: source, label: '条件启用' }
}

function literalsOf(list) {
  const names = []
  const pattern = /['"]([a-z0-9]+)['"]/g
  let match
  while ((match = pattern.exec(list)) !== null) names.push(match[1])
  return names
}

function display(name) {
  return NAMES[name] ?? name
}
