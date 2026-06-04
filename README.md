# 啤酒模拟器 Web MVP

一个极简搞笑小游戏原型。玩家扮演一瓶啤酒，出生在超市货架、冰柜、便利店冷藏柜、酒吧后厨或加油站商店里。目标是在 3 天保质期内被普通顾客买走，同时避免摔碎、过期、被店主扔出店外，以及被魔王发现。

本游戏为虚构搞笑作品。未成年人请勿饮酒，请理性饮酒。

## 当前版本

这是可直接在浏览器运行的 Web MVP，用于：

- 测试核心玩法
- 手机/电脑试玩
- 录屏
- 发链接给别人试玩
- 后续迁移到抖音小游戏或其他小游戏平台

## 技术栈

- HTML5
- CSS
- JavaScript
- Phaser 3
- localStorage 本地存档
- Mock 广告，不接真实广告 SDK

## 项目结构

```text
index.html
style.css
main.js
platform.js
package.json
vercel.json
DEPLOYMENT.md
vendor/
assets/
  beers/
  customers/
  scenes/
  ui/
  decorations/
```

## 本地运行

推荐用静态服务器运行：

```bash
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

也可以使用 npm 脚本：

```bash
npm run dev
```

Windows PowerShell 如果拦截 `npm`，可以用：

```bash
npm.cmd run dev
```

## 操作方式

手机：

- 倾斜手机控制啤酒滚动
- 点击屏幕旋转标签

电脑调试：

- `A / D` 左右滚动
- `W / S` 前后移动
- `Space` 旋转标签
- `1 / 2 / 3` 切换视角

## 已实现玩法

- 2.5D 货架/冰柜视角
- 5 个随机场景
- 手机倾斜与键盘调试控制
- 标签朝向系统
- 顾客随机出现与购买概率
- 魔王机制与隐身贴纸
- 冰柜堆叠/掩埋机制
- 轻量街机物理碰撞
- 完整度系统
- 掉落摔碎反馈
- 店主扔出店外结局
- 3 天保质期倒计时
- 积分、连胜、等待奖励
- 结算页双倍积分广告
- 自由贴纸式装扮系统
- localStorage 存档

## Mock 广告

当前所有广告都是模拟广告，点击后等待 1 秒发放奖励。

广告位：

- 摔碎后：看广告复活
- 魔王出现前：看广告获得隐身贴纸
- 结算页：看广告获得双倍积分
- 主菜单：看广告获得积分奖励

广告逻辑集中在：

```text
platform.js
```

后续接真实广告 SDK 时优先替换这里。

## 部署

GitHub 仓库：

[https://github.com/zzzlllks/beer](https://github.com/zzzlllks/beer)

完整部署说明见：

[DEPLOYMENT.md](./DEPLOYMENT.md)

支持：

- 本地静态服务器
- Vercel
- GitHub Pages
- 后续抖音小游戏适配

快速部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zzzlllks/beer)

```bash
npm run deploy:vercel
```

GitHub Pages 已提供 Actions workflow：

```text
.github/workflows/deploy-pages.yml
```

GitHub Pages 预期地址：

```text
https://zzzlllks.github.io/beer/
```

## 检查

```bash
npm run check
```

或：

```bash
npm.cmd run check
```

## 存档

游戏使用 `localStorage` 保存：

- 总积分
- 历史最高分
- 最高连胜
- 通关次数
- 失败次数
- 顾客购买统计
- 魔王躲避次数
- 双倍积分广告次数
- 装扮配置

## 素材扩展

推荐目录：

```text
assets/beers/
assets/customers/
assets/scenes/
assets/ui/
assets/decorations/
```

装饰配置：

```text
assets/decorations/decorations.json
```

未来新增素材时，优先通过配置扩展，尽量不要改核心玩法代码。

## 后续计划

- 更完整的素材配置读取
- 图鉴 UI
- 更多顾客与特殊顾客
- 更多场景事件
- 装扮商城与积分解锁
- 抖音小游戏平台层适配
