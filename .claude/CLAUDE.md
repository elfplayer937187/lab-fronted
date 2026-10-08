# agent.md

本文件描述本仓库中 AI Agent 的协作约定。**日志请写入 `.claude/logs/`（该目录已被 gitignore，不会提交）。**

## 项目概览

`lab-fronted` —— Vue 3 + TypeScript + Vite 前端项目。

- 构建工具：Vite 8
- 框架：Vue 3（`<script setup>` + Composition API）
- 状态管理：Pinia
- 路由：vue-router
- UI 组件库：Element Plus（按需自动引入）
- 样式：Tailwind CSS v4（工具类；**刻意未引入 preflight**）
- **包管理器：pnpm**（`pnpm-lock.yaml` 为唯一锁文件）

```text
src/
  main.ts            # 应用入口（Pinia / router / 图标全局注册 / 暗色变量）
  App.vue            # 根组件（el-config-provider 包裹，注入中文 locale）
  router/index.ts    # 路由定义
  stores/            # Pinia stores
  composables/       # 组合式函数
  styles/            # 全局样式入口（Tailwind v4）
  types/             # unplugin 自动生成的类型声明（需提交，勿手改）
```

## 环境要求

- Node：`^22.18.0 || >=24.12.0`（见 `package.json` 的 `engines`）
- pnpm：`>=10`，版本由 `packageManager` 字段锁定为 `pnpm@11.14.0`

Version 不符时 pnpm 只会打印 `Unsupported engine` 警告而不会中断安装，但**不要**顺手放宽 `engines` 去消除警告——应当升级本地工具链。

## 常用命令

| 命令                                   | 说明                                      |
| -------------------------------------- | ----------------------------------------- |
| `pnpm install`                         | 安装依赖                                  |
| `pnpm dev`                             | 启动开发服务器                            |
| `pnpm build`                           | 类型检查 + 生产构建                       |
| `pnpm type-check`                      | 仅做 `vue-tsc` 类型检查                   |
| `pnpm lint`                            | 依次运行 oxlint 与 eslint（均带 `--fix`） |
| `pnpm format`                          | Prettier 格式化 `src/`                    |
| `pnpm add <pkg>` / `pnpm add -D <pkg>` | 增删依赖，**不要用 `npm install`**        |

> `engines` 只声明 node；pnpm 的版本通过 `packageManager` 字段 + corepack 保证。

## 包管理约定

**本项目已从 npm 迁移到 pnpm，全程只使用 pnpm。**

- 不要运行 `npm install` / `yarn`。它们会生成 `package-lock.json` / `yarn.lock`，与 `pnpm-lock.yaml` 冲突，导致依赖树不一致。
- 提交依赖变更时，`package.json` 与 `pnpm-lock.yaml` 必须一起提交。
- 不要手工编辑 `pnpm-lock.yaml`，用 `pnpm install` / `pnpm update` 生成。
- pnpm 使用符号链接式的严格 `node_modules`：**只能 import 声明在 `package.json` 里的依赖**（npm 的扁平化 hoisting 容忍了隐式依赖，pnpm 不会）。若报 `Cannot find module`，说明该包是幽灵依赖，需要显式添加。
- 新增依赖前先确认是否真的必要，避免为一个函数引入整个包。

## UI 组件库（Element Plus）

已接入 Element Plus，采用**按需自动引入**（`unplugin-auto-import` + `unplugin-vue-components`，配置见 `vite.config.ts`）。

**不要手写 Element Plus 的 import：**

- 模板里直接用 `<el-button>` / `<el-input>` 等，插件自动引入组件**及其样式**。
- `<script setup>` 里直接用 `ElMessage` / `ElMessageBox` / `ElNotification`，插件自动引入函数及其样式。
- 自动生成的类型声明在 `src/types/`（`auto-imports.d.ts`、`components.d.ts`），由插件在 `dev` / `build` 时生成，**必须提交**——否则新克隆的仓库跑 `pnpm type-check` 会找不到组件类型。不要手工编辑这两个文件。

**两个容易踩的坑：**

1. 自动引入只覆盖 `<script>` 内的用法。想在**模板表达式**里直接写 `ElMessage.success(...)`，需要在 `AutoImport` 里开 `vueTemplate: true`；否则先包一层 script 内的函数再在模板调用（当前示例即如此）。
2. 需要**组件对象**的 prop（如 `:icon`）不能靠全局注册的名字，要从 `@element-plus/icons-vue` 显式 import。

### 图标

图标已在 `src/main.ts` 全局注册，模板里按名字直接用：`<el-icon><Search /></el-icon>`。

注意这与组件库的"按需"方向相反——所有图标都会进包。图标体积小，实践中可接受；若要极致瘦身，改为只 `import` 用到的图标。

### 语言与主题

- **语言**：`src/App.vue` 用 `<el-config-provider :locale="zhCn">` 包裹根节点，文案为简体中文。新增全局配置（尺寸、命名空间、zIndex 等）也加在这里。
- **深色模式**：`element-plus/theme-chalk/dark/css-vars.css` 已在 `src/main.ts` 引入，暗色变量挂在 `html.dark` 下。开关逻辑位于 `src/composables/useDarkMode.ts`（模块级单例，优先级：localStorage 用户选择 > 系统偏好）。自带样式请用 `var(--el-*)` 变量，才能跟随主题。

