<?php
// 开启错误报告（调试完成后注释）
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);
$role = isset($data['role']) ? (int)$data['role'] : 0;
// 参数验证
$phone = $data['phone'] ?? '';
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($phone) || empty($username) || empty($password)) {
    echo json_encode(['code' => 400, 'msg' => '参数不完整']);
    exit;
}
if ($role < 0 || $role > 1) {
  echo json_encode(['code' => 400, 'msg' => '角色参数非法']);
  exit;
}
// 数据库配置
$servername = "118.178.92.183";
$db_username = "zlx_user";
$db_password = "zlx_password";
$dbname = "wxproject";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $db_username, $db_password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 唯一性检查
    $checkStmt = $conn->prepare("SELECT user_id FROM user WHERE phone = ? OR username = ?");
    $checkStmt->execute([$phone, $username]);
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(['code' => 409, 'msg' => '手机号或用户名已存在']);
        exit;
    }

    // 格式校验
    if (!preg_match('/^1[3-9]\d{9}$/', $phone)) {
        echo json_encode(['code' => 400, 'msg' => '手机号格式错误']);
        exit;
    }
    if (strlen($password) < 8) {
        echo json_encode(['code' => 400, 'msg' => '密码需至少8位']);
        exit;
    }

    // 密码哈希
    // $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 插入数据（修正占位符）
    $stmt = $conn->prepare("INSERT INTO `user` (phone, username, password_hash, role) 
    VALUES (:phone, :username, :password_hash, :role)");
$stmt->bindParam(':role', $role, PDO::PARAM_INT);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password_hash', $password);
    $stmt->execute();

    echo json_encode(['code' => 200, 'msg' => '注册成功', 'user_id' => $conn->lastInsertId()]);

} catch(PDOException $e) {
    // 输出具体错误信息（仅限调试）
    error_log("数据库错误: " . $e->getMessage());
    echo json_encode(['code' => 500, 'msg' => '错误详情：' . $e->getMessage()]); // 生产环境移除错误详情
}

$conn = null;