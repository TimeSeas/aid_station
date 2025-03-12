<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

// 接收参数
$user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
$content = isset($data['content']) ? trim($data['content']) : '';

// 参数验证
if (!$user_id || !$content) {
    echo json_encode(['code' => 400, 'msg' => '参数错误']);
    exit;
}

// 数据库配置
$servername = "118.178.92.183";
$username = "root";
$password = "123456";
$dbname = "wxproject";

try {
    // 创建连接
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 插入动态（images设为NULL）
    $stmt = $conn->prepare("INSERT INTO `post` (user_id, content, images) VALUES (:user_id, :content, NULL)");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':content', $content);
    $stmt->execute();

    echo json_encode(['code' => 200, 'msg' => '发布成功']);
} catch(PDOException $e) {
    error_log("数据库错误: " . $e->getMessage());
    echo json_encode(['code' => 500, 'msg' => '服务器内部错误']);
}

$conn = null;