# 构建与发布流程

本文档区分「已实现 / 已配置 / 需你亲自操作 / 依赖审批」四类事项，避免把代码准备与外部审批混为一谈。

## 一、当前应用身份

| 项 | 值 | 说明 |
| --- | --- | --- |
| 应用显示名称 | 今日一记 | `app.json` → `expo.name` |
| Expo 项目标识 | `daily-note` | `app.json` → `expo.slug` |
| Android 包名 | `com.example.dailynote` | **占位，正式上架前必须替换** |
| 版本号（用户可见） | `1.0.0` | `app.json` → `expo.version` |
| Android versionCode | `1` | `app.json` → `expo.android.versionCode` |
| 版本来源 | 本地（local） | `eas.json` → `appVersionSource: "local"` |

> ⚠️ **重要**：`com.example.dailynote` 仅为占位包名，`example.com` 不归你所有。
> 正式上架前，请在 `app.json` 中替换成你拥有或有权使用的唯一标识
> （如自有域名反写）。包名一经上架不可更改，请谨慎确定。

## 二、EAS 构建配置（已配置）

`eas.json` 提供三个构建档案：

| 档案 | 用途 | 产物 |
| --- | --- | --- |
| `development` | 开发构建（含 dev client，用于真机调试） | APK |
| `preview` | 内部测试，可直接安装到手机 | APK |
| `production` | 正式发布 | AAB |

构建命令（需先安装 EAS CLI 并登录）：

```bash
npx eas-cli login                                    # 登录 Expo 账号
npx eas-cli build --profile preview --platform android    # 内部测试 APK
npx eas-cli build --profile production --platform android # 正式发布 AAB
```

> 首次构建时，EAS 会引导你：
> 1. 创建 / 关联 EAS 项目；
> 2. 为 Android 生成签名密钥（keystore）。
> 默认凭据由 EAS 云端管理，不会写入源码仓库。

## 三、Android 发布包（APK 与 AAB）

- **APK**：可直接安装的安装包，适合内部测试与分发（`preview`）。
- **AAB**（Android App Bundle）：上传到应用商店的格式，由商店按设备分发
  更小的安装包（`production`）。

本地生成原生工程（如需本地构建）：

```bash
npx expo prebuild --platform android   # 生成 android/ 目录（CNG，可随时删除）
```

## 四、国内应用商店上架准备清单

### 4.1 需要你亲自操作的事项

- [ ] 注册目标应用商店的开发者账号，并完成**开发者实名认证**
- [ ] 准备 **APP 备案**所需材料（与网站 ICP 备案是两回事，需按工信部/属地要求办理）
- [ ] 按目标商店要求准备 **软件著作权** 或其他版权材料
- [ ] 准备商店截图（应用图标、商店展示图、功能截图）
- [ ] 撰写应用介绍与版本更新说明
- [ ] 确认并填写隐私政策（可先使用 `docs/privacy-policy.md` 草稿）
- [ ] 在商店后台填写应用信息并提交审核

### 4.2 依赖主管部门 / 商店审批的事项

- [ ] APP 备案审批结果（**尚未办理，切勿虚构备案号**）
- [ ] 软件著作权登记（如目标商店要求）
- [ ] 商店审核结果（**尚未提交，切勿虚构审核通过**）

### 4.3 审核失败后的修复流程

1. 根据商店退回原因定位问题（常见：资质缺失、隐私政策不完整、权限说明不清）
2. 修改代码或补充资料
3. 提升 `expo.version` 与 `expo.android.versionCode`
4. 重新构建并提交

### 4.4 正式发布后的版本更新流程

1. 修改 `app.json` 中的 `expo.version`，并递增 `android.versionCode`
2. 更新商店更新说明
3. `npx eas-cli build --profile production --platform android`
4. 在商店后台提交新版本 AAB

## 五、权限与第三方 SDK 说明

本应用核心功能完全本地化，不申请相机、麦克风、定位等权限，不接入任何
收集个人信息的第三方 SDK。实际打包后的权限清单请在 EAS 构建完成后，
以 `aapt dump permissions` 或商店后台展示为准（**待核实**）。

## 六、状态汇总

| 状态 | 事项 |
| --- | --- |
| ✅ 已实现并验证 | 本地记录 CRUD、持久化、损坏数据处理、单元测试、类型检查、lint |
| ✅ 已配置但未验证 | `app.json` 应用身份、`eas.json` 构建档案、占位图标 |
| 👤 需你亲自操作 | Expo 登录、EAS 构建、真机测试、签名凭据、商店账号 |
| 🏛 依赖审批 | APP 备案、软著、商店审核 |
