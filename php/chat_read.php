<?php
// chat_read.php消息状态更新接口
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$data = json_decode(file_get_contents('php://input'), true);

if(empty($data['user_id']) || empty($data['partner_id'])){
    echo json_encode(['code' => 400, 'msg' => '参数错误']);
    exit;
}

$conn = new PDO("mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4", "zlx_user", "zlx_password");

try {
    $stmt = $conn->prepare("
        UPDATE chat_message 
        SET status = 1 
        WHERE receiver_id = ? 
          AND sender_id = ?
          AND status = 0
    ");
    $stmt->execute([$data['user_id'], $data['partner_id']]);
    
    echo json_encode([
        'code' => 200,
        'msg' => '已标记为已读',
        'read_count' => $stmt->rowCount()
    ]);

} catch (PDOException $e) {
    echo json_encode(['code' => 500, 'msg' => '数据库错误']);
}
?>