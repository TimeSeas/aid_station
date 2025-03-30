<?php
// pets.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$data = json_decode(file_get_contents('php://input'), true);

try {
    // 数据库连接
    $conn = new PDO(
        'mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4',
        'zlx_user',
        'zlx_password'
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->beginTransaction(); // 开启事务
    // 参数验证
    $required = ['name', 'species', 'photos', 'created_by'];
   // 在参数验证段新增字段长度校验
$fieldLimits = [
  'name' => 50,
  'species' => 50,
  'health_status' => 100
];

foreach ($fieldLimits as $field => $limit) {
  if (isset($data[$field]) && mb_strlen($data[$field]) > $limit) {
      throw new Exception("字段 {$field} 超过最大长度限制 {$limit}", 400);
  }
}

    // 验证照片格式为数组
    if (!is_array($data['photos']) || count($data['photos']) === 0) {
        throw new Exception('至少需要一张照片', 400);
    }

    // 插入宠物基本信息
    $stmt = $conn->prepare("
        INSERT INTO pet (
            name, species, gender, age, 
            health_status, description, created_by
        ) VALUES (
            :name, :species, :gender, :age,
            :health_status, :description, :created_by
        )
    ");

    $stmt->execute([
      ':name' => $data['name'],
      ':species' => $data['species'],
      ':gender' => $data['gender'] ?? 0,
      ':age' => isset($data['age']) ? (int)$data['age'] : null,
      ':health_status' => $data['health_status'] ?? '', // 前端字段名需同步修改
      ':description' => $data['description'] ?? '',
      ':created_by' => (int)$data['created_by']
  ]);

    $petId = $conn->lastInsertId();

    // 插入图片到pet_image表
    $imageStmt = $conn->prepare("
        INSERT INTO pet_image (pet_id, image_url, created_by)
        VALUES (:pet_id, :image_url, :created_by)
    ");

    foreach ($data['photos'] as $imageUrl) {
        $imageStmt->execute([
            ':pet_id' => $petId,
            ':image_url' => substr($imageUrl, 0, 255),
            ':created_by' => (int)$data['created_by']
        ]);
    }

    $conn->commit();

    echo json_encode([
        'code' => 200,
        'msg' => '登记成功',
        'pet_id' => $petId
    ]);

} catch (PDOException $e) {
    $conn->rollBack();
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['code' => 500, 'msg' => '数据库操作失败']);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 400);
    echo json_encode([
        'code' => $e->getCode() ?: 400,
        'msg' => $e->getMessage()
    ]);
}