## 样式（Tailwind CSS v4）

工具类方案。配置在 `src/styles/index.css`（入口）+ `vite.config.ts` 的 `tailwindcss()` 插件，在 `main.ts` 引入。

- v4 是 **CSS 优先配置**：没有 `tailwind.config.js`，主题定制写 `@theme`，内容扫描由 Vite 插件顺着模块图自动完成（不需要 `content` 数组）。
- 加新工具类不用改任何配置，直接在模板里写。

### 刻意没有引入 preflight

只引了 `theme.css` 与 `utilities.css`，**没有引 `preflight.css`**。preflight 是全局重置，会冲掉 Element Plus 的组件样式——`button { background-color: transparent }` 让主按钮失去背景色，`*, ::before, ::after { border: 0 solid }` 让部分组件边框消失。既然已有组件库负责基础样式，工具类就够了。

**代价**：没有全局重置，原生标签的浏览器默认样式（`h1` 的字号/外边距、`ul` 圆点等）要自己用工具类处理。

### ⚠️ 最大的坑：Tailwind 工具类盖不过 Element Plus

Element Plus 的样式是**不带 `@layer` 的普通 CSS**，而 Tailwind 工具类在 `@layer utilities` 里。按 CSS 级联规则 —— **未分层的样式优先级高于任何 `@layer` 内的样式，且与书写顺序无关**（已用构建产物验证：`.el-input` 处于 brace depth 0，`.w-56` 在 `@layer utilities` 内）。

所以给 Element Plus 组件加工具类默认**不生效**：

```html
<!-- 无效：.el-input 自己写了 width:100%（未分层），盖过 .w-56 -->
<el-input class="w-56" />

<!-- 有效：! 后缀提升为 !important -->
<!-- 注意 v4 的 important 是后缀 w-56!，不是 v3 的前缀 !w-56 -->
<el-input class="w-56!" />
```

要覆盖组件样式，一律加 `!` 后缀。

给**原生元素**（`div` / `p` / `h1`…）加工具类不受影响——那些只有浏览器默认样式，优先级本来就低于作者样式。

### 深色模式已对齐

```css
@custom-variant dark (&:where(.dark, .dark *));
```

让 `dark:` 跟随 Element Plus 的 `html.dark` 类，而不是默认的 `prefers-color-scheme`，两边共用同一个开关。已验证编译产物为 `.dark\:bg-white\/10:where(.dark,.dark *)`。

### 颜色约定

写颜色优先用 `var(--el-*)`，才能跟随主题切换，如 `text-[var(--el-text-color-primary)]`。Tailwind 自带色板（`text-red-500` 等）是固定值，不会跟随暗色模式，除非配合 `dark:` 显式写两套。

### 尚未安装

`prettier-plugin-tailwindcss`（按官方顺序自动排序 class）目前**没有**装。需要的话再加上。

## 代码规范

- **格式**：由 Prettier 决定（`.prettierrc.json`）——单引号、无分号、行宽 100。不要手工调整格式，交给工具。
- **Lint**：oxlint 负责基础正确性规则，eslint 负责 Vue / TypeScript 相关规则，两者由 `eslint-plugin-oxlint` 打通。新增规则优先加在 `.oxlintrc.json`。
- **类型**：提交前必须通过 `pnpm type-check`，不要用 `any` 或 `@ts-ignore` 绕过。
- **Vue**：统一使用 `<script setup lang="ts">`，组件文件用 PascalCase 命名。
- 改动 `src/` 下的代码后，运行 `pnpm lint` 再提交。
- `.claude/**` 已在 eslint 的 `globalIgnores` 中排除，所以 agent 往 `.claude/logs/` 写临时脚本不会影响 `pnpm lint`。

## Git 约定

### 提交信息（Conventional Commits）

提交信息由 commitlint 在 `commit-msg` 钩子中强制校验，格式：

```text
<type>(<scope>): <subject>
```

允许的 `type`：`feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`。

示例：`feat(router): 新增登录页路由守卫`

### 钩子

钩子由 husky 管理（`core.hooksPath` → `.husky/_`，在 `pnpm install` 的 `prepare` 阶段安装）：

- `pre-commit`：`pnpm exec lint-staged`，对暂存文件运行 eslint --fix + prettier --write。
- `commit-msg`：`pnpm exec commitlint --edit "$1"`，校验提交信息。

**不要使用 `--no-verify` 跳过钩子**；若钩子失败，请修复根因。

## 给 Agent 的要求

1. 修改前先阅读相关文件，遵循既有代码风格，不要引入新的第三方依赖除非确有必要。
2. 不要修改 `package.json` 中已有的 lint/format 配置去迎合有问题的代码。
3. 一律使用 pnpm 命令；看到 `npm` / `yarn` 相关文件或脚本时，改写成 pnpm 等价写法。
4. 每次会话的产物、分析记录、临时笔记统一写入 `.claude/logs/`，文件名使用 `YYYY-MM-DD-<主题>.md`。
5. 除非用户明确要求，否则不要执行 `git commit` / `git push`。
