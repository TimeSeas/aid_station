<?php
// Copy to config.local.php. Never commit real credentials.
return [
    'demo_mode' => true,
    'database' => dirname(__DIR__) . '/var/aid_station.sqlite',
    'base_url' => 'http://127.0.0.1:8080',
    'wechat_appid' => '',
    'wechat_secret' => '',
    'token_days' => 7,
];
