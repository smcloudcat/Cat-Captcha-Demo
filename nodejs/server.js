/**
 * Node.js 业务后端示例：校验前端提交的票据
 * 调用 /api/validate.php 二次校验（HMAC 签名，一次性票据，防重放）
 * 零第三方依赖，运行：node server.js，然后访问 http://localhost:3000
 */
'use strict';

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// TODO: 替换为你的站点信息（开发者中心获取）
const SITE_ID = 'default';
const SITE_SECRET = 'YOUR_SITE_SECRET';
const API_BASE = 'https://captcha.lwcat.cn';
const ACTION = 'login';

function hmacSha256(secret, message) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/** 调用 validate.php 校验票据，返回 { valid, action, risk, alg_version } */
function validateTicket(ticket) {
  return new Promise((resolve, reject) => {
    const ts = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const msg = `${SITE_ID}\n${ts}\n${nonce}\n${ticket}\n${ACTION}`;
    const sig = hmacSha256(SITE_SECRET, msg);

    const body = new URLSearchParams({ ticket, action: ACTION }).toString();
    const u = new URL(API_BASE + '/api/validate.php');
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Authorization': `Captcha ${SITE_ID}:${sig}`,
        'X-Timestamp': ts,
        'X-Nonce': nonce,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('validate 响应解析失败')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }
  if (req.method === 'POST' && req.url === '/login') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', async () => {
      const ticket = new URLSearchParams(raw).get('ticket') || '';
      try {
        const data = await validateTicket(ticket);
        const ok = data.valid === true && data.action === ACTION;
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          ok,
          risk: data.risk ?? null,
          alg_version: data.alg_version ?? null,
          challenge_type: data.challenge_type ?? null,
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, message: 'validate 调用失败' }));
      }
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(3000, () => console.log('Cat-Captcha SDK demo → http://localhost:3000'));