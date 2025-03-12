<?php
header("Access-Control-Allow-Origin:*"); // 解决跨域问题:cite[1]:cite[5]
header("Content-Type: application/json; charset=UTF-8");
$host = "118.178.92.183"; // 阿里云服务器IP
$user = "root";
$password = "123456";
$dbname = "wxproject";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 处理GET请求示例
if ($_GET['action'] == 'getUsers') {
    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
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
  users u ON p.user_id = u.user_id";
  $result = $conn->query($sql);
  $data = array();
  while ($row = $result->fetch_assoc()) {
      $data[] = $row;
  }
  echo json_encode($data);
}
$conn->close();
?>