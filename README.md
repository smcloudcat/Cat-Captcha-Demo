# Cat-Captcha SDK 演示

[Cat-Captcha](https://captcha.lwcat.cn) 人机验证服务的三语言接入示例，每种语言均包含**两种接入方式**：

- **方式一 · 触发框验证**（极验风格）：登录按钮上方放置独立的「智能验证」触发框，先验证通过再登录；
- **方式二 · 点击登录触发**（经典接入）：登录按钮即验证触发点，点击直接弹出验证。

前端使用官方 SDK（`captcha.js`），验证通过后由业务后端调用 `/api/validate.php`（HMAC 签名）完成一次性票据二次校验。

## 目录

| 语言 | 目录 | 后端 | 运行方式 |
|---|---|---|---|
| PHP | [`php/`](php/) | `login.php` | 任意 PHP 服务器，如 `php -S localhost:8080` |
| Node.js | [`nodejs/`](nodejs/) | `server.js` | `node server.js` → http://localhost:3000 |
| Python | [`python/`](python/) | `app.py` | `pip install flask requests && python app.py` → http://127.0.0.1:5000 |

## 接入步骤

1. 在[开发者中心](https://captcha.lwcat.cn/account/)创建站点，获取 `site_id` / `site_key` / `secret_key`；
2. 修改对应目录后端文件的 `SITE_ID` / `SITE_SECRET`（业务后端持有，勿泄露）；
3. 修改前端 `index.html` 中的 `siteKey` 为你的站点 `site_key`（如自托管，同时改 `apiBase`）；
4. 按上表运行，完成登录验证。

## 前端依赖

- `https://captcha.lwcat.cn/public/captcha.css`（当前随 `?v=2.0.0` 引用，SDK 2.0.0 与算法 v2 同步定版）
- `https://captcha.lwcat.cn/public/captcha.js`

## 算法版本

示例同时支持算法 v1 与 v2，通过 **URL 参数切换**：打开页面时加 `?alg=2` 即切换算法 v2（默认 v1），页面顶部的切换按钮等价。

| | 算法 v1（`?`，默认） | 算法 v2（`?alg=2`） |
|---|---|---|
| 服务端版本要求 | ≥ 1.1.0 | ≥ 1.5.3 且站点启用算法 v2 |
| 站点开关 | alg1_enabled | alg2_enabled |
| 一次性语义 | 失败可重试（≤4 次/会话） | 一次提交，失败即作废重开 |
| 票据分级 | `tier` 均返回 | 敏感业务可要求 `tier=challenge` 并拒收 `passive` 票 |

接入代码差异为零——集成方只需把 `algVersion` 从 `1` 改为 `2`：

```js
LwCaptcha.init({
    el: '#captcha-box',
    type: 'auto',
    algVersion: 2,          // 算法 v2
    apiBase: 'https://captcha.lwcat.cn',
    siteKey: 'site_default',
    action: 'login',
    onSuccess: function (tk) { /* 票据提交业务后端 */ }
});
```

后端 `/api/validate.php` 调用方式 v1/v2 完全一致（HMAC 签名 + 一次性消费），响应中的 `tier` / `challenge_type` / `alg_version` 可用于业务侧分级决策。

## License

[LICENSE](LICENSE)
