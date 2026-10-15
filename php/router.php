<?php
// Development server exposes API entrypoints and validated raster uploads only.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
$endpoints = ['api.php','upload.php','pets.php','publish_post.php','createResue.php','updataUser.php','login.php','register.php','chat_send.php','chat_read.php','chat_history.php','chat_conversations.php'];
if (in_array(ltrim($path,'/'),$endpoints,true)) { require __DIR__ . $path; return true; }
if (preg_match('#^/uploads/(pet|post|avatar|nhpet)/[a-f0-9]{32}\.(jpg|png|gif|webp)$#',$path) && is_file(__DIR__ . $path)) return false;
http_response_code(404); header('Content-Type: application/json; charset=utf-8'); echo json_encode(['code'=>404,'message'=>'Not found']);
