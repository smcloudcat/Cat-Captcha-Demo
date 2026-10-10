<?php
/**
 * PHP 业务后端示例：校验前端提交的票据
 * 调用 /api/validate.php 二次校验（HMAC 签名，一次性票据，防重放）
 *
 * 接入步骤：
 *   1. 在开发者中心创建站点，获取 site_id（站点唯一标识）与 secret_key；
 *   2. 将下方 SITE_ID / SITE_SECRET 替换为你的站点信息；
 *   3. 前端完成验证后，把 ticket 随业务表单 POST 到本文件。
 */
header('Content-Type: application/json; charset=utf-8');

$SITE_ID = 'default';          // TODO: 替换为你的站点 ID
$SITE_SECRET = 'YOUR_SITE_SECRET'; // TODO: 替换为你的 secret_key（仅业务后端持有）
$API_BASE = 'https://captcha.lwcat.cn';
$ACTION = 'login';             // 业务场景，须与前端注册时一致

$ticket = (string)($_POST['ticket'] ?? '');
if ($ticket === '') {
    echo json_encode(['ok' => false, 'message' => '缺少票据']);
    exit;
}

// HMAC 签名内容：site_id \n timestamp \n nonce \n ticket \n action
$ts = time();
$nonce = bin2hex(random_bytes(16));
$sig = hash_hmac('sha256', "$SITE_ID\n$ts\n$nonce\n$ticket\n$ACTION", $SITE_SECRET);

$ctx = stream_context_create(['http' => [
    'method' => 'POST',
    'header' => implode("\r\n", [
        "Authorization: Captcha $SITE_ID:$sig",
        "X-Timestamp: $ts",
        "X-Nonce: $nonce",
        "Content-Type: application/x-www-form-urlencoded",
    ]),
    'content' => http_build_query(['ticket' => $ticket, 'action' => $ACTION]),
]]);
$res = @file_get_contents("$API_BASE/api/validate.php", false, $ctx);
$data = $res !== false ? json_decode($res, true) : null;

// 必须同时核对 valid === true 且 action 与期望一致
$ok = is_array($data)
    && (($data['valid'] ?? false) === true)
    && (($data['action'] ?? '') === $ACTION);

echo json_encode([
    'ok' => $ok,
    'risk' => $data['risk'] ?? null,
    'alg_version' => $data['alg_version'] ?? null,
    'challenge_type' => $data['challenge_type'] ?? null,
    'tier' => $data['tier'] ?? null,
]);