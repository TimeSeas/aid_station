<?php
// chat_send.php发送消息接口 
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$data = json_decode(file_get_contents('php://input'), true);

// 参数验证
$required = ['sender_id', 'receiver_id', 'content'];
foreach ($required as $param) {
    if (empty($data[$param])) {
        echo json_encode(['code' => 400, 'msg' => "缺少参数: $param"]);
        exit;
    }
}

// 数据库配置
$conn = new PDO("mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4", "zlx_user", "zlx_password");
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 验证用户存在性
    $stmt = $conn->prepare("SELECT user_id FROM user WHERE user_id IN (?, ?)");
    $stmt->execute([$data['sender_id'], $data['receiver_id']]);
    if ($stmt->rowCount() != 2) {
        throw new Exception("用户不存在");
    }

    // 插入消息
    $stmt = $conn->prepare("
        INSERT INTO chat_message 
        (sender_id, receiver_id, content, msg_type, status) 
        VALUES (?, ?, ?, ?, 0)
    ");
    $stmt->execute([
        $data['sender_id'],
        $data['receiver_id'],
        $data['content'],
        $data['msg_type'] ?? 1 // 默认文本类型
    ]);
    
    echo json_encode([
        'code' => 200,
        'msg' => '发送成功',
        'data' => ['msg_id' => $conn->lastInsertId()]
    ]);

} catch (PDOException $e) {
    echo json_encode(['code' => 500, 'msg' => '数据库错误: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['code' => 400, 'msg' => $e->getMessage()]);
}
?>