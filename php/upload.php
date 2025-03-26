<?php
// upload.php 修正版
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $conn = new PDO('mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4','zlx_user','zlx_password');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 参数验证
    $imgType = $_GET['type'] ?? 'unknown';
    $allowedTypes = ['pet', 'post', 'avatar'];
    if(!in_array($imgType, $allowedTypes)) {
        throw new Exception('图片类型参数非法，请指定pet/post/avatar', 400);
    }

    // 特殊处理头像类型
    $userId = 0;
    $nickName = '';
    if($imgType === 'avatar') {
        // 获取用户信息参数
        $userId = $_POST['userId'] ?? 0;
        $nickName = substr($_POST['nickname'] ?? '', 0, 64);
        
        // 验证用户身份
        if(!is_numeric($userId) || $userId < 1){
            throw new Exception('用户身份验证失败', 401);
        }
    }

    // 文件存储逻辑
    $baseDir = 'uploads/' . $imgType . '/';
    $uploadDir = $baseDir . date('Ym') . '/';
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0755, true);

    // 生成安全文件名
    $fileExt = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('img_') . ($fileExt ? ".$fileExt" : '');
    $targetPath = $uploadDir . $fileName;

    // 移动文件
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        throw new Exception('文件保存失败', 500);
    }

    // 构造响应
    $response = ['code' => 200];
    $fullUrl = 'http://118.178.92.183/' . $targetPath;

    // 头像类型需要更新数据库
    if($imgType === 'avatar') {
        // 清理旧头像（重要！）
        $stmt = $conn->prepare("SELECT avatar FROM user WHERE user_id = ?");
        $stmt->execute([$userId]);
        $oldAvatar = $stmt->fetchColumn();
        
        // 更新数据库
        $updateStmt = $conn->prepare("UPDATE user SET avatar = ?, nickname = ? WHERE user_id = ?");
        $updateStmt->execute([$fullUrl, $nickName, $userId]); // ✅ 存储完整URL
        
        // 删除旧文件
        if($oldAvatar && file_exists(parse_url($oldAvatar, PHP_URL_PATH))) {
            unlink(parse_url($oldAvatar, PHP_URL_PATH));
        }
        
        $response['newAvatarUrl'] = $fullUrl;
    } else {
        $response['url'] = $fullUrl;
    }

    echo json_encode($response);

} catch (PDOException $e) {
    error_log("Database Error: ".$e->getMessage());
    http_response_code(500);
    echo json_encode(['code' => 500, 'msg' => '数据库操作失败']);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['code' => $e->getCode(), 'msg' => $e->getMessage()]);
}