import { redactText } from './domain.js'

function safeRedact(text) {
  if (typeof text !== 'string') return ''
  return typeof redactText === 'function' ? redactText(text).text : text
}

export function generateBilingualDraft(draft = {}, options = {}) {
  const { includeChinese = true } = options
  const lines = []

  // 1. English section
  lines.push('## English Description')
  lines.push('')
  if (draft.observed) {
    lines.push('### What happened?')
    lines.push(draft.observed)
    lines.push('')
  }
  if (draft.reproduction) {
    lines.push('### Steps to reproduce')
    lines.push(draft.reproduction)
    lines.push('')
  }
  if (draft.expected) {
    lines.push('### Expected behavior')
    lines.push(draft.expected)
    lines.push('')
  }
  if (draft.environment) {
    lines.push('### Environment')
    lines.push(draft.environment)
    lines.push('')
  }

  // 2. Parallel Chinese section
  if (includeChinese) {
    lines.push('---')
    lines.push('')
    lines.push('## 中文说明 (Chinese Translation)')
    lines.push('')
    if (draft.observed) {
      lines.push('### 发生的现象：')
      lines.push(draft.observed)
      lines.push('')
    }
    if (draft.reproduction) {
      lines.push('### 复现步骤：')
      lines.push(draft.reproduction)
      lines.push('')
    }
    if (draft.expected) {
      lines.push('### 期望行为：')
      lines.push(draft.expected)
      lines.push('')
    }
    if (draft.environment) {
      lines.push('### 运行环境：')
      lines.push(draft.environment)
      lines.push('')
    }
  }

  return safeRedact(lines.join('\n'))
}

export function formatBilingualMarkdown(draft = {}, options = {}) {
  return generateBilingualDraft(draft, options)
}
