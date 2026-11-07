# Changelog

## 0.1.18

### Added
- **AI Root-Cause Attribution & Failure Categorization (#99)**:
  - Added `classifyRootCause` heuristically matching stack traces and logs against known DSH failure modes: deprecated `settings.register`, React hook collisions, missing modules (`ENOENT`), permission issues (`EACCES`), and port collisions (`ECONNREFUSED`).
  - Automatically enriches `/dsh-issue-reporter/ai/optimize` payload with identified failure classification and confidence score.
- **Bilingual Report Generator EN + ZH (#100)**:
  - Added `generateBilingualReport` creating clean parallel English and Chinese sections for upstream DSH core maintainers.
  - Added `includeChinese` toggle in issue form with strict privacy redaction across both language blocks.
- **Minimal Reproducible Example (MRE) Generator (#101)**:
  - Added `generateMreScript` producing standalone runnable Node.js reproduction scripts from route signatures, HTTP methods, and sanitized error payloads.
  - Added `POST /dsh-issue-reporter/mre` endpoint and client action to insert MRE scripts directly into issue drafts.
- **Agent Tool Execution Replayer (#130)**:
  - Added `AgentReplayer` keeping a 10-call circular ring buffer of agent tool calls with sanitized arguments and duration metrics.
  - Added `GET /dsh-issue-reporter/agent-replay` endpoint and client action to attach recent tool interactions to bug reports.

## 0.1.17

### English
- **Conflict Detector (#98)**:
  - Added route collision detection across registered HTTP endpoints, detecting overlapping paths and method shadowing between plugins.
  - Added Cordis service provider collision detection flagging multiple plugins implementing identical singleton service names.
  - Added UI Slot collision detection identifying competing microfrontend widgets.
  - Introduced `GET /dsh-issue-reporter/conflicts` endpoint and cross-plugin conflict Markdown report formatter linking competing repositories.
  - Added optional `conflictingPlugin` selector in Report Editor to file cross-plugin collision reports.
- **Network & Route Harvester (#111)**:
  - Passive 10-event ring buffer capturing client HTTP 4xx/5xx failures, network errors, timeouts, and CORS errors.
  - Automated redaction of sensitive query params (`token`, `access_token`, `secret`, `key`), headers (`Authorization`, `Cookie`, `x-token`), and request/response payloads.
  - Safe reproduction `curl` command generation with sanitized parameters.
  - 1-click "Insert network failure (curl)" button in Report Editor reproduction steps.
- **Config Schema Drift & Corruption Linter (#126)**:
  - Automated validation of plugin settings against declared JSON / Schemastery schemas.
  - Detects syntax corruption, type mismatches (e.g. string vs number), missing required fields, and obsolete configuration keys remaining after plugin updates.
  - Generates sanitized visual diff Markdown report with secret redactions via `GET /dsh-issue-reporter/config-lint`.
  - 1-click "Lint plugin settings" button in Report Editor environment section.
- **Pnpm Multi-Instance & Hook Conflict Auditor (#127)**:
  - Scans profile dependency tree for duplicate singleton libraries (`react`, `react-dom`, `@cordisjs/core`, `cordis`).
  - Detects duplicate React copies that trigger fatal `"Invalid hook call"` microfrontend errors.
  - Provides diagnostic endpoint `GET /dsh-issue-reporter/dependency-audit` and actionable developer remediation recommendations (`pnpm dedupe`, peer dependency alignment).
  - Diagnostic metrics surfaced in `/dsh-issue-reporter/status` (`detectedConflicts`, `hookConflictRisk`).

### Русский
- **Conflict Detector (#98) — Детекция коллизий между плагинами**:
  - Обнаружение конфликтов маршрутов `webServer`: детекция дублирующихся HTTP-эндпоинтов и затенения методов между различными плагинами.
  - Детекция коллизий служб Cordis: выявление попыток регистрации одной службы несколькими плагинами-провайдерами.
  - Детекция конфликтов UI-слотов микрофронтендов.
  - Эндпоинт `GET /dsh-issue-reporter/conflicts` и генератор кросс-плагинного Markdown-отчета со ссылками на оба репозитория.
  - Поддержка выбора конфликтующего плагина в форме репорта для кросс-модульных дефектов.
- **Network & Route Harvester (#111) — Перехват сетевых сбоев роутов**:
  - Пассивный кольцевой буфер на 10 событий для фиксации сетевых сбоев 4xx/5xx, CORS и таймаутов клиентских запросов.
  - Автоматическая санитизация токенов и паролей в URL, заголовках (`Authorization`, `Cookie`) и телах запросов/ответов.
  - Генерация готовой безопасной команды `curl` для быстрой воспроизводимости разработчиками.
  - Кнопка «Вставить сетевой сбой (curl)» в шагах воспроизведения редактора репортов.
- **Config Schema Drift & Corruption Linter (#126) — Линтер схемы конфигурации**:
  - Валидация файла настроек плагина против его объявленной схемы (Schemastery / JSON Schema).
  - Выявление несоответствий типов (строка вместо числа), отсутствующих обязательных ключей и устаревших параметров после обновлений.
  - Форматированный визуальный diff с санитизацией секретов через эндпоинт `GET /dsh-issue-reporter/config-lint`.
  - Кнопка «Сверить настройки плагина» в секции окружения редактора.
- **Pnpm Multi-Instance Auditor (#127) — Аудитор задвоения зависимостей**:
  - Сканирование дерева зависимостей профиля на наличие дубликатов синглтонов (`react`, `react-dom`, `@cordisjs/core`).
  - Выявление изолированных копий React, вызывающих критическую ошибку `Invalid hook call` в слотах микрофронтендов.
  - Эндпоинт `GET /dsh-issue-reporter/dependency-audit` с практическими рекомендациями по устранению (`pnpm dedupe`, peerDependencies).
  - Интеграция метрик коллизий и риска хуков в диагностический эндпоинт `/status`.


## 0.1.16

### English
- **Client-Side Secret & Token Pre-Flight Redaction**:
  - Implemented `redactClientText` in client runtime matching server redactions for GitHub tokens, API keys, bearer credentials, local paths, emails, and private LAN IPs.
  - Hardened `CrashWatcher` and `ErrorBoundary` to cleanse error messages and stack traces at the source before rendering, copying to clipboard, or drafting bug reports.
  - Sanitized runtime error notifications in settings card to eliminate credential or token leakage.
- **Action Trail Privacy & Password Protection**:
  - Excluded password fields (`input[type="password"]` and `[data-sensitive="true"]`) from action trail interaction tracking.
  - Sanitized element labels and button text through `redactClientText` before buffering.
- **SSRF Protocol Restriction**:
  - Enforced strict HTTP and HTTPS protocol whitelist in `parseForgeRepository`, rejecting `file:`, `javascript:`, `ftp:`, and non-routable pseudo-protocols.
- **Dead Export & Lifecycle Hardening**:
  - Integrated `getMetadataCache` size into live `/dsh-issue-reporter/status` diagnostic payload (`metadataCacheEntries`).
  - Flush `_clearIssueStatusCache` on device logout to avoid stale cache across sessions.
  - Normalized all catch bindings across `lib/` and `src/client/` modules with explicit error variables.
- **Verification**:
  - Added test suite `test/security-audit-v0116.test.mjs` verifying protocol validation, client redaction, and cache lifecycle (77 passing tests).

### Русский
- **Клиентская защита от утечек токенов и секретов**:
  - Реализована функция `redactClientText` в клиентской части плагина, маскирующая GitHub-токены, API-ключи, Bearer-учётные данные, локальные пути, email и приватные LAN IP.
  - `CrashWatcher` и `ErrorBoundary` теперь фильтруют текст ошибки и трейс стека на месте — до отображения, копирования в буфер обмена или формирования репорта.
  - Баннер перехвата сбоев в карточке настроек очищает все чувствительные данные.
- **Защита паролей и приватности в Action Trail**:
  - Добавлено безусловное исключение полей ввода паролей (`input[type="password"]` и `[data-sensitive="true"]`) из отслеживания действий.
  - Все подписи кнопок и элементов перед записью в кольцевой буфер проходят через `redactClientText`.
- **Защита от SSRF и валидация протоколов**:
  - В `parseForgeRepository` внедрена строгая валидация протокола: разрешены только HTTP и HTTPS; `file:`, `javascript:`, `ftp:` и относительные псевдо-протоколы блокируются.
- **Очистка неиспользуемых экспортов и жизненный цикл**:
  - `getMetadataCache` подключён к рабочему эндпоинту `/dsh-issue-reporter/status` (`metadataCacheEntries`).
  - Сброс кэша статусов `_clearIssueStatusCache` вызывается при выходе из аккаунта (`/device/logout`).
  - Все `catch`-блоки в `lib/` и `src/client/` приведены к единому стандарту с явным объявлением ошибок.
- **Проверка и тесты**:
  - Создан тестовый сьют `test/security-audit-v0116.test.mjs` с проверкой безопасности протоколов, клиентской санитизации и кэша (всего 77 тестов успешно проходят).

### 中文
- **前端敏感令牌与凭证预过滤保护**：
  - 在前端运行时实现 `redactClientText`，严格匹配后端脱敏规则，自动遮蔽 GitHub 令牌、API 密钥、Bearer 凭据、本地文件路径、邮箱与内网 IP。
  - 加固 `CrashWatcher` 与 `ErrorBoundary`，在渲染、复制到剪贴板或生成 Issue 之前对错误信息及调用栈进行源头清洗。
  - 清理设置卡片中的异常横幅数据，彻底杜绝令牌外泄。
- **操作轨迹隐私与密码字段防护**：
  - 在操作轨迹捕获中排斥密码输入框（`input[type="password"]` 与 `[data-sensitive="true"]`）。
  - 所有控件标签与按钮文案在写入环形队列前均执行 `redactClientText` 过滤。
- **SSRF 协议限制与地址安全**：
  - 在 `parseForgeRepository` 中强制仅允许 HTTP 与 HTTPS 协议，禁止 `file:`、`javascript:`、`ftp:` 等协议。
- **死代码导出清理与缓存生命周期**：
  - 将 `getMetadataCache` 接入 `/dsh-issue-reporter/status` 诊断接口返回（`metadataCacheEntries`）。
  - 在注销接口 `/device/logout` 中自动清空 Issue 状态缓存 `_clearIssueStatusCache`。
  - 规范化 `lib/` 与 `src/client/` 中的所有异常捕获语法。
- **验证与测试**：
  - 新增 `test/security-audit-v0116.test.mjs` 测试套件，覆盖协议校验、前端脱敏与缓存更新机制（全套 77 个测试全部通过）。

## 0.1.15

### English
- **Environment Health Snapshot (#97)**:
  - Added `getEnvironmentSnapshot` and `formatEnvironmentMarkdown` in `lib/domain.js` capturing DSH core version, Node.js version, platform, architecture, OS release, active profile, process uptime, and memory usage (RSS / Heap).
  - Registered `GET /dsh-issue-reporter/environment` route and enriched `/dsh-issue-reporter/status` diagnostics.
  - Enhanced `composeIssueDraft` to automatically format and embed environment snapshots into bug reports.
- **1-Click Crash-to-Issue Interception (#96)**:
  - Implemented `CrashWatcher` in client listening for `window.error` and `unhandledrejection` events.
  - Added in-place notification banner with a "1-Click Bug Report" action pre-filling error message, stack trace, target plugin, and diagnostic snapshot.
- **User Action Trail Ring Buffer (#110)**:
  - Implemented passive, privacy-safe 15-event in-memory ring buffer tracking interactive clicks and navigation without recording form text, keystrokes, or passwords.
  - Added 1-click action trail insertion into reproduction steps with relative timestamp offsets.
- **Native React Error Boundary Injection (#125)**:
  - Upgraded client `ErrorBoundary` into a graceful recovery card trapping render crashes to prevent white-screen failures.
  - Provided in-place controls: "Copy Stack", "Report Issue", and "Retry" remounting.
- **Documentation & Verification**:
  - Added comprehensive test suite `test/diagnostics-release-1.test.mjs` (74 passing tests total).
  - Updated English, Russian, and Chinese documentation in `README.md`, `README.ru.md`, `README.zh.md`, and `docs/design/DESIGN.md`.

### Русский
- **Снимок здоровья окружения (#97)**:
  - Реализованы функции `getEnvironmentSnapshot` и `formatEnvironmentMarkdown` в `lib/domain.js` для сбора версии ядра DSH, Node.js, платформы, архитектуры, релиза ОС, имени профиля, времени работы и метрик памяти (RSS / Heap).
  - Добавлен серверный маршрут `GET /dsh-issue-reporter/environment` и расширен ответ `/dsh-issue-reporter/status`.
  - `composeIssueDraft` теперь автоматически форматирует и встраивает срез окружения в тело тикета.
- **Перехват сбоев 1-Click Crash-to-Issue (#96)**:
  - Реализован `CrashWatcher` на клиенте для перехвата необработанных сбоев `window.error` и `unhandledrejection`.
  - Добавлен нативный баннер «Crash detected» с кнопкой «1-Click Bug Report», предзаполняющий форму репорта ошибкой, трейсом, плагином и срезом системы.
- **Кольцевой буфер действий пользователя (#110)**:
  - Создан защищенный ring-buffer на 15 событий взаимодействия пользователя без сбора вводимых текстов, паролей или токенов.
  - Добавлена кнопка быстрой вставки истории действий в шаги воспроизведения с относительными таймингами.
- **Нативный React Error Boundary (#125)**:
  - Компонент `ErrorBoundary` расширен до карточки восстановления, предотвращающей падение всего интерфейса в белый экран.
  - Предоставлены кнопки: «Копировать стек», «Создать багрепорт» и «Повторить».
- **Документация и тесты**:
  - Добавлен набор тестов `test/diagnostics-release-1.test.mjs` (всего 74 теста проходят успешно).
  - Обновлены описания в `README.md`, `README.ru.md`, `README.zh.md` и `docs/design/DESIGN.md`.

### 中文
- **运行环境健康快照 (#97)**：
  - 在 `lib/domain.js` 中新增 `getEnvironmentSnapshot` 与 `formatEnvironmentMarkdown`，采集 DSH 核心版本、Node.js 版本、系统架构、发行版、当前配置方案及内存占用。
  - 注册 `GET /dsh-issue-reporter/environment` 路由并在 `/status` 中返回丰富的系统健康指标。
  - `composeIssueDraft` 支持自动解析并向 Issue 草稿追加环境诊断信息。
- **一键崩溃上报拦截器 (#96)**：
  - 在前端实现 `CrashWatcher` 监听全局运行时异常和未捕获的 Promise 拒绝。
  - 弹出顶部快捷上报横幅，一键自动填充错误信息、调用栈、关联插件与系统快照。
- **用户操作轨迹环形缓冲区 (#110)**：
  - 构建轻量安全的 15 条操作历史环形队列，仅记录安全交互控件类型与标签，绝不采集表单输入文本、密码与密钥。
  - 支持一键插入带相对时间戳的复现步骤。
- **原生 React Error Boundary 保护 (#125)**：
  - 将前端 `ErrorBoundary` 升级为具备自我恢复能力的容错卡片，彻底杜绝白屏问题。
  - 提供“复制堆栈”、“反馈异常”与“重试”操作按钮。
- **文档与测试**：
  - 新增专用单元测试套件 `test/diagnostics-release-1.test.mjs`（共 74 项测试全部通过）。
  - 同步更新英文、俄文与中文文档及 `docs/design/DESIGN.md` 设计契约。

## 0.1.14

### English
- **Supply-Chain Security Guard Restoration (#93)**:
  - Removed `--config.minimumReleaseAge=0` argument from `spawn` execution in `lib/plugin-updater.js`, ensuring pnpm's default release-age verification remains enforced during plugin auto-updates.
- **Dead Event Subscriptions & Fallback Clean-up (#93)**:
  - Eliminated unused `config` event listeners (`ctx.on('config')` and `ctx.off('config')`) in `lib/index.js` `bindEvents`.
  - Simplified `settingsSvc` assignment in `lib/index.js` `ctx.inject(['settings'], ...)`, removing the redundant `sctx.get('settings')` fallback.
- **Testing & Design Contract**:
  - Added regression test verifying absence of `--config.minimumReleaseAge` in `test/updater.test.mjs`.
  - Updated `test/settings.test.mjs` to assert absence of `config` listener and verify `settings/document-updated`.
  - Updated design contract in `docs/design/DESIGN.md`.

### Русский
- **Восстановление защиты supply-chain в апдейтере (#93)**:
  - Удалён аргумент `--config.minimumReleaseAge=0` при вызове `spawn` в `lib/plugin-updater.js`, восстановив штатную проверку возраста релиза в pnpm при автоматических обновлениях плагина.
- **Очистка мёртвых подписок на события и избыточных фоллбеков (#93)**:
  - Удалены неиспользуемые слушатели события `config` (`ctx.on('config')` и `ctx.off('config')`) в `bindEvents` (`lib/index.js`).
  - Упрощено присваивание `settingsSvc` в `lib/index.js` (`ctx.inject(['settings'], ...)`), удалён мёртвый fallback `sctx.get('settings')`.
- **Тесты и дизайн-контракт**:
  - Добавлен тест регрессии в `test/updater.test.mjs`, проверяющий отсутствие флага `minimumReleaseAge`.
  - Обновлён `test/settings.test.mjs` с проверкой отсутствия слушателя `config` и тестом `settings/document-updated`.
  - Синхронизирован дизайн-документ `docs/design/DESIGN.md`.

### 中文
- **恢复更新器供应链安全防护 (#93)**：
  - 在 `lib/plugin-updater.js` 的 `spawn` 执行参数中移除 `--config.minimumReleaseAge=0`，确保插件自动更新时完整保留 pnpm 默认的版本发布时间窗口安全防护机制。
- **清理无用事件监听与冗余回退 (#93)**：
  - 在 `lib/index.js` 的 `bindEvents` 中移除未触发的 `config` 事件监听器（`ctx.on('config')` 和 `ctx.off('config')`）。
  - 简化 `lib/index.js` 中 `ctx.inject(['settings'], ...)` 的 `settingsSvc` 赋值，移除冗余的 `sctx.get('settings')` 回退逻辑。
- **测试与设计契约**：
  - 在 `test/updater.test.mjs` 中增加回归测试，验证更新器中不存在 `minimumReleaseAge` 参数。
  - 在 `test/settings.test.mjs` 中增加断言确认 `config` 监听已移除，并验证 `settings/document-updated` 响应。
  - 同步更新 `docs/design/DESIGN.md` 设计规范。

## 0.1.13

### English
- **Subprocess Environment Isolation & CLI Error Sanitization (#75, #81)**:
  - Enforced an isolated environment whitelist (`PATH`, `HOME`, `USERPROFILE`, `SYSTEMROOT`, `WINDIR`, `TMPDIR`, proxies, `GH_HOST`, `GH_TOKEN`) for the `gh` child process in `lib/attachments.js`, preventing leakage of host secrets (`DEEPSEEK_*`, `GITEA_*`, DSH internal keys).
  - Restriced temporary upload directories to mode `0700` and files (`issue.md`, screenshot attachments) to mode `0600`.
  - Added strict `ghPath` binary validation ensuring executable names or absolute files only.
  - Sanitized CLI error messages: scrubbed tokens and sensitive parameters via `redactText` before re-throwing to HTTP clients.
- **In-Memory Package Metadata Resolution Cache (#76)**:
  - Cached `packageMetadata` `require.resolve` and `package.json` lookups in `lib/index.js` with a 60-second TTL, eliminating redundant disk I/O on every `/status` check.
  - Automatically invalidated the metadata cache on live configuration and loader update events.
- **Safety & Regression Tests**: added full coverage in `test/attachments.test.mjs` and `test/settings.test.mjs`.
- **Design Contract**: codified subprocess environment isolation, temporary file modes, and metadata cache invariants in `docs/design/DESIGN.md`.

### Русский
- **Изоляция окружения дочернего процесса GitHub CLI и очистка вывода (#75, #81)**:
  - Реализован белый список переменных окружения (`PATH`, `HOME`, `USERPROFILE`, `SYSTEMROOT`, `WINDIR`, `TMPDIR`, прокси, `GH_HOST`, `GH_TOKEN`) в `buildSafeEnv` (`lib/attachments.js`), предотвращающий утечку секретов хоста (`DEEPSEEK_*`, `GITEA_*`, учетных данных DSH).
  - Установлены строгие права доступа: каталог временного размещения создается с режимом `0700`, а файлы отчета и скриншотов — с режимом `0600`.
  - Добавлена валидация `ghPath`: разрешены только безопасные имена команд либо абсолютные исполняемые файлы.
  - Сообщения об ошибках `gh` десенсибилизируются через `redactText` и замену токенов перед отправкой клиенту.
- **Кэширование метаданных плагинов в памяти (#76)**:
  - Добавлен кэш в памяти с TTL 60 секунд для вызовов `packageMetadata` (`require.resolve` и чтение `package.json`) в `lib/index.js`, устраняющий повторные дисковые операции при каждом обращении к `/status`.
  - Обеспечен автоматический сброс кэша при обновлении конфигурации и событиях лоадера (`loader/volatile-update`).
- **Тесты регрессии**: добавлены тесты в `test/attachments.test.mjs` и `test/settings.test.mjs`.
- **Дизайн-контракт**: инварианты изоляции процессов и кэширования зафиксированы в `docs/design/DESIGN.md`.

### 中文
- **GitHub CLI 子进程环境隔离与输出脱敏 (#75, #81)**：
  - 在 `lib/attachments.js` 中引入环境变量白名单机制（`buildSafeEnv`），为 `gh` 子进程仅提供必需系统变量与凭证（`PATH`、`HOME`、`USERPROFILE`、`SYSTEMROOT`、`WINDIR`、`TMPDIR`、代理设置、`GH_HOST`、`GH_TOKEN`），杜绝 `DEEPSEEK_*`、`GITEA_*` 等宿主敏感环境变量泄露。
  - 严格限制临时目录权限至 `0700`，议题正文与截图文件模式限制至 `0600`。
  - 增加 `ghPath` 二进制路径安全校验，仅允许合法命令名或已存在的绝对路径文件。
  - CLI 错误回显脱敏：捕获 CLI 异常时对错误输出中的 Token、认证头及路径执行 `redactText` 净化并限制长度后再抛出。
- **内存包元数据解析缓存 (#76)**：
  - 在 `lib/index.js` 中为 `packageMetadata`（`require.resolve` 与 `package.json` 读取）引入 60 秒 TTL 内存缓存，彻底消除每次请求 `/status` 时的重复磁盘 I/O。
  - 在配置热更新及加载器更新事件触发时自动清空元数据缓存。
- **回归与安全测试**：在 `test/attachments.test.mjs` 与 `test/settings.test.mjs` 中添加全面测试覆盖。
- **设计契约**：在 `docs/design/DESIGN.md` 中补充了子进程隔离与元数据缓存安全规范。

## 0.1.12

### English
- **Hardened Secret and Path Redaction (#80)**: reinforced `redactText` in `lib/domain.js` against data leakage across public issue bodies, session logs, and AI optimization prompts.
  - Suffix matching without left word boundary now scrubs compound credential keys such as `access_token=`, `refresh_token:`, `client_secret=`, `api_key=`, `secret_key=`, and `auth_token=`.
  - Added support for camelCase credential keys (`accessToken:`, `refreshToken:`, `clientSecret:`, `apiKey:`, `userPassword:`).
  - Added redaction for `Authorization: Basic` and `Authorization: Basic <base64>` header representations alongside existing Bearer auth handling.
  - Expanded filesystem path detection to all standard POSIX root directories (`/etc`, `/var`, `/tmp`, `/root`, `/usr`, `/bin`, `/sbin`, `/lib`, `/proc`, `/sys`, `/dev`, `/opt`, `/mnt`, `/srv`, etc.), Windows drive letter paths with both forward and backslashes (`C:/...`, `C:\...`), and Windows UNC shares (`\\server\share`).
  - Preserved standard public web URLs (`https://...`, `http://...`) and common MIME types (`application/json`) from false-positive truncation.
- **Safety & Regression Tests**: added targeted unit test suite in `test/domain.test.mjs` verifying each credential and path format.
- **Design Contract**: updated redaction guarantees in `docs/design/DESIGN.md`.

### Русский
- **Усиление десенсибилизации секретов и путей файловой системы (#80)**: закрыты уязвимости очистки конфиденциальных данных в `redactText` (`lib/domain.js`), применяемом к черновикам issue, логам сессии хоста и промптам AI-оптимизации.
  - Матчинг суффиксов без строгой левой границы очищает составные ключи: `access_token=`, `refresh_token:`, `client_secret=`, `api_key=`, `secret_key=`, `auth_token=`.
  - Добавлена очистка ключей в camelCase (`accessToken:`, `refreshToken:`, `clientSecret:`, `apiKey:`, `userPassword:`).
  - Добавлен перехват заголовков `Authorization: Basic` и `Authorization: Basic <base64>` в дополнение к существующему Bearer auth.
  - Обнаружение путей файловой системы расширено на все стандартные корни POSIX (`/etc`, `/var`, `/tmp`, `/root`, `/usr`, `/bin`, `/sbin`, `/lib`, `/proc`, `/sys`, `/dev`, `/opt`, `/mnt`, `/srv` и др.), пути Windows-дисков с прямым и обратным слешем (`C:/...`, `C:\...`) и сетевые UNC-пути (`\\server\share`).
  - Обеспечена сохранность стандартных веб-ссылок (`https://...`, `http://...`) и MIME-типов (`application/json`) без ложных срабатываний.
- **Тесты регрессии**: в `test/domain.test.mjs` добавлен сьют тестов, проверяющий каждый формат из требований безопасности.
- **Дизайн-контракт**: правила десенсибилизации зафиксированы в `docs/design/DESIGN.md`.

### 中文
- **强化凭据与文件系统路径脱敏机制 (#80)**：全面强化 `lib/domain.js` 中 `redactText` 的过滤规则，杜绝公开 Issue 正文、宿主会话日志及 AI 提示词中的敏感信息泄露。
  - 支持无左词边界后缀匹配，全面脱敏复合凭证键名：`access_token=`、`refresh_token:`、`client_secret=`、`api_key=`、`secret_key=`、`auth_token=`。
  - 新增对小驼峰命名（camelCase）凭证字段的识别与脱敏（`accessToken:`、`refreshToken:`、`clientSecret:`、`apiKey:`、`userPassword:`）。
  - 新增对 HTTP `Authorization: Basic` 及 `Authorization: Basic <base64>` 凭证头的脱敏支持。
  - 文件系统路径脱敏扩展至所有标准 POSIX 根目录（`/etc`、`/var`、`/tmp`、`/root`、`/usr`、`/bin`、`/sbin`、`/lib`、`/proc`、`/sys`、`/dev`、`/opt`、`/mnt`、`/srv` 等）、正反斜杠格式的 Windows 驱动器路径（`C:/...`、`C:\...`）以及 Windows UNC 共享路径（`\\server\share`）。
  - 严格保持标准 Web URL（`https://...`、`http://...`）与 MIME 类型（`application/json`）的完整性，杜绝误伤。
- **回归与安全测试**：在 `test/domain.test.mjs` 中添加专项单元测试，覆盖所有凭证与路径格式。
- **设计契约**：在 `docs/design/DESIGN.md` 中更新了脱敏安全规范。

## 0.1.11

### English
- **Autonomous Agent Tool Safety Hardening (#79)**: eliminated autonomous upstream issue creation in the `report_issue` Cordis tool (`lib/routes/agent-tool.js`). Removed the `confirm_submit` argument from the tool schema and execution path. When invoked by an agent, `report_issue` now strictly prepares a sanitized bug report draft with prefilled review URLs (`submitted: false`) for explicit human review. Upstream issue creation requires interactive browser-based confirmation through `/dsh-issue-reporter/create`.
- **Safety & Regression Tests**: added verification in `test/routes.test.mjs` ensuring `confirm_submit` is absent from parameters and direct creation API calls are never triggered even if passed.
- **Design Contract**: updated agent tool boundaries and human review invariants in `docs/design/DESIGN.md`.

### Русский
- **Безопасность автономного вызова инструмента агента (#79)**: устранена возможность прямой публикации issue во внешние репозитории без участия человека через инструмент `report_issue` (`lib/routes/agent-tool.js`). Из схемы и логики инструмента полностью удалён параметр `confirm_submit`. При вызове агентом инструмент всегда возвращает очищенный черновик с предзаполненным URL (`submitted: false`) для ручной проверки человеком. Создание issue на GitHub/Gitea доступно исключительно через интерактивный интерфейс браузера с явным подтверждением `/dsh-issue-reporter/create`.
- **Тесты регрессии**: в `test/routes.test.mjs` добавлен тест, проверяющий отсутствие `confirm_submit` в схеме инструмента и гарантию запрета вызова API создания issue даже при попытке передачи флага.
- **Дизайн-контракт**: обновлены границы автономного инструмента и инварианты обязательного подтверждения человеком в `docs/design/DESIGN.md`.

### 中文
- **自主智能体工具安全加固 (#79)**：彻底移除了 Cordis `report_issue` 工具（`lib/routes/agent-tool.js`）中未经人类确认直接向上游代码托管平台创建 issue 的逻辑。从工具参数模式与执行路径中完全移除了 `confirm_submit` 参数。智能体调用时始终仅生成脱敏的缺陷草稿与预填充审查链接（`submitted: false`），由人类用户审查。实际向上游仓库创建 issue 严格限定于浏览器交互界面并通过 `/dsh-issue-reporter/create` 进行显式确认。
- **回归与安全测试**：在 `test/routes.test.mjs` 中添加测试用例，校验 `confirm_submit` 已从工具定义中彻底移除，且即便传入该参数也绝不触发远程 API 创建。
- **设计契约**：在 `docs/design/DESIGN.md` 中更新了自主工具边界与人工确认安全规范。

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
