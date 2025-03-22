<?php
header("Access-Control-Allow-Origin:*"); // 解决跨域问题:cite[1]:cite[5]
header("Content-Type: application/json; charset=UTF-8");
$host = "118.178.92.183"; // 阿里云服务器IP
$user = "zlx_user";
$password = "zlx_password";
$dbname = "wxproject";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// 简化后的PHP接口（开发环境版）
if ($_GET['action'] == 'wechatLogin') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  // 开发环境跳过严格校验
  $wechatData = [
    'openid' => 'dev_'.md5($data['code']), // 开发环境模拟openid
    'session_key' => 'dev_session'
  ];

  // 简化数据库操作
  $user = $conn->query("SELECT * FROM user WHERE openid = '{$wechatData['openid']}'")->fetch_assoc();
  
  if (!$user) {
    $conn->query("INSERT INTO user (openid, nickname, avatar) VALUES (
      '{$wechatData['openid']}',
      '{$data['nickname']}',
      '{$data['avatarUrl']}'
    )");
    $userId = $conn->insert_id;
  }
  
  echo json_encode(['userId' => $userId ?? $user['user_id']]);
  exit;
}

// 头像上传接口
if ($_GET['action'] == 'uploadAvatar') {
  $userId = $_POST['userId'];
  
  // 处理文件上传
  $file = $_FILES['avatar'];
  $targetDir = 'uploads/';
  $fileName = uniqid().'.jpg';
  move_uploaded_file($file['tmp_name'], $targetDir.$fileName);

  // 更新数据库
  $url = 'http://118.178.92.183/'.$targetDir.$fileName;
  $updateSql = "UPDATE user SET avatar = ? WHERE user_id = ?";
  $stmt = $conn->prepare($updateSql);
  $stmt->bind_param("si", $url, $userId);
  $stmt->execute();

  echo json_encode(['url' => $url]);
  exit;
}

// 更新头像接口
if ($_GET['action'] == 'updateAvatar') {
  $userId = (int)$_POST['userId'];
  $avatarUrl = $_POST['avatarUrl'];
  
  $updateSql = "UPDATE user SET avatar = ? WHERE user_id = ?";
  $stmt = $conn->prepare($updateSql);
  $stmt->bind_param("si", $avatarUrl, $userId);
  $stmt->execute();
  
  echo json_encode(['status' => 'success']);
  exit;
}

// 处理GET请求示例
if ($_GET['action'] == 'getUsers') {
  $userId = $_GET['id']; // 获取前端传递的用户ID
  $sql = "SELECT * FROM user WHERE user_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $userId);
  $stmt->execute();
  $result = $stmt->get_result();
  $data = $result->fetch_assoc(); // 直接获取单行数据
  header('Content-Type: application/json');
  echo json_encode($data);
}

if ($_GET['action'] == 'getUserStats') {
  $userId = $_GET['user_id'];
  // 使用预处理防止SQL注入
  $stmt = $conn->prepare("
      SELECT 
          (SELECT COUNT(*) FROM post WHERE user_id = ?) AS post_count,
          (SELECT COUNT(*) FROM user_follow WHERE followed_id = ?) AS followers,
          (SELECT COUNT(*) FROM user_follow WHERE follower_id = ?) AS following
  ");
  $stmt->bind_param("iii", $userId, $userId, $userId);
  $stmt->execute();
  
  $result = $stmt->get_result();
  echo json_encode($result->fetch_assoc());
}

// 关注/取关接口
if ($_GET['action'] == 'handleFollow') {
  $follower = $_POST['follower_id'];
  $followed = $_POST['followed_id'];
  
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      $stmt = $conn->prepare("INSERT IGNORE INTO user_follow VALUES (NULL,?,?,NOW())");
      $stmt->bind_param("ii", $follower, $followed);
  } else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
      $stmt = $conn->prepare("DELETE FROM user_follow WHERE follower_id=? AND followed_id=?");
      $stmt->bind_param("ii", $follower, $followed);
  }
  
  $stmt->execute();
  echo json_encode(['affected_rows' => $stmt->affected_rows]);
}

if ($_GET['action'] == 'getpost') {
  $sql = "SELECT 
  p.post_id,
  p.content,
  p.images,
  p.like_count,
  p.created_at AS post_time,
  u.username,
  u.avatar
FROM 
  post p
JOIN 
  user u ON p.user_id = u.user_id";
  $result = $conn->query($sql);
  $data = array();
  while ($row = $result->fetch_assoc()) {
      $data[] = $row;
  }
  echo json_encode($data);
}
$conn->close();

?>