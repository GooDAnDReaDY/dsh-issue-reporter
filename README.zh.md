# dsh-issue-reporter

这是一个 DeepSeek Harness 插件，用于将已发现的插件问题整理成安全、可审核的 GitHub issue。

设置卡片会读取当前 DSH 组合，并提供两个可以分别展开或折叠的列表：

- 原生 DSH 插件：package scope 为 @deepseek-ai/。
- 第三方插件：其他 package scope 的插件。

用户选择受支持的插件，填写报告，检查已隐藏敏感信息的预览和可能的重复 issue，然后明确确认后才会创建 issue。GitHub 授权从一个“使用 GitHub 登录”操作开始。Device Flow client id、凭据引用和 API 地址属于安装配置，不再作为普通用户需要填写的字段。

如果安装没有配置 GitHub App client id，插件会明确提示登录不可用。如果没有授权账号，仍然会提供预填充的 issue 表单链接。

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
