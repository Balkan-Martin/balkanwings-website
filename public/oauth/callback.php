<?php
// Step 2: GitHub sends the editor back here; we swap the code for a token and hand it to the CMS window.
$cfg = require __DIR__ . '/config.php';
header('Cache-Control: no-store');
header('Set-Cookie: bw_oauth_state=; Max-Age=0; Path=/oauth/; Secure; HttpOnly; SameSite=Lax');
function fail($msg) { http_response_code(400); echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8'); exit; }

$code  = isset($_GET['code']) ? $_GET['code'] : '';
$state = isset($_GET['state']) ? $_GET['state'] : '';
$saved = isset($_COOKIE['bw_oauth_state']) ? $_COOKIE['bw_oauth_state'] : '';
if ($code === '' || $saved === '' || !hash_equals($saved, $state)) fail('Login request not valid. Close this window and try again.');

$ch = curl_init('https://github.com/login/oauth/access_token');
curl_setopt_array($ch, [
  CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15,
  CURLOPT_HTTPHEADER => ['Accept: application/json', 'User-Agent: balkanwings-cms-login'],
  CURLOPT_POSTFIELDS => http_build_query(['client_id' => $cfg['client_id'], 'client_secret' => $cfg['client_secret'], 'code' => $code]),
]);
$resp = curl_exec($ch); curl_close($ch);
$data = json_decode($resp, true);
if (!is_array($data) || empty($data['access_token'])) fail('GitHub did not return a login token. Close this window and try again.');

$message = 'authorization:github:success:' . json_encode(['token' => $data['access_token'], 'provider' => 'github']);
$flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
?><!doctype html><meta charset="utf-8"><title>Signing in…</title><p>Signing in…</p>
<script>
(function () {
  var message = <?php echo json_encode($message, $flags); ?>;
  var origin = <?php echo json_encode($cfg['allowed_origin'], $flags); ?>;
  window.addEventListener('message', function (e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, e.origin);
  }, false);
  window.opener.postMessage('authorizing:github', origin);
})();
</script>
