# -*- coding: utf-8 -*-
"""
Python 业务后端示例（Flask）：校验前端提交的票据
调用 /api/validate.php 二次校验（HMAC 签名，一次性票据，防重放）

接入步骤：
  1. 在开发者中心创建站点，获取 site_id 与 secret_key；
  2. 替换下方 SITE_ID / SITE_SECRET；
  3. pip install flask requests && python app.py
  4. 访问 http://127.0.0.1:5000
"""
import hashlib
import hmac
import secrets
import time

import requests
from flask import Flask, jsonify, request, send_file

app = Flask(__name__)

SITE_ID = "default"              # TODO: 替换为你的站点 ID
SITE_SECRET = "YOUR_SITE_SECRET"  # TODO: 替换为你的 secret_key（仅业务后端持有）
API_BASE = "https://captcha.lwcat.cn"
ACTION = "login"


def validate_ticket(ticket):
    """调用 validate.php 校验票据，返回 {valid, action, risk, alg_version}"""
    ts = str(int(time.time()))
    nonce = secrets.token_hex(16)
    msg = "\n".join([SITE_ID, ts, nonce, ticket, ACTION])
    sig = hmac.new(SITE_SECRET.encode(), msg.encode(), hashlib.sha256).hexdigest()
    resp = requests.post(
        f"{API_BASE}/api/validate.php",
        data={"ticket": ticket, "action": ACTION},
        headers={
            "Authorization": f"Captcha {SITE_ID}:{sig}",
            "X-Timestamp": ts,
            "X-Nonce": nonce,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


@app.route("/")
def index():
    return send_file("index.html")


@app.route("/login", methods=["POST"])
def login():
    ticket = request.form.get("ticket", "")
    if not ticket:
        return jsonify(ok=False, message="缺少票据")
    try:
        data = validate_ticket(ticket)
    except Exception:
        return jsonify(ok=False, message="validate 调用失败")
    # 必须同时核对 valid 为 true 且 action 与期望一致
    ok = data.get("valid") is True and data.get("action") == ACTION
    return jsonify(
        ok=ok,
        risk=data.get("risk"),
        alg_version=data.get("alg_version"),
        challenge_type=data.get("challenge_type"),
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)