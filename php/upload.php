<?php
// upload.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    // // 1. Token验证（复用注册接口验证逻辑）
    // $token = $_POST['token'] ?? '';
    // if (empty($token)) {
    //     throw new Exception('未授权访问', 401);
    // }

    // 2. 数据库连接（复用注册接口配置）
    $conn = new PDO(
        'mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4',
        'zlx_user',
        'zlx_password'
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // // 3. 权限验证（复用用户表结构）
    // $stmt = $conn->prepare("SELECT user_id, role FROM user WHERE token = ?");
    // $stmt->execute([$token]);
    // $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // if (!$user || $user['role'] != 1) {
    //     throw new Exception('无上传权限', 403);
    // }

    // 4. 文件接收验证（解决404核心问题）
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('未收到有效文件', 400);
    }

    // 5. 文件存储逻辑（按月分目录存储）
    $uploadDir = 'uploads/' . date('Ym') . '/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $fileName = uniqid('pet_') . '_' . basename($_FILES['image']['name']);
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        throw new Exception('文件保存失败', 500);
    }

    // 6. 成功响应（保持接口响应格式统一）
    echo json_encode([
        'code' => 200,
        'url' => 'http://118.178.92.183/' . $targetPath
    ]);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['code' => 500, 'msg' => '数据库操作失败']);
} catch (Exception $e) {
    http_response_code($e->getCode());
    echo json_encode([
        'code' => $e->getCode(),
        'msg' => $e->getMessage()
    ]);
}