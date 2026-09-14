# dsh-issue-reporter

这是一个 DeepSeek Harness 插件，用于将已发现的插件问题整理成安全、可审核的 GitHub issue。

设置卡片会读取当前 DSH 组合，并提供两个可以分别展开或折叠的列表：

- 原生 DSH 插件：package scope 为 @deepseek-ai/。
- 第三方插件：其他 package scope 的插件。

用户选择受支持的插件，填写报告，检查已隐藏敏感信息的预览和可能的重复 issue，然后明确确认后才会创建 issue。GitHub 授权从一个“使用 GitHub 登录”操作开始。Device Flow client id、凭据引用和 API 地址属于安装配置，不再作为普通用户需要填写的字段。

报告编辑器可以选择最多五张 PNG、JPG、GIF 或 WebP 截图。只有在明确确认后，截图才会从浏览器发送；服务器通过官方 GitHub CLI 附件流程（DSH 主机需要 gh 2.99 或更高版本）在临时目录中上传，命令结束后会删除临时文件。GitHub App token 不支持此附件流程，因此带截图的报告需要使用 GitHub OAuth 或个人访问令牌。不带截图的报告仍然使用 GitHub REST API。
如果安装没有配置 GitHub App client id，插件会明确提示登录不可用。如果没有授权账号，仍然会提供预填充的 issue 表单链接。

报告器遵循 DSH 原生设置交互：点击报告器的整行标题即可展开或折叠，然后点击受支持插件的整行即可打开报告编辑器。两种操作都不再使用右侧单独的按钮。

必须先在 GitHub App 注册设置中启用 Device Flow。插件从 github.com 请求临时设备代码和 OAuth token；Device Flow 参数按 GitHub API 要求通过 query 参数传递；并仅使用 api.github.com 执行已认证的 GitHub API 操作。如果登录操作返回 404 Not Found，通常表示仍在运行把 OAuth 请求发送到 REST API 域名的旧版本。

## 文档

- [设计契约](docs/design/DESIGN.md)
- [Issue #1 实现计划](docs/plans/issue-1-github-issue-reporter.md)
- [Issue #3 UX、授权和分组计划](docs/plans/issue-3-ux-auth-plugin-groups.md)
- [English documentation](README.md)
- [Russian documentation](README.ru.md)

## 开发

运行确定性的测试套件：

    npm test

GitHub App 注册、发布和生产部署需要单独的所有者批准。
