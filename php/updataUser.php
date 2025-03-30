<?php
// updateUser.php
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    // 数据库连接
    $conn = new PDO(
        'mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4',
        'zlx_user',
        'zlx_password',
        [PDO::ATTR_EMULATE_PREPARES => false]
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 获取输入数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 参数验证
    $userId = filter_var($input['userId'] ?? 0, FILTER_VALIDATE_INT);
    $nickName = substr(trim($input['nickname'] ?? ''), 0, 64);
    $avatarUrl = filter_var($input['avatarUrl'] ?? '', FILTER_SANITIZE_URL);

    if (!$userId || $userId < 1) {
        throw new Exception('用户身份验证失败', 401);
    }

    // 验证头像URL格式
    if (!filter_var($avatarUrl, FILTER_VALIDATE_URL)) {
        throw new Exception('头像链接格式无效', 400);
    }

    // 更新数据库
    $stmt = $conn->prepare("UPDATE user SET nickname = ?, avatar = ? WHERE user_id = ?");
    $stmt->execute([$nickName, $avatarUrl, $userId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('用户信息未发生变化', 304);
    }

    // 返回更新后的数据
    $stmt = $conn->prepare("SELECT avatar, nickname FROM user WHERE user_id = ?");
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'code' => 200,
        'newAvatarUrl' => $userData['avatar'],
        'nickName' => $userData['nickname']
    ]);

} catch (PDOException $e) {
    error_log("DB Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['code' => 500, 'msg' => '数据库服务暂不可用']);
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 400;
    http_response_code($code);
    echo json_encode(['code' => $code, 'msg' => $e->getMessage()]);
}