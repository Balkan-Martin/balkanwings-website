<?php
// Step 1 of GitHub login for Decap CMS: send the editor to GitHub. Works on PHP 7.0+.
$cfg = require __DIR__ . '/config.php';
$state = bin2hex(random_bytes(16));
header('Set-Cookie: bw_oauth_state=' . $state . '; Max-Age=600; Path=/oauth/; Secure; HttpOnly; SameSite=Lax');
header('Cache-Control: no-store');
$q = http_build_query(['client_id' => $cfg['client_id'], 'scope' => 'repo', 'state' => $state]);
header('Location: https://github.com/login/oauth/authorize?' . $q);
exit;
