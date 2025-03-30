<?php
// chat_history.php获取消息记录接口
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$sender_id = $_GET['sender_id'] ?? 0;
$receiver_id = $_GET['receiver_id'] ?? 0;

$conn = new PDO("mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4", "zlx_user", "zlx_password");

try {
    // 获取消息记录
    $stmt = $conn->prepare("
        SELECT msg_id, sender_id, content, msg_type, status, created_at
        FROM chat_message 
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT 100
    ");
    $stmt->execute([$sender_id, $receiver_id, $receiver_id, $sender_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 标记已读
    if($sender_id != $receiver_id){
        $conn->exec("
            UPDATE chat_message 
            SET status = 1 
            WHERE receiver_id = $receiver_id 
            AND sender_id = $sender_id
            AND status = 0
        ");
    }

    echo json_encode([
        'code' => 200,
        'data' => array_reverse($messages) // 按时间正序返回
    ]);

} catch (PDOException $e) {
    echo json_encode(['code' => 500, 'msg' => '数据库错误']);
}
?>