# Changelog

## 0.1.10

### English
- **Defensive Connection Service Resolution (#74)**: added `getConnection(ctx)` in `lib/routes/shared.js` implementing a resilient three-tier fallback resolution (`ctx.reflect?.get('connection')` -> `ctx.get('connection')` -> `ctx.connection` / `Reflect.get(ctx, 'connection')`). Eliminates single points of failure across all twelve plugin endpoints when `ctx.reflect` is unavailable on the host while preserving fail-closed 503 security invariants.
- **Safety & Regression Tests**: added unit tests in `test/request-guard.test.mjs` verifying fallback resolution to `ctx.get` and `ctx.connection`, as well as when `ctx.reflect.get` returns undefined.
- **Design Contract**: updated connection service resolution guarantees in `docs/design/DESIGN.md`.

### Русский
- **Многоуровневый фоллбэк сервиса авторизации соединений (#74)**: в `lib/routes/shared.js` добавлен хелпер `getConnection(ctx)`, реализующий защищённый трёхступенчатый поиск сервиса (`ctx.reflect?.get('connection')` -> `ctx.get('connection')` -> `ctx.connection` / `Reflect.get(ctx, 'connection')`). Устранена критическая точка отказа для всех 12 маршрутов плагина при отсутствии `ctx.reflect` на хосте с полным сохранением fail-closed защиты (HTTP 503 при отсутствии сервиса).
- **Тесты регрессии**: в `test/request-guard.test.mjs` добавлены тесты на успешную авторизацию через `ctx.get` и `ctx.connection`, а также при возврате `undefined` из `reflect.get`.
- **Дизайн-контракт**: правила многоуровневого разрешения сервиса зафиксированы в `docs/design/DESIGN.md`.

### 中文
- **防御性连接认证服务解析 (#74)**：在 `lib/routes/shared.js` 中新增 `getConnection(ctx)` 辅助函数，实现三级弹性回退策略（`ctx.reflect?.get('connection')` -> `ctx.get('connection')` -> `ctx.connection` / `Reflect.get(ctx, 'connection')`）。消除了主机环境中缺少 `ctx.reflect` 时导致全部 12 个路由返回 503 的单点隐患，同时严格保持 fail-closed 503 安全性。
- **回归与安全测试**：在 `test/request-guard.test.mjs` 中添加针对 `ctx.get` 与 `ctx.connection` 回退解析以及 `reflect.get` 返回 `undefined` 时的单元测试。
- **设计契约**：在 `docs/design/DESIGN.md` 中补充了连接服务解析规范。

## 0.1.9

### English
- **DSH 0.2 Settings Service Alignment (#71, #72, #73, #77, #78)**: eliminated calls to deprecated `settings.register()`, `scope.get()`, and `scope.watch()` in `lib/index.js` that caused runtime errors or broken configuration lifecycle on DSH 0.2 (`0.2.0-rc.1`/`rc.2`).
- **Safe Host Settings Opt-Out**: integrated standard DSH 0.2 settings configuration opt-out (`sctx.settings?.configure?.({ auto: false }, ctx.fiber)`) to allow the custom plugin settings card to own the UI surface cleanly.
- **Volatile Schema Annotations**: marked user-editable `Config` properties (`appClientId`, `apiBaseUrl`, `giteaBaseUrl`, `timeoutMs`, `ghPath`) with `.volatile()`, backed by Schemastery prototype polyfill, enabling DSH 0.2 to service and persist settings without daemon restarts. Preserved `role('credential-ref')` for secrets (`tokenEnv`, `giteaTokenEnv`).
- **Zero-Downtime Hot Reload**: added live listeners for `loader/volatile-update`, `config`, and `settings/document-updated` on `ctx`, instantly propagating configuration edits across all server routes without restarting.
- **Safety & Regression Tests**: added dedicated test suite `test/settings.test.mjs` verifying clean initialization without `settings.register`, schema metadata roles, and live volatile patch delivery.

### Русский
- **Совместимость с сервисом настроек DSH 0.2 (#71, #72, #73, #77, #78)**: полностью удалены вызовы устаревших методов `settings.register()`, `scope.get()` и `scope.watch()` в `lib/index.js`, приводивших к исключениям и неработоспособности настроек на DSH 0.2 (`0.2.0-rc.1`/`rc.2`).
- **Штатный opt-out хоста**: добавлен вызов `sctx.settings?.configure?.({ auto: false }, ctx.fiber)`, исключающий конфликт встроенной автогенерации DSH с кастомной карточкой плагина.
- **Аннотации .volatile() в схеме Schemastery**: редактируемые поля `Config` (`appClientId`, `apiBaseUrl`, `giteaBaseUrl`, `timeoutMs`, `ghPath`) помечены как `.volatile()` с безопасным полифилом на прототипе Schemastery, что обеспечивает их отображение и сохранение ядром DSH 0.2 без рестарта. Ссылки на секреты (`tokenEnv`, `giteaTokenEnv`) сохранены с типом `role('credential-ref')`.
- **Горячее обновление без перезапуска (HMR)**: подключены слушатели событий `loader/volatile-update`, `config` и `settings/document-updated`, мгновенно обновляющие живую конфигурацию для всех обработчиков маршрутов.
- **Тесты регрессии**: создан тест-сьют `test/settings.test.mjs`, контролирующий отсутствие удалённых методов `settings.register`/`scope.watch`, корректность метаданных схемы и работу с DSH 0.2 контрактом.

### 中文
- **适配 DSH 0.2 设置服务 (#71, #72, #73, #77, #78)**：完全移除了 `lib/index.js` 中已废弃的 `settings.register()`、`scope.get()` 和 `scope.watch()` 调用，解决了在 DSH 0.2 (`0.2.0-rc.1`/`rc.2`) 环境下因接口缺失导致的运行时异常与设置失效问题。
- **安全的主机设置 opt-out**：接入标准 DSH 0.2 设置配置排除机制（`sctx.settings?.configure?.({ auto: false }, ctx.fiber)`），由插件自身的设置卡片独立接管配置界面。
- **Schemastery 模式 volatile 标记**：为用户可编辑配置项（`appClientId`、`apiBaseUrl`、`giteaBaseUrl`、`timeoutMs`、`ghPath`）添加 `.volatile()` 链式标记并提供 Schemastery 原型补丁，使 DSH 0.2 核心能够正确持久化和维护配置而无需重启守护进程；凭证引用（`tokenEnv`、`giteaTokenEnv`）保持 `role('credential-ref')`。
- **零停机热重载**：在 `ctx` 上监听 `loader/volatile-update`、`config` 和 `settings/document-updated` 事件，实时将修改后的配置应用到所有路由处理器中。
- **回归与安全测试**：新增 `test/settings.test.mjs` 测试套件，严格校验无 `settings.register`/`scope.watch` 调用、模式元数据正确性以及 DSH 0.2 契约下的热更新。

## 0.1.8

### English
- **Pre-Prompt Redaction for AI Optimization (#68)**: enforced host-side sanitization of all user-supplied input fields (`title`, `observed`, `reproduction`, `expected`, `pluginName`, `errorStack`, `diagnostics`, `environment`) in `POST /dsh-issue-reporter/ai/optimize` before constructing prompts or calling `llm.stream`, preventing sensitive tokens, credentials, paths, and LAN IPs from being sent to external LLM providers.
- **Defensive Prompt Construction**: updated `buildAiOptimizationPrompt()` in `lib/domain.js` to automatically sanitize all parameters prior to assembly, guaranteeing safe prompts regardless of caller context.
- **Structured Diagnostics Sanitization**: enhanced `normalizeRedactInput` in `lib/domain.js` to serialize nested objects and arrays into formatted JSON before applying redaction patterns, ensuring structured logs and diagnostic maps are scrubbed safely.
- **Model Output & Heuristic Fallback Protection**: sanitized model responses before returning them to client, and maintained full redaction across the heuristic draft fallback.
- **Design Contract**: codified prompt redaction invariant in `docs/design/DESIGN.md`.

### Русский
- **Санитизация входных данных перед вызовом LLM (#68)**: в эндпоинте `POST /dsh-issue-reporter/ai/optimize` обеспечена обязательная очистка всех пользовательских полей (`title`, `observed`, `reproduction`, `expected`, `pluginName`, `errorStack`, `diagnostics`, `environment`) через `redactText` до сборки промпта и отправки в `llm.stream`. Исключена утечка токенов, паролей, путей файловой системы и LAN IP внешним провайдерам моделей.
- **Защитная сборка промпта**: в функции `buildAiOptimizationPrompt()` (`lib/domain.js`) добавлена санитизация входных аргументов на стороне хоста.
- **Поддержка структурированных диагностик**: функция `normalizeRedactInput` сериализует вложенные объекты и массивы в JSON перед применением правил `REDACTIONS` (включая поддержку `Bearer <token>` и исключение кавычек JSON).
- **Очистка ответа модели и фоллбэка**: возвращаемый текст от LLM санитизируется перед отправкой клиенту; эвристический фоллбэк черновика гарантированно защищён от утечек.
- **Дизайн-контракт**: инвариант очистки зафиксирован в `docs/design/DESIGN.md`.

### 中文
- **AI 优化提示词预脱敏 (#68)**：在 `POST /dsh-issue-reporter/ai/optimize` 路由中，在构建提示词和调用 `llm.stream` 之前，强制对所有用户提交的字段（`title`、`observed`、`reproduction`、`expected`、`pluginName`、`errorStack`、`diagnostics`、`environment`）执行 `redactText` 脱敏，防止敏感令牌、凭证、私有路径和局域网 IP 发送至外部 LLM 服务商。
- **防御性提示词构建**：在 `lib/domain.js` 的 `buildAiOptimizationPrompt()` 中添加了宿主侧参数清洗，确保无论调用来源均生成安全的提示词文本。
- **结构化诊断脱敏**：增强了 `normalizeRedactInput`，在应用脱敏规则前将嵌套对象与数组序列化为格式化 JSON，安全脱敏嵌套日志与环境诊断。
- **模型输出与回退保护**：在返回给客户端前对模型响应进行脱敏，并在启发式草稿回退路径中保持完整的脱敏保护。
- **设计契约**：在 `docs/design/DESIGN.md` 中固化了 AI 提示词脱敏规范。

## 0.1.7

### English
- **Network Request Safety**: added default 15-second operation timeout (`DEFAULT_TIMEOUT_MS = 15_000`) across all GitHub and Gitea REST API calls in `lib/github.js`. Prevents server route handlers and worker threads from hanging indefinitely when remote forge connections stall or drop packets.
- **Batch Status Throttling & Caching**: capped concurrency in `/dsh-issue-reporter/issues/batch-status` to batches of 4 requests (down from 20 parallel requests), and added in-memory LRU/TTL caching (60s) to prevent secondary rate limits and redundant forge round-trips.
- **Dead Code Pruning**: cleanly removed the uncalled `/dsh-issue-reporter/templates` endpoint and `fetchIssueTemplates` method per YAGNI, reducing bundle complexity without affecting structured issue drafting.
- **Repository Hygiene**: completed verification and cleanup of 16 historical task worktrees and codified worktree lifecycle boundaries in `DESIGN.md`.

### Русский
- **Безопасность сетевых вызовов**: добавлен таймаут по умолчанию 15 секунд (`DEFAULT_TIMEOUT_MS = 15_000`) для всех вызовов к REST API GitHub и Gitea в `lib/github.js`. Исключено зависание обработчиков маршрутов и рабочих потоков DSH при сбоях сети или зависании удалённых сервисов.
- **Троттлинг и кэширование пакетного опроса**: опрос статусов тикетов в `/issues/batch-status` ограничен параллельными батчами по 4 запроса (вместо 20 одновременных вызовов), добавлен in-memory TTL-кэш (60 секунд) для защиты от вторичных rate limits и избыточных повторных запросов.
- **Удаление мёртвого кода**: удалены неиспользуемый эндпоинт `/templates` и метод `fetchIssueTemplates` по правилу YAGNI (Ponytail).
- **Чистота репозитория**: проведена верификация и очистка 16 устаревших worktree завершённых задач с закреплением инварианта в `DESIGN.md`.

### 中文
- **网络请求安全性**：在 `lib/github.js` 中为所有 GitHub 和 Gitea REST API 调用添加了默认 15 秒操作超时（`DEFAULT_TIMEOUT_MS = 15_000`）。防止在网络连接中断或远端服务挂起时无限期阻塞 DSH 路由处理器。
- **批量状态限流与缓存**：将 `/dsh-issue-reporter/issues/batch-status` 中的并发请求限制为每批 4 个请求（从 20 个并发请求下调），并添加内存 LRU/TTL 缓存（60 秒），防止触发次级速率限制和不必要的重复请求。
- **清理死代码**：根据 YAGNI 原则完全移除了未被调用的 `/dsh-issue-reporter/templates` 端点和 `fetchIssueTemplates` 方法，精简代码库。
- **仓库维护**：完成并清理了 16 个已合并的历史任务工作树，并在 `DESIGN.md` 中固化了工作树生命周期规范。

## 0.1.6

### English
- **Settings reachable again on the plugin's own page**: the current DSH core
  (0.1.6-alpha.2) renders a plugin's configuration page only for entries registered
  in the plugin-list seat `plugins.item` — that is how `dsh-agentrouter` and
  `dsh-agent-orchestrator` show their settings. The view-aware card is now registered
  there too (`id: 'dsh-issue-reporter'`, order 60, static label); the legacy
  `settings.plugin.item` seat stays as a fallback.
- The card became view-aware: `summary` is a one-liner, `page` renders bare and open
  (`ir-seat-page`) instead of inside the card frame.

### Русский
- **Настройки снова доступны на странице плагина**: текущее ядро 0.1.6-alpha.2
  рендерит страницу настроек плагина только для записей в списочном слоте
  `plugins.item`. Карточка зарегистрирована там (`id: 'dsh-issue-reporter'`,
  order 60, статичный label), легаси-посадка оставлена фолбэком.
- Карточка стала view-aware: `summary` — однострочник, `page` — форма без нашей
  рамки и раскрытая.

## 0.1.5

### English
- **Settings reachable again**: the card registered into `settings.plugin.item`, a
  slot the current DSH core (0.1.6-alpha.2) no longer renders, so the settings were
  unreachable. The surface now registers into the Plugins page row seat
  `plugins.row.config`, keyed `@goodandready/dsh-issue-reporter#dsh-issue-reporter`
  (`rowConfigKey(package, rowId)`): the row gains a configure control whose page is
  the settings form (`view: 'page'`, without our card chrome and header — the host
  page draws the title, icon, crumb and padding) plus a one-line state for
  `view: 'summary'`. The legacy seat stays registered as a fallback for older cores.

## 0.1.4

### English
- Fixed native DSH theme-token compatibility and plugin inventory interactions.
- Fixed report-editor session-log loading and improved updater error diagnostics.
- Added regression coverage for plugin-card behavior, theme styling, session logs, and updater failures.

### 中文
- 修复原生 DSH 主题令牌兼容性及插件清单交互问题。
- 修复报告编辑器的会话日志加载，并改进更新器错误诊断。
- 增加回归测试，覆盖插件卡片、主题样式、会话日志和更新失败处理。

### Русский
- Исправлена совместимость с токенами темы DSH и взаимодействие с каталогом плагинов.
- Исправлена загрузка журналов сессии в редакторе отчёта и улучшена диагностика ошибок обновления.
- Добавлены регрессионные проверки карточки плагина, темы, журналов сессии и ошибок обновления.

## 0.1.3

- Hardened privacy redaction and report-draft persistence.
- Failed closed when the DSH authorization guard is unavailable.
- Fixed plugin settings, route error handling, and native DSH styling.
- Refactored client and server routes into testable modules without changing the runtime bundle entry point.
- Excluded internal planning and design files from the published package.

## 0.1.2

- Registered autonomous `report_issue` tool in Cordis `ctx.tools` for agent-driven error triage and safe drafting (Refs: #28).
- Added AI-assisted draft optimization via `ctx.llm` / `/dsh-issue-reporter/ai/optimize` for reproduction steps and titles (Refs: #29).
- Added live session log snippet selector via `/dsh-issue-reporter/logs` with automated redaction (Refs: #30).
- Added issue watcher with batch status polling via `/dsh-issue-reporter/issues/batch-status` (Refs: #31).
- Added smart auto-labeling and component detection via `/dsh-issue-reporter/labels` (Refs: #32).
- Added canonical one-click plugin updater in settings card from npm registry with loopback validation (Refs: #33).

- Added stable plugin style marker, theme-token styling, native chevron fallback, and reactive LocaleFace subscription (Refs: #42, #43, #44, #46).
- Split client source and server route handlers into maintainable modules while preserving the single-loader runtime bundle (Ref: #45).
- Surface authorization and upstream failures instead of silently reporting empty labels, templates, or credentials; reserve fallback behavior for documented optional cases (Ref: #47).

## 0.1.1

- Brought reporter UI design and styling to the `dsh-clinebot` standard with `ensureCss()` and native DSH design tokens (Refs: #24).
- Added top header status capsule badges for GitHub auth, inventory count, and Node.js runtime (Refs: #24).
- Protected settings card with an isolated `ErrorBoundary` component (Refs: #24).
- Added navigation tabs: Catalog, Report Editor, My Reports, and Authorization (Refs: #25).
- Added real-time instant search and filter input across installed plugins (Refs: #25).
- Added dual-mode `Write` / `Preview` views for formatted markdown inspection (Refs: #25).
- Added Device Flow 1-click `Copy Code` action with confirmation feedback (Refs: #25).
- Added screenshot attachment via `Ctrl+V` clipboard paste and interactive drag-and-drop zone with thumbnail gallery (Refs: #19).
- Added automatic environment diagnostics collection and quick-reporting for failed plugins with captured stack traces (Refs: #20).
- Added closed issues search option for duplicate detection and GitHub Issue Templates inspection (Refs: #21).
- Added persistent tracking of submitted issues with live status checks in the 'My Reports' tab (Refs: #22).
- Added multi-forge support for local and self-hosted Gitea / Forgejo repositories (Refs: #23).

## 0.1.0

- Initial public-ready development baseline for Gitea issue #1.

### 0.1.0 release candidate

- Added a DSH settings card that discovers installed plugins and separates native `@deepseek-ai/*` packages from third-party packages.
- Made the full reporter header row and supported plugin rows clickable, without duplicate trailing action buttons.
- Added GitHub OAuth App Device Flow sign-in, refresh-token handling, connected-account state, and sign-out for account switching.
- Corrected Device Flow host and query-parameter handling so OAuth requests go to `github.com` instead of the REST API host.
- Added bounded redaction for tokens, credentials, private paths, credential-bearing URLs, and email addresses.
- Added structured report drafting, preview, duplicate search, explicit confirmation, and prefilled issue-form fallback.
- Added PNG, JPG, GIF, and WebP screenshots with count, per-file, total-size, MIME, extension, base64, temporary-file, and cleanup checks.
- Added the GitHub CLI attachment path for `gh` 2.99 or newer; screenshot reports require a GitHub OAuth App token or personal access token, while reports without screenshots use the GitHub REST API.
- Added typed GitHub API errors, same-origin route protection, sanitized status responses, and no-store responses.
- Publication is owner-approved; this entry describes the candidate for the public GitHub and npm release.
