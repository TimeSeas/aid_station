<?php
require __DIR__ . '/bootstrap.php';
postOnly(); $user = actor(); $type = $_GET['type'] ?? '';
if (!in_array($type,['pet','post','avatar','nhpet'],true)) problem('图片类型无效');
$file = $_FILES['image'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) problem('上传失败');
if ($file['size'] > 5 * 1024 * 1024) problem('图片不能超过 5MB',413);
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
$extensions = ['image/jpeg'=>'jpg','image/png'=>'png','image/gif'=>'gif','image/webp'=>'webp'];
if (!isset($extensions[$mime]) || !getimagesize($file['tmp_name'])) problem('仅支持 JPG、PNG、GIF、WebP 图片');
$name = $type === 'avatar' ? textField($_POST,'nickname',64) : '';
$directory = __DIR__ . '/uploads/' . $type;
if (!is_dir($directory)) mkdir($directory,0755,true);
$filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
if (!move_uploaded_file($file['tmp_name'],$directory . '/' . $filename)) problem('保存图片失败',500);
$url = rtrim($config['base_url'],'/') . '/uploads/' . $type . '/' . $filename;
if ($type === 'avatar') {
    query('UPDATE users SET avatar=?,nickname=? WHERE user_id=?',[$url,$name,$user['user_id']]); respond(['code'=>200,'newAvatarUrl'=>$url,'nickName'=>$name]);
}
respond(['code'=>200,'url'=>$url]);
