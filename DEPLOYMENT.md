# 《啤酒模拟器》网页版 MVP 部署文档

本项目是纯前端静态小游戏：

- HTML5
- CSS
- JavaScript
- Phaser 3
- 无后端
- 无登录
- 无真实广告 SDK
- 无支付
- 无排行榜

当前目录可以直接作为静态站点部署。入口文件是 `index.html`。

## 项目结构

```text
index.html
style.css
main.js
platform.js
package.json
vercel.json
.nojekyll
.github/workflows/deploy-pages.yml
vendor/
assets/
  beers/
  customers/
  scenes/
  ui/
  decorations/
```

说明：

- `main.js`：游戏主体逻辑。
- `platform.js`：平台抽象层，目前实现 Web mock 广告，后续接抖音小游戏时优先替换这里。
- `vendor/phaser.min.js`：本地 Phaser 3 运行库。
- `assets/`：素材目录。没有素材时游戏会使用占位图形或已处理的 PNG。

## 1. 本地开发

推荐方式：

```bash
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

如果安装了 Node.js，也可以运行：

```bash
npm run dev
```

检查脚本语法：

```bash
npm run check
```

注意：

- 不建议直接双击 `index.html` 运行，因为浏览器可能限制本地素材加载。
- 手机测试陀螺仪时，建议用同一局域网访问电脑 IP，并在移动浏览器里打开。
- iOS/Safari 对陀螺仪权限更严格，需要点击“启用手机倾斜”后授权。

## 2. 一键部署到 Vercel

本项目已经提供 `vercel.json`。Vercel 会把项目当作静态站点部署，输出目录为项目根目录。

### 方式 A：Vercel 网页导入 Git 仓库

1. 把项目推送到 GitHub。
2. 打开 Vercel Dashboard。
3. Import Git Repository。
4. 选择本项目仓库。
5. Framework Preset 选择 `Other` 或保持自动识别。
6. Build Command 留空。
7. Output Directory 使用 `.`。
8. 点击 Deploy。

### 方式 A-2：Vercel Deploy Button

当前仓库 `zzzlllks/beer` 可以直接使用下面的一键部署按钮：

```md
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zzzlllks/beer)
```

别人点击后会进入 Vercel 的克隆部署流程。

### 方式 B：Vercel CLI

第一次使用：

```bash
npx vercel login
```

部署预览环境：

```bash
npx vercel
```

部署生产环境：

```bash
npm run deploy:vercel
```

部署成功后，Vercel CLI 会输出一个 `.vercel.app` 链接，可以直接发给别人试玩。

### Vercel 配置说明

`vercel.json` 当前配置：

- `outputDirectory: "."`：直接发布项目根目录。
- `cleanUrls: true`：启用更干净的 URL。
- `Cache-Control: public, max-age=0, must-revalidate`：避免试玩时浏览器长期缓存旧版 JS/CSS。

如果后续引入构建流程，再把 output 改成构建目录，例如 `dist`。

## 3. GitHub Pages 部署

本项目支持两种 GitHub Pages 部署方式。

### 方式 A：GitHub Actions 自动部署

项目已包含：

```text
.github/workflows/deploy-pages.yml
```

使用步骤：

1. 把项目推送到 GitHub。
2. 打开仓库 Settings。
3. 进入 Pages。
4. Source 选择 `GitHub Actions`。
5. 推送到 `main` 或 `master` 分支。
6. GitHub Actions 会自动发布静态站点。

发布后的地址通常是：

```text
https://zzzlllks.github.io/beer/
```

### 方式 B：从分支根目录发布

也可以不用 Actions：

1. 打开仓库 Settings。
2. 进入 Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main` 或 `master`。
5. Folder 选择 `/root`。
6. 保存。

项目根目录已经包含 `.nojekyll`，用于告诉 GitHub Pages 不要按 Jekyll 项目处理静态资源。

## 4. Web 版本广告策略

网页版第一版不接真实广告。所有广告都通过 `platform.js` 模拟：

```js
window.BeerPlatform.showRewardedAd(placement, button)
```

