# dsh-issue-reporter

这是一个 DeepSeek Harness 插件，用于将已发现的插件问题整理成安全、可审核的
GitHub issue。

插件读取当前 DSH 组合，识别 package metadata 指向 GitHub 的插件，生成经过隐藏
敏感信息的报告草稿，搜索开放 issue 中的重复项，并且只有在用户明确确认后才创建
issue。没有 GitHub 授权时，插件会提供预填充的 issue 表单链接。

## 文档

- [设计契约](docs/design/DESIGN.md)
- [实现计划](docs/plans/issue-1-github-issue-reporter.md)

## 开发

运行确定性的测试套件：

    npm test

GitHub App 注册、发布和生产部署不属于当前开发 issue。
