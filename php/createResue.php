<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 调试模式
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 接收原始请求数据
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true) ?? [];

// 参数验证增强
$requiredParams = ['user_id', 'name', 'images', 'location'];
foreach ($requiredParams as $param) {
    if (empty($data[$param])) {
        http_response_code(400);
        echo json_encode(['code' => 400, 'msg' => "缺少必要参数: $param"]);
        exit;
    }
}

// 图片数据格式验证
if (!is_array($data['images']) || count($data['images']) === 0) {
    http_response_code(400);
    echo json_encode(['code' => 400, 'msg' => '图片数据格式错误或未上传图片']);
    exit;
}

// 数据库配置
$servername = "118.178.92.183";
$username = "zlx_user";
$password = "zlx_password";
$dbname = "wxproject";

try {
    // 创建数据库连接
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("数据库连接失败: " . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");

    // 事务开始
    $conn->begin_transaction();

    // 1. 创建宠物记录
    $stmt = $conn->prepare("INSERT INTO pet 
        (name, species, gender, created_by) 
        VALUES (?, '未知物种', 0, ?)");
    if (!$stmt) {
        throw new Exception("预处理语句失败: " . $conn->error);
    }
    $stmt->bind_param("si", $data['name'], $data['user_id']);
    if (!$stmt->execute()) {
        throw new Exception("宠物记录创建失败: " . $stmt->error);
    }
    $pet_id = $conn->insert_id;

    // 2. 创建救助请求
    $stmt = $conn->prepare("INSERT INTO help_request 
        (pet_id, user_id, address, latitude, longitude) 
        VALUES (?, ?, ?, 0.0, 0.0)");
    if (!$stmt) {
        throw new Exception("预处理语句失败: " . $conn->error);
    }
    $stmt->bind_param("iis", $pet_id, $data['user_id'], $data['location']);
    if (!$stmt->execute()) {
        throw new Exception("救助请求创建失败: " . $stmt->error);
    }

    // 3. 保存图片记录
    $stmt = $conn->prepare("INSERT INTO pet_image 
        (pet_id, image_url, created_by) 
        VALUES (?, ?, ?)");
    if (!$stmt) {
        throw new Exception("预处理语句失败: " . $conn->error);
    }
    
    foreach ($data['images'] as $url) {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new Exception("无效的图片URL: $url");
        }
        $stmt->bind_param("isi", $pet_id, $url, $data['user_id']);
        if (!$stmt->execute()) {
            throw new Exception("图片保存失败: " . $stmt->error);
        }
    }

    // 提交事务
    $conn->commit();
    echo json_encode([
        'code' => 0, 
        'msg' => '提交成功', 
        'pet_id' => $pet_id
    ]);

} catch (Exception $e) {
    // 回滚事务
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->rollback();
    }
    
    // 记录错误日志
    error_log(date('[Y-m-d H:i:s]') . " 错误: " . $e->getMessage() . "\n", 3, "error.log");
    
    // 返回错误响应
    http_response_code(500);
    echo json_encode([
        'code' => $e->getCode() ?: 500,
        'msg' => $e->getMessage()
    ]);
} finally {
    // 关闭数据库连接
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}