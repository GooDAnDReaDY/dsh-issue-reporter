import { redactText } from './domain.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

function extractProperties(schema) {
  if (!schema || typeof schema !== 'object') return { properties: {}, required: [] }

  // JSON schema shape
  if (schema.properties && typeof schema.properties === 'object') {
    return {
      properties: schema.properties,
      required: Array.isArray(schema.required) ? schema.required : [],
    }
  }

  // Schemastery / cordis schema shape
  if (schema.dict && typeof schema.dict === 'object') {
    const props = {}
    const req = []
    for (const [k, v] of Object.entries(schema.dict)) {
      props[k] = {
        type: v?.type || typeof v?.default,
        default: v?.default,
        required: Boolean(v?.required),
      }
      if (v?.required) req.push(k)
    }
    return { properties: props, required: req }
  }

  return { properties: {}, required: [] }
}

export function lintPluginConfig(pluginName = 'unknown', currentConfig = {}, schemaDefinition = null) {
  const errors = []
  const warnings = []
  const diff = []

  const config = currentConfig && typeof currentConfig === 'object' ? currentConfig : {}
  const { properties, required } = extractProperties(schemaDefinition)

  const schemaKeys = new Set(Object.keys(properties))
  const configKeys = Object.keys(config)

  // 1. Check missing required keys
  for (const reqKey of required) {
    if (config[reqKey] === undefined || config[reqKey] === null || config[reqKey] === '') {
      const err = {
        key: reqKey,
        issue: 'missing_required',
        expected: properties[reqKey]?.type || 'any',
        actual: 'undefined',
        message: `Required configuration key "${reqKey}" is missing`,
      }
      errors.push(err)
      diff.push({ status: 'missing', key: reqKey, expected: err.expected, actual: 'undefined' })
    }
  }

  // 2. Check each configured key
  for (const key of configKeys) {
    const val = config[key]

    if (!schemaKeys.has(key)) {
      // Key not in schema -> unknown drift
      const warn = {
        key,
        issue: 'unknown_drift',
        actual: typeof val,
        message: `Unknown configuration key "${key}" found in settings (potential schema drift or deprecated option)`,
      }
      warnings.push(warn)
      diff.push({ status: 'drift', key, expected: '(none)', actual: String(val) })
      continue
    }

    const propDef = properties[key]
    if (!propDef) continue

    const expectedType = propDef.type ? String(propDef.type).toLowerCase() : null
    const actualType = Array.isArray(val) ? 'array' : typeof val

    if (expectedType && expectedType !== 'any') {
      const isMismatch = (expectedType === 'number' && actualType !== 'number') ||
        (expectedType === 'string' && actualType !== 'string') ||
        (expectedType === 'boolean' && actualType !== 'boolean') ||
        (expectedType === 'object' && actualType !== 'object') ||
        (expectedType === 'array' && actualType !== 'array')

      if (isMismatch) {
        const err = {
          key,
          issue: 'type_mismatch',
          expected: expectedType,
          actual: actualType,
          message: `Type mismatch for key "${key}": expected ${expectedType}, received ${actualType}`,
        }
        errors.push(err)
        diff.push({ status: 'type_mismatch', key, expected: expectedType, actual: actualType })
      }
    }
  }

  return {
    plugin: pluginName,
    ok: errors.length === 0,
    errors,
    warnings,
    diff,
  }
}

export function formatConfigLintMarkdown(pluginName = 'unknown', lintResult = {}) {
  const { ok, errors = [], warnings = [], diff = [] } = lintResult

  const lines = [
    `### Configuration Audit: \`${pluginName}\``,
    '',
    ok
      ? 'The configuration matches the declared plugin schema cleanly with no required fields missing.'
      : 'Configuration discrepancies or schema drift were detected for this plugin:',
    '',
  ]

  if (diff.length > 0) {
    lines.push('| Status | Key | Issue | Expected | Actual |')
    lines.push('| :--- | :--- | :--- | :--- | :--- |')
    for (const item of diff) {
      const badge = item.status === 'type_mismatch'
        ? 'Error: Type Mismatch'
        : item.status === 'missing'
          ? 'Error: Missing Required'
          : 'Warning: Schema Drift'
      lines.push(`| ${badge} | \`${item.key}\` | ${item.status} | \`${item.expected}\` | \`${item.actual}\` |`)
    }
    lines.push('')
  }

  if (errors.length > 0) {
    lines.push('> [!CAUTION]')
    lines.push('> Schema validation errors may cause plugin initialization crashes, runtime exceptions, or undefined behavior.')
  } else if (warnings.length > 0) {
    lines.push('> [!NOTE]')
    lines.push('> Drift warnings indicate obsolete keys left behind after an update, or experimental unsupported settings.')
  }

  return safeRedact(lines.join('\n'))
}
