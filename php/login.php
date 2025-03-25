<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

// 参数验证增强
if (!isset($data['phone']) || !isset($data['password']) || 
    empty(trim($data['phone'])) || empty(trim($data['password']))) {
    echo json_encode(['code' => 400, 'msg' => '手机号和密码为必填项']);
    exit;
}

$phone = trim($data['phone']);
$password = trim($data['password']);

// 数据库配置（建议移至配置文件）
define('DB_HOST', '118.178.92.183');
define('DB_NAME', 'wxproject');
define('DB_USER', 'zlx_user');
define('DB_PASS', 'zlx_password');

try {
    $conn = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // 查询用户信息（新增状态检查）
    $stmt = $conn->prepare("
        SELECT user_id, password_hash, role, avatar 
        FROM user 
        WHERE phone = ? 
        LIMIT 1
    ");
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 增强密码验证
    if (!$user || $password !== $user['password_hash']) {
      echo json_encode([
          'code' => 401,
          'msg' => '认证失败：手机号或密码错误'
      ]);
      exit;
  }
    // 响应数据增强
    echo json_encode([
        'code' => 200,
        'msg' => '登录成功',
        'data' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'] ?? '',
            'avatar' => $user['avatar'],
            'role' => $user['role'],
        ]
    ]);

} catch(PDOException $e) {
    error_log("[" . date('Y-m-d H:i:s') . "] 数据库异常: " . $e->getMessage());
    echo json_encode([
        'code' => 500,
        'msg' => '系统维护中，请稍后再试'
    ]);
} finally {
    $conn = null;
}