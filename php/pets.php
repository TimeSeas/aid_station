<?php
// pets.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents('php://input'), true);

try {
    // // 验证授权
    // $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION'] ?? '');
    // if (empty($token)) {
    //     throw new Exception('未授权访问', 401);
    // }

    // 数据库连接
    $conn = new PDO(
        'mysql:host=118.178.92.183;dbname=wxproject;charset=utf8mb4',
        'zlx_user',
        'zlx_password'
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // // 获取用户信息
    // $stmt = $conn->prepare("SELECT user_id, role FROM user WHERE token = ?");
    // $stmt->execute([$token]);
    // $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // if (!$user || $user['role'] != 1) {
    //     throw new Exception('无操作权限', 403);
    // }

    // 参数验证
    $required = ['name', 'species', 'photos'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("缺少必要参数: $field", 400);
        }
    }

    // 转换照片格式
    $photos = array_map('trim', explode(',', $data['photos']));
    if (count($photos) === 0) {
        throw new Exception('至少需要一张照片', 400);
    }

    // 构建插入数据
    $petData = [
        ':name' => substr($data['name'], 0, 50),
        ':species' => substr($data['species'], 0, 50),
        ':gender' => isset($data['gender']) ? (int)$data['gender'] : 0,
        ':age' => isset($data['age']) ? max(0, (int)$data['age']) : null,
        ':health_status' => substr($data['health_status'] ?? '', 0, 100),
        ':description' => substr($data['description'] ?? '', 0, 500),
        ':photos' => json_encode($photos),
        ':created_by' => $user['user_id']
    ];

    // 执行插入
    $stmt = $conn->prepare("
        INSERT INTO pet (
            name, species, gender, age, 
            health_status, description, photos, created_by
        ) VALUES (
            :name, :species, :gender, :age,
            :health_status, :description, :photos, :created_by
        )
    ");

    $stmt->execute($petData);

    echo json_encode([
        'code' => 200,
        'msg' => '登记成功',
        'pet_id' => $conn->lastInsertId()
    ]);

} catch (PDOException $e) {
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