# 今日一记（Daily Note）

一款极简个人文字记录应用。所有内容仅保存在设备本地，无需注册登录，也不依赖网络。

- **技术栈**：React Native + Expo SDK 58 + Expo Router + TypeScript
- **目标平台**：Android（同时支持 iOS 与 Web）
- **数据存储**：`@react-native-async-storage/async-storage`（本地持久化）

## 功能

- 首页记录列表（标题、摘要、更新时间），支持滚动与空状态
- 新增 / 编辑记录（标题 + 正文，中文输入与多行文本支持）
- 记录详情（完整内容、创建 / 更新时间）
- 删除记录（带确认提示）
- 关于页面（应用信息、版本号、隐私政策入口、意见反馈）
- 隐私政策页面
- 本地数据损坏时的安全错误处理（不静默覆盖）

## 环境要求

- Node.js 20 或更高版本（推荐 22 LTS / 24）
- npm
- 真机测试：Android 手机 + Expo Go，或 Android Studio 模拟器
- 打包发布：Expo 账号（用于 EAS Build）

## 安装与启动

```bash
npm install        # 安装依赖
npx expo start     # 启动开发服务器
```

启动后在终端中按：

- `a` → Android 模拟器
- `w` → 浏览器
- 手机安装 **Expo Go** 后扫描二维码（需同一局域网；不通则加 `--tunnel`）

> 提示：项目使用了 `@react-native-async-storage/async-storage` 等原生模块。
> 在 Expo Go 中遇到原生模块缺失时，请使用开发构建：
> `npx expo run:android`（首次会自动生成 `android/` 并编译，需 Android SDK）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm test` | 核心存储逻辑单元测试 |
| `npx expo-doctor` | 依赖与配置诊断 |
| `npm run icons` | 重新生成占位应用图标 |

## 项目结构

```
src/
  app/                 # 路由页面（Expo Router 文件路由）
    _layout.tsx        # 根布局（Stack + 主题 + 状态栏）
    index.tsx          # 首页：记录列表
    editor.tsx         # 新增 / 编辑记录
    note/[id].tsx      # 记录详情
    about.tsx          # 关于
    privacy.tsx        # 隐私政策
  components/          # 可复用 UI 组件
  constants/           # 主题、颜色、应用常量
  hooks/               # 主题与颜色方案 hooks
  services/            # 数据模型与本地存储
  types/               # TypeScript 类型
  utils/               # 日期格式化等工具
tests/                 # 单元测试
docs/                  # 测试清单、发布流程、隐私政策
```

## 构建与发布

见 [docs/release-process.md](docs/release-process.md)。简要说明：

- **内部测试 APK**：`npx eas-cli build --profile preview --platform android`
- **正式发布 AAB**：`npx eas-cli build --profile production --platform android`

> 首次构建需要登录 Expo 账号（`npx eas-cli login`）并完成 Android 签名凭据配置。

