<?php
//publish_post.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

// 参数验证增强
$requiredParams = ['user_id', 'content', 'photos'];
foreach ($requiredParams as $param) {
    if (!isset($data[$param]) || empty($data[$param])) {
        echo json_encode(['code' => 400, 'msg' => "缺少必要参数: $param"]);
        exit;
    }
}

// 图片数据验证
if (!is_array($data['photos']) || count($data['photos']) > 6) {
    echo json_encode(['code' => 400, 'msg' => '图片数据格式错误或超过最大数量']);
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
    
    // 开启事务
    $conn->beginTransaction();

    // 插入动态主表
    $stmt = $conn->prepare("
        INSERT INTO post 
        (user_id, content) 
        VALUES (:user_id, :content)
    ");
    $stmt->execute([
        ':user_id' => (int)$data['user_id'],
        ':content' => trim($data['content'])
    ]);
    $postId = $conn->lastInsertId();

    // 插入图片表
    $imageStmt = $conn->prepare("
        INSERT INTO post_image 
        (post_id, image_url, created_by) 
        VALUES (:post_id, :image_url, :user_id)
    ");
    
    foreach ($data['photos'] as $imageUrl) {
        if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
            throw new Exception("无效的图片URL: $imageUrl");
        }
        
        $imageStmt->execute([
            ':post_id'   => $postId,
            ':image_url' => $imageUrl,
            ':user_id'   => (int)$data['user_id']
        ]);
    }

    // 提交事务
    $conn->commit();
    echo json_encode(['code' => 200, 'msg' => '发布成功', 'post_id' => $postId]);

} catch(PDOException $e) {
    $conn->rollBack();
    error_log("数据库错误: " . $e->getMessage());
    echo json_encode(['code' => 500, 'msg' => '数据库操作失败']);
} catch(Exception $e) {
    $conn->rollBack();
    error_log("业务逻辑错误: " . $e->getMessage());
    echo json_encode(['code' => 400, 'msg' => $e->getMessage()]);
}

$conn = null;