# Cat-Captcha 算法 v1 · Python SDK 示例

前端页面引入官方 SDK，Python（Flask）后端校验票据，完整接入流程。

## 目录

- `index.html` — 前端页面（触发验证，提交票据）
- `app.py` — 业务后端（Flask，调用 validate.php 二次校验）
- `requirements.txt` — 依赖：flask、requests

## 接入步骤

1. 在 [开发者中心](https://captcha.lwcat.cn/account/) 创建站点，复制 `site_id`（站点唯一标识）与 `secret_key`；
2. 打开 `app.py`，把 `SITE_ID` / `SITE_SECRET` 替换为你的站点信息；
3. 打开 `index.html`，把 `siteKey` 替换为你的站点 `site_key`；
4. `pip install -r requirements.txt && python app.py`；
5. 访问 `http://127.0.0.1:5000`；
6. 前端验证通过后自动把 `ticket` 提交到 `/login`，后端核对 `ok === true` 即放行。

## 算法版本

- 本示例固定 `algVersion: 1`（算法 v1.0.0）。
- 版本命名：`v1.x.x` 无需更新本文件即可升级；升级到新的主版本（如 `v2.x.x`）时需按对应版本的 SDK 更新接入代码。