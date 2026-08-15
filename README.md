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

- `https://captcha.lwcat.cn/public/captcha.css`
- `https://captcha.lwcat.cn/public/captcha.js`

## 算法版本

示例固定 `algVersion: 1`（算法 v1.0.0）。版本命名：`v1.x.x` 无需更新接入文件；`v2.x.x` 起需按新 SDK 更新接入代码。

## License

[LICENSE](LICENSE)
