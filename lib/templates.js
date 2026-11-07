export const ISSUE_TEMPLATES = [
  {
    id: 'startup_crash',
    titleEn: 'Startup Crash',
    titleRu: 'Сбой при запуске',
    titleZh: '启动崩溃',
    suggestedLabels: ['bug', 'crash'],
    observed: 'Plugin failed to initialize or crashed during startup.\n- Error message / Fiber error:\n- Crash frequency (always / intermittent):',
    reproduction: '1. Enable plugin in DSH config.\n2. Restart DSH service.\n3. Observe crash in terminal logs.',
    expected: 'The plugin should initialize cleanly without throwing errors or blocking DSH startup.',
  },
  {
    id: 'ui_styles',
    titleEn: 'UI & Styling Glitch',
    titleRu: 'Ошибка интерфейса и стилей',
    titleZh: '界面与样式异常',
    suggestedLabels: ['bug', 'ui'],
    observed: 'Visual glitch, clipping, or styling conflict in web console.\n- Affected component (settings card / slot / panel):\n- Theme mode (Dark / Light):',
    reproduction: '1. Navigate to plugin settings in DSH web console.\n2. Observe layout breakage or CSS conflict.',
    expected: 'Components should follow theme variables and render without clipping or overlapping elements.',
  },
  {
    id: 'dsh02_compat',
    titleEn: 'DSH 0.2 / Cordis Incompatibility',
    titleRu: 'Несовместимость с DSH 0.2 / Cordis',
    titleZh: 'DSH 0.2 / Cordis 兼容性问题',
    suggestedLabels: ['compatibility', 'dsh-0.2'],
    observed: 'Incompatible API call with modern DSH 0.2 runtime.\n- Deprecated method called (e.g. settings.register, scope.watch):\n- Missing Cordis service:',
    reproduction: '1. Run on DSH 0.2 with updated core services.\n2. Trigger feature that interacts with Cordis context.',
    expected: 'Plugin should use valid DSH 0.2 service APIs without relying on legacy methods.',
  },
  {
    id: 'performance',
    titleEn: 'Performance & Resource Leak',
    titleRu: 'Утечка ресурсов / Зависание',
    titleZh: '性能与资源泄漏',
    suggestedLabels: ['performance', 'resource-leak'],
    observed: 'Excessive memory growth, high CPU, or event loop blocking.\n- Memory delta (MB) or CPU percentage:\n- Time elapsed before slowdown:',
    reproduction: '1. Keep DSH running with plugin active for multiple hours.\n2. Execute periodic operations and monitor process metrics.',
    expected: 'Memory and CPU utilization should stabilize within normal operating parameters.',
  },
]

export function getIssueTemplate(id) {
  return ISSUE_TEMPLATES.find((tpl) => tpl.id === id) || null
}

export function applyTemplateToDraft(draft = {}, templateId, locale = 'en') {
  const tpl = getIssueTemplate(templateId)
  if (!tpl) return draft
  const isZh = String(locale).startsWith('zh')
  const isRu = String(locale).startsWith('ru')
  const prefix = isZh ? `[${tpl.titleZh}] ` : isRu ? `[${tpl.titleRu}] ` : `[${tpl.titleEn}] `
  const title = draft.title && draft.title.trim() ? draft.title : prefix
  return {
    ...draft,
    templateId: tpl.id,
    title,
    observed: draft.observed && draft.observed.trim() ? draft.observed : tpl.observed,
    reproduction: draft.reproduction && draft.reproduction.trim() ? draft.reproduction : tpl.reproduction,
    expected: draft.expected && draft.expected.trim() ? draft.expected : tpl.expected,
    suggestedLabels: tpl.suggestedLabels,
  }
}
