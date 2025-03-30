<?php
// chat_conversations.php获取对话列表接口 
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$user_id = $_GET['user_id'] ?? 0;

$conn = new PDO("mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4", "zlx_user", "zlx_password");

try {
    // 获取所有对话的最新消息
    $stmt = $conn->prepare("
        SELECT u.user_id as partner_id, u.nickname, u.avatar, 
               cm.content, cm.created_at, SUM(IF(cm.status=0,1,0)) as unread
        FROM (
            SELECT 
                CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as partner_id,
                MAX(created_at) as last_time
            FROM chat_message
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY partner_id
        ) t
        JOIN user u ON u.user_id = t.partner_id
        LEFT JOIN chat_message cm ON cm.created_at = t.last_time
        GROUP BY u.user_id
        ORDER BY t.last_time DESC
    ");
    $stmt->execute([$user_id, $user_id, $user_id]);
    
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'code' => 200,
        'data' => $conversations
    ]);

} catch (PDOException $e) {
    echo json_encode(['code' => 500, 'msg' => '数据库错误']);
}
?>