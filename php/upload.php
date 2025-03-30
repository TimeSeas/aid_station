<?php
// upload.php 增强版
ini_set('display_errors', 0);
error_reporting(E_ALL);
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

    // 参数验证
    $imgType = $_GET['type'] ?? '';
    $allowedTypes = ['pet', 'post', 'avatar','nhpet'];
    if (!in_array($imgType, $allowedTypes)) {
        throw new Exception('图片类型参数非法，请指定pet/post/avatar/nhpet', 400);
    }

    // 验证文件上传
    if (!isset($_FILES['image']) || $_FILES['image']['error'] != UPLOAD_ERR_OK) {
        throw new Exception('文件上传失败', 400);
    }

    // 特殊处理头像类型
    $userId = 0;
    $nickName = '';
    if ($imgType === 'avatar') {
        $userId = filter_input(INPUT_POST, 'userId', FILTER_VALIDATE_INT);
        $nickName = substr(trim($_POST['nickname'] ?? ''), 0, 64);
        
        if (!$userId || $userId < 1) {
            throw new Exception('用户身份验证失败', 401);
        }
    }

    // 文件哈希校验
    $fileHash = md5_file($_FILES['image']['tmp_name']);
    $stmt = $conn->prepare("SELECT file_path FROM uploaded_files WHERE file_hash = ?");
    $stmt->execute([$fileHash]);
    $existingFile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingFile) {
        $targetPath = $existingFile['file_path'];
    } else {
        // 生成存储路径
        $fileExt = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $safeExt = in_array(strtolower($fileExt), ['jpg', 'jpeg', 'png', 'gif']) ? $fileExt : 'dat';
        $uploadDir = "uploads/{$imgType}/" . date('Ym') . '/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // 生成唯一文件名
        $fileName = uniqid('img_') . ".{$safeExt}";
        $targetPath = $uploadDir . $fileName;

        if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            throw new Exception('文件保存失败', 500);
        }

        // 记录文件信息
        $conn->prepare("INSERT INTO uploaded_files (file_hash, file_path) VALUES (?, ?)")
            ->execute([$fileHash, $targetPath]);
    }

    // 构造完整URL
    $fullUrl = 'http://118.178.92.183/' . ltrim($targetPath, '/');

    // 头像类型需要更新用户表
    if ($imgType === 'avatar') {
        // 获取旧头像信息
        $stmt = $conn->prepare("SELECT avatar FROM user WHERE user_id = ?");
        $stmt->execute([$userId]);
        $oldAvatar = $stmt->fetchColumn();

        // 更新用户数据
        $conn->prepare("UPDATE user SET avatar = ?, nickname = ? WHERE user_id = ?")
            ->execute([$fullUrl, $nickName, $userId]);

        // 清理旧头像（安全删除）
        if ($oldAvatar) {
            $oldPath = parse_url($oldAvatar, PHP_URL_PATH);
            if ($oldPath && file_exists($oldPath)) {
                // 检查是否有其他引用
                $stmt = $conn->prepare("SELECT COUNT(*) FROM user WHERE avatar = ?");
                $stmt->execute([$oldAvatar]);
                if ($stmt->fetchColumn() == 0) {
                    unlink($oldPath);
                }
            }
        }

        $response = [
            'code' => 200,
            'newAvatarUrl' => $fullUrl,
            'nickName' => $nickName
        ];
    } else {
        $response = [
            'code' => 200,
            'url' => $fullUrl
        ];
    }

    echo json_encode($response);

} catch (PDOException $e) {
    error_log("DB Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['code' => 500, 'msg' => '数据库服务暂不可用']);
} catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 400;
    http_response_code($code);
    echo json_encode(['code' => $code, 'msg' => $e->getMessage()]);
}