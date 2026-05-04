# Claude Code 中文增强工具箱

这个项目把两件事整理到一起：

1. `Claude/Codex 桌面端界面中文化`
2. `Slash 技能列表 / 悬停说明自动中文化`

适合 Windows 便携版 Claude/Codex 桌面端用户使用。  
目标是：**别人拉取你的项目后，也能把桌面端和技能列表一起汉化，并且新增技能后仍可自动显示中文。**

## 我建议的仓库名

- `claude-code-zh-toolkit`

如果你想更像成品项目，也可以用：

- `claude-code-desktop-zh-cn`
- `claude-code-zh-cn-portable-kit`
- `claude-code-ui-skill-zh`

我推荐你最终就用：

- `claude-code-zh-toolkit`

## 项目结构

- `desktop/skill-display-patch.js`
  - 前端显示层补丁
  - 负责把技能列表、tooltip、部分界面英文改成中文
  - 支持自动翻译和本地缓存

- `skills/sync_skill_chinese.py`
  - 技能中文同步器
  - 自动扫描 `~/.codex/skills` 和 `~/.codex/plugins`
  - 给技能补 `display_name`、`short_description`
  - 生成 `技能作用.txt`
  - 生成前端显示映射 `skill_display_map.json`

- `scripts/install_portable_zh.ps1`
  - 安装脚本
  - 把补丁文件复制到便携版目录
  - 把技能同步脚本安装到用户本地 `~/.codex/tools/skill-chinese`
  - 创建开机自启 watcher

- `scripts/sync_once.cmd`
  - 手动执行一次技能中文同步

## 适用场景

- 你已经有一个可运行的 Claude/Codex Windows 便携版
- 你想让界面尽量显示中文
- 你想让 `/` 技能列表和悬停说明尽量自动中文化
- 你想让新增技能后也自动进入中文显示

## 安装方法

### 1）先准备便携版目录

例如你的便携版根目录是：

- `D:\ClaudeZhCN\Claude`

脚本里要传入的目录应该是：

- `D:\ClaudeZhCN\Claude`

也就是**包含 `resources\ion-dist` 的那个目录**。

### 2）以管理员或普通 PowerShell 运行安装脚本

示例：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install_portable_zh.ps1 -PortableRoot "D:\ClaudeZhCN\Claude"
```

### 3）安装完成后

脚本会自动：

- 复制前端补丁
- 安装技能中文同步器
- 创建开机启动 watcher
- 立即同步一次技能中文

## 工作原理

### 一、桌面端界面中文化

核心做法不是改程序逻辑，而是改**前端显示层**：

- 在 `index.html` 注入 `skill-display-patch.js`
- 监听页面 DOM 变化
- 替换技能列表文本
- 替换 tooltip / `title` / `aria-label`
- 对漏网英文做自动翻译并缓存到本地

这样做的优点：

- 不改真实技能 ID
- 不影响功能调用
- 主要改变“你看到的文字”

### 二、技能中文化

`sync_skill_chinese.py` 会：

- 扫描 `~/.codex/skills`
- 扫描 `~/.codex/plugins`
- 读取 `SKILL.md`、`openai.yaml`、`plugin.json`
- 自动翻译英文技能名和说明
- 写回 `display_name` / `short_description`
- 生成 `技能作用.txt`
- 生成 `skill_display_map.json`

### 三、新增技能为什么也能自动中文

因为安装脚本会创建一个 watcher：

- 开机后自动运行
- 定时检查 `~/.codex/skills` / `~/.codex/plugins`
- 一旦发现有新增或修改，就重新生成中文映射

所以：

- 新技能加入后，能自动补中文名
- 前端补丁会读取最新映射
- 重启电脑后仍然生效

## 注意事项

- 这个项目更适合 **Windows 便携版 Claude/Codex 桌面端**
- 不同版本前端资源结构可能不同
- 如果官方以后大改前端，`index.html` 注入点可能需要重新适配
- 部分英文来自应用内部动态命令或远端注入内容，第一次出现时可能需要等几秒自动翻译缓存

## 手动同步技能中文

双击：

- `scripts/sync_once.cmd`

或者手动运行：

```powershell
python .\skills\sync_skill_chinese.py --once
```

## 自定义翻译

你可以手动编辑：

- `skills/skill_chinese_overrides.json`

用来覆盖某些技能名或说明。

## 适合你发布时的说明一句话

> 这是一个面向 Windows 便携版 Claude/Codex 桌面端的中文增强项目，包含界面显示层汉化、Slash 技能列表中文化、tooltip 自动翻译缓存，以及新增技能自动中文同步能力。
