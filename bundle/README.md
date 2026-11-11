# dsh-preset-builder

在 DSH Web 界面里创建和编辑自定义 Agent 预设（Preset）：从已安装的包里收录行、编辑结构组与配置，保存后与官方预设同一套声明。顶栏提供「简易 / 标准 / 对比」三页；简易页只改名称与人设；对比页左右并排任意两个预设，按 Loader 行 id 对齐，并可展开字段级配置差异。

完整的用户文档、截图与开发说明见仓库根目录：

<https://github.com/cningan/dsh-preset-builder>

## 安装

npm 包名：`dsh-preset-builder`。在本仓库的 `bundle/` 目录或从 npm 安装后，通过 DSH 的 `plugin_manager` 安装为 bundle：

```powershell
# 本地开发（DSH 插件管理器指向本目录）
plugin_manager.install_bundle target = "D:/Work/Plugin-DSH/dsh-preset-builder/bundle"
```

安装后重启 DSH，侧栏出现「预设工坊」。Host 侧改动需重启，纯界面改动刷新页面即可。

## 许可

MIT