当前 mock 逻辑：

- 点击按钮
- 按钮显示“广告播放中...”
- 等待 1 秒
- 发放奖励

广告位：

- 摔碎后：看广告复活
- 魔王出现前：看广告获得隐身贴纸
- 结算页：看广告获得双倍积分
- 主菜单：看广告获得积分奖励

后续接真实平台广告时，优先替换 `platform.js`，不要把广告 SDK 代码写进 `main.js`。

## 5. 后续适配抖音小游戏

抖音小游戏不是普通 DOM 网页环境，后续适配时需要做平台层替换。当前项目已经把平台相关逻辑集中在 `platform.js`，便于迁移。

### 建议保留的核心逻辑

以下内容可以继续复用：

- 顾客概率
- 魔王机制
- 积分系统
- 保质期倒计时
- 轻量物理
- 装扮数据结构
- 本局结算逻辑

### 需要替换的部分

1. 启动入口

Web：

```html
<script src="vendor/phaser.min.js"></script>
<script src="platform.js"></script>
<script src="main.js"></script>
```

抖音小游戏：

- 使用小游戏工程入口。
- 把 Phaser canvas 挂到小游戏可用的 canvas 上。
- 视具体适配器调整资源加载路径。

2. 广告

Web mock：

```js
BeerPlatform.showRewardedAd()
```

抖音小游戏后续替换为：

```js
tt.createRewardedVideoAd(...)
```

建议仍然保持返回 Promise：

```js
showRewardedAd(placement) -> Promise<{ ok: boolean }>
```

这样 `main.js` 不需要大改。

3. 存档

Web 当前使用：

```js
localStorage
```

抖音小游戏建议封装到平台层：

```js
BeerPlatform.storage.get(key)
BeerPlatform.storage.set(key, value)
```

未来可以替换为：

```js
tt.getStorageSync()
tt.setStorageSync()
```

4. 陀螺仪

Web 当前使用：

```js
DeviceOrientationEvent
```

抖音小游戏后续需要改为平台提供的设备方向或加速度 API。建议最终封装为：

```js
BeerPlatform.motion.start(callback)
BeerPlatform.motion.stop()
```

5. 分享与录屏

Web 版先不做。

抖音小游戏后续可接：

- 分享
- 录屏
- 视频发布入口
- 平台激励广告

这些都应放进平台层，不要污染核心玩法代码。

## 6. 素材扩展规则

推荐素材目录：

```text
assets/beers/
assets/customers/
assets/scenes/
assets/ui/
assets/decorations/
```

当前原则：

- 没有素材时使用占位图形。
- 人物和装饰优先读取已有 PNG。
- 装饰配置在 `assets/decorations/decorations.json`。
- 未来新增素材时，优先通过配置扩展，不改核心玩法。

## 7. 发布前检查清单

本地检查：

```bash
npm run check
python -m http.server 8000
```

浏览器检查：

- 主菜单能打开。
- 开始游戏能进入场景。
- A/D/W/S 能移动。
- Space 能旋转标签。
- 1/2/3 能切换视角。
- 看广告按钮会等待 1 秒再发奖励。
- 结算页能显示积分。
- 刷新页面后 localStorage 存档仍在。

移动端检查：

- 页面能适配竖屏/横屏。
- 点击“启用手机倾斜”后可以授权。
- 点击屏幕能旋转标签。
- HUD 不遮挡主要玩法。

## 8. 当前部署建议

试玩链接优先级：

1. Vercel：适合快速发链接、每次 push 自动预览。
2. GitHub Pages：适合公开静态展示，稳定免费。
3. 本地服务器：适合开发和录屏。
4. 抖音小游戏：等 Web 玩法稳定后再做平台迁移。

## 参考

- Vercel `vercel.json` 可配置输出目录、headers 等项目行为。
- Vercel CLI 可以从项目根目录部署，并输出部署 URL。
- GitHub Pages 是用于托管 HTML/CSS/JavaScript 静态站点的服务，可从仓库发布。
