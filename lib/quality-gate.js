export function evaluateReportQuality(draft = {}) {
  const title = String(draft.title || '').trim()
  const observed = String(draft.observed || '').trim()
  const expected = String(draft.expected || '').trim()
  const reproduction = String(draft.reproduction || '').trim()
  const environment = String(draft.environment || '').trim()
  const errorStack = String(draft.errorStack || '').trim()
  const hasLogs = Array.isArray(draft.logs) && draft.logs.length > 0

  const hasStepList = (
    /(?:^|\n)\s*(?:[1-9]\.|\*|-)\s+/m.test(reproduction) ||
    reproduction.split('\n').filter((l) => l.trim().length > 0).length >= 2
  )

  const checks = [
    {
      id: 'title_length',
      labelEn: 'Descriptive title (>= 10 chars)',
      labelRu: 'Информативный заголовок (>= 10 символов)',
      labelZh: '描述性标题（>= 10 个字符）',
      passed: title.length >= 10,
      weight: 20,
      warningEn: 'Title is too short to clearly summarize the defect.',
      warningRu: 'Заголовок слишком короткий для однозначной идентификации проблемы.',
      warningZh: '标题太短，无法清晰概括问题。',
    },
    {
      id: 'observed_behavior',
      labelEn: 'Observed behavior described (>= 10 chars)',
      labelRu: 'Описано наблюдаемое поведение (>= 10 символов)',
      labelZh: '详细描述了观察到的行为（>= 10 个字符）',
      passed: observed.length >= 10,
      weight: 25,
      warningEn: 'Please describe the observed error or actual behavior.',
      warningRu: 'Пожалуйста, укажите наблюдаемый сбой или ошибку.',
      warningZh: '请详细描述实际发生的错误或现象。',
    },
    {
      id: 'expected_behavior',
      labelEn: 'Expected behavior stated (>= 5 chars)',
      labelRu: 'Указано ожидаемое поведение (>= 5 символов)',
      labelZh: '说明了预期行为（>= 5 个字符）',
      passed: expected.length >= 5,
      weight: 15,
      warningEn: 'Please explain what was expected to happen.',
      warningRu: 'Пожалуйста, объясните, как система должна была сработать.',
      warningZh: '请说明预期的正常行为。',
    },
    {
      id: 'reproduction_steps',
      labelEn: 'Reproduction steps provided (>= 2 steps)',
      labelRu: 'Шаги воспроизведения (минимум 2 пункта)',
      labelZh: '提供了重现步骤（至少 2 步）',
      passed: reproduction.length >= 10 && hasStepList,
      weight: 25,
      warningEn: 'Add at least 2 numbered or bulleted steps to reproduce.',
      warningRu: 'Укажите как минимум 2 шага для воспроизведения сбоя.',
      warningZh: '请提供至少 2 个编号或要点形式的重现步骤。',
    },
    {
      id: 'diagnostics_or_logs',
      labelEn: 'Diagnostic logs or environment attached',
      labelRu: 'Прикреплены логи или снимок окружения',
      labelZh: '已附加诊断日志或环境信息',
      passed: environment.length > 10 || errorStack.length > 10 || hasLogs,
      weight: 15,
      warningEn: 'Consider attaching recent logs or an environment snapshot.',
      warningRu: 'Рекомендуется прикрепить логи или снимок окружения.',
      warningZh: '建议附加最近的日志或运行环境快照。',
    },
  ]

  let score = 0
  const warnings = []
  for (const c of checks) {
    if (c.passed) {
      score += c.weight
    } else {
      warnings.push(c.warningEn)
    }
  }

  let status = 'poor'
  if (score >= 80) status = 'ready'
  else if (score >= 50) status = 'fair'

  return {
    score,
    status,
    checks,
    warnings,
    isReady: score >= 50,
  }
}
