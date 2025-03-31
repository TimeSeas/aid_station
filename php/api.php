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

// 新增：领养人信息提交接口
if ($_GET['action'] == 'submitAdoptionInfo') {
    $data = json_decode(file_get_contents('php://input'), true);

    // 参数验证
    $required = ['gender', 'experience', 'marriage', 'housing', 'work', 'phone', 'address', 'wechat', 'message'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            echo json_encode(['code' => 400, 'message' => "缺少必要参数: $field"]);
            exit;
        }
    }

    try {
        // 插入数据到数据库
        $stmt = $conn->prepare("
            INSERT INTO adoption_info 
            (gender, experience, marriage, housing, work, phone, address, wechat, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param(
            "sssssssss",
            $data['gender'],
            $data['experience'],
            $data['marriage'],
            $data['housing'],
            $data['work'],
            $data['phone'],
            $data['address'],
            $data['wechat'],
            $data['message']
        );
        $stmt->execute();

        echo json_encode(['code' => 200, 'message' => '提交成功']);
    } catch (Exception $e) {
        error_log("提交失败: " . $e->getMessage());
        echo json_encode(['code' => 500, 'message' => '服务器错误']);
    }
    exit;
}

// 简化后的PHP接口（开发环境版）用户登录
if ($_GET['action'] == 'wechatLogin') {
  $data = json_decode(file_get_contents('php://input'), true);
 // 生产环境请求微信接口
 $wechatApi = "https://api.weixin.qq.com/sns/jscode2session?appid=wxb385822ae551434a&secret=a1e74ec5db33fd286b4e1ac75fa879eb&js_code={$data['code']}&grant_type=authorization_code";
 $response = file_get_contents($wechatApi);
 $wechatData = json_decode($response, true);
 // 错误处理
 if(isset($wechatData['errcode'])){
     die(json_encode(['error' => '微信接口错误: '.$wechatData['errmsg']]));
 }
 // 使用微信返回的真实openid
 $openid = $wechatData['openid'];
 $sessionKey = $wechatData['session_key'];
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




// // 更新头像接口
//已弃用
// if ($_GET['action'] == 'updateAvatar') {
//   // 参数验证
//   if(empty($_POST['userId']) || !is_numeric($_POST['userId'])){
//       echo json_encode(['status' => 'error', 'message' => 'Invalid user ID']);
//       exit;
//   }
  
//   $userId = (int)$_POST['userId'];
//   $avatarUrl = $_POST['avatar'];
//   $nickName = substr(trim($_POST['nickname']), 0, 64); // 防止超长

//   // 上传头像到永久存储（示例使用本地存储）
//   $uploadDir = '/var/www/uploads/';
//   $fileName = 'avatar_'.$userId.'_'.time().'.jpg';
//   $filePath = $uploadDir.$fileName;
  
//   if(!file_put_contents($filePath, file_get_contents($avatarUrl))){
//       echo json_encode(['status' => 'error', 'message' => 'Avatar upload failed']);
//       exit;
//   }

//   // 更新数据库
//   $updateSql = "UPDATE user SET avatar = ?, nickname = ? WHERE user_id = ?";
//   $stmt = $conn->prepare($updateSql);
//   $stmt->bind_param("ssi", $fileName, $nickName, $userId);
  
//   if ($stmt->execute()) {
//       // 清理旧头像文件（可选）
//       $oldAvatar = $conn->query("SELECT avatar FROM user WHERE user_id=$userId")->fetch_assoc()['avatar'];
//       if(file_exists($uploadDir.$oldAvatar)) unlink($uploadDir.$oldAvatar);
      
//       echo json_encode(['status' => 'success']);
//   } else {
//       error_log("SQL Error: ".$conn->error); // 记录详细错误
//       echo json_encode(['status' => 'error', 'message' => 'Database update failed']);
//   }
//   exit;
// }




// 查询用户信息
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




//获取用户发布动态数量
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




//获取动态内容
if ($_GET['action'] == 'getpost') {
  $sql = "SELECT 
    p.post_id,
    p.content,
    p.like_count,
    p.created_at AS post_time,
    u.nickname,
    u.avatar,
    -- 获取图片数组
    COALESCE(
      JSON_ARRAYAGG(pi.image_url),
      JSON_ARRAY()
    ) AS images 
  FROM 
    post p
    JOIN user u ON p.user_id = u.user_id
    LEFT JOIN post_image pi ON p.post_id = pi.post_id
  GROUP BY 
    p.post_id, p.content, p.like_count, p.created_at, 
    u.nickname, u.avatar
  ORDER BY 
    p.created_at DESC";
  
  $result = $conn->query($sql);
  
  $data = array();
  while ($row = $result->fetch_assoc()) {
    // 处理图片数据
    $row['images'] = json_decode($row['images'], true);
    $data[] = $row;
  }
  
  echo json_encode([
    'code' => 200,
    'data' => $data
  ]);
}


// 获取宠物详细信息接口（含图片）
if ($_GET['action'] == 'getPetDetail') {
  $petId = $_GET['id'];
  
  try {
      // 获取宠物基础信息
      $sql = "SELECT p.*, 
              GROUP_CONCAT(pi.image_url) AS images 
              FROM pet p 
              LEFT JOIN pet_image pi ON p.pet_id = pi.pet_id 
              WHERE p.pet_id = ? 
              GROUP BY p.pet_id";
      
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("i", $petId);
      $stmt->execute();
      $result = $stmt->get_result();
      
      if($result->num_rows > 0) {
          $data = $result->fetch_assoc();
          // 转换图片字段为数组
          $data['images'] = $data['images'] ? explode(',', $data['images']) : [];
          
          // 转换领养状态
          $data['is_adopted'] = (bool)$data['is_adopted'];
          
          http_response_code(200);
          header('Content-Type: application/json');
          echo json_encode([
              'code' => 0,
              'data' => $data
          ]);
      } else {
          http_response_code(404);
          echo json_encode(['code' => 404, 'message' => '宠物信息不存在']);
      }
  } catch(Exception $e) {
      http_response_code(500);
      echo json_encode(['code' => 500, 'message' => '服务器内部错误']);
  }
}


 
// 获取宠物列表接口（带分页）
if ($_GET['action'] == 'getPetList') {
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $pageSize = 10;
  $offset = ($page - 1) * $pageSize;

  try {
      // 基础信息查询
      $sql = "SELECT p.pet_id, p.name, p.species, p.age, 
              (SELECT image_url FROM pet_image WHERE pet_id = p.pet_id LIMIT 1) AS cover
              FROM pet p
              WHERE p.is_adopted = 0 
              ORDER BY p.created_at DESC
              LIMIT ?, ?";
      
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("ii", $offset, $pageSize);
      $stmt->execute();
      $result = $stmt->get_result();
      
      $data = [];
      while($row = $result->fetch_assoc()) {
          $data[] = $row;
      }

      header('Content-Type: application/json');
      echo json_encode([
          'code' => 0,
          'data' => $data,
          'page' => $page
      ]);
  } catch(Exception $e) {
      http_response_code(500);
      echo json_encode(['code' => 500, 'message' => '服务器错误']);
  }
}




//救助接口


// 发布救助信息
if ($_GET['action'] == 'createRescue') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  try {
      $conn->begin_transaction();

      // 插入宠物信息
      $stmt = $conn->prepare("
          INSERT INTO pet 
          (name, species, gender, age, health_status, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
      ");
      $stmt->bind_param(
          "ssiisi",
          $data['name'],
          $data['species'],
          $data['gender'],
          $data['age'],
          $data['health_status'],
          $data['user_id']
      );
      $stmt->execute();
      $petId = $conn->insert_id;

      // 插入图片记录
      if (!empty($data['images'])) {
          $stmt = $conn->prepare("
              INSERT INTO pet_image (pet_id, image_url, created_by)
              VALUES (?, ?, ?)
          ");
          foreach ($data['images'] as $image) {
              $stmt->bind_param("isi", $petId, $image, $data['user_id']);
              $stmt->execute();
          }
      }

      // 插入救助请求
      $stmt = $conn->prepare("
          INSERT INTO help_request 
          (pet_id, user_id, latitude, longitude, address, emergency_level)
          VALUES (?, ?, ?, ?, ?, ?)
      ");
      $stmt->bind_param(
          "iiddsi",
          $petId,
          $data['user_id'],
          $data['latitude'],
          $data['longitude'],
          $data['address'],
          $data['emergency_level']
      );
      $stmt->execute();

      $conn->commit();
      echo json_encode(['code' => 0, 'rescue_id' => $conn->insert_id]);

  } catch(Exception $e) {
      $conn->rollback();
      error_log("发布失败: ".$e->getMessage());
      echo json_encode(['code' => 500, 'message' => '发布失败']);
  }
}


// 获取救助列表（带分页）
if ($_GET['action'] == 'getRescueList') {
  $page = max(1, (int)($_GET['page'] ?? 1));
  $pageSize = min(20, (int)($_GET['pageSize'] ?? 10));
  $offset = ($page - 1) * $pageSize;

  try {
      $sql = "SELECT 
              hr.request_id AS rescue_id,
              p.name,
              hr.address AS location,
              hr.status,
              hr.created_at AS time,
              u.user_id,
              u.nickname,
              u.avatar,
              GROUP_CONCAT(pi.image_url) AS images
          FROM help_request hr
          JOIN pet p ON hr.pet_id = p.pet_id
          JOIN user u ON hr.user_id = u.user_id
          LEFT JOIN pet_image pi ON p.pet_id = pi.pet_id
          GROUP BY hr.request_id
          ORDER BY hr.created_at DESC
          LIMIT ?, ?";

      $stmt = $conn->prepare($sql);
      $stmt->bind_param("ii", $offset, $pageSize);
      $stmt->execute();
      
      $result = $stmt->get_result();
      $data = [];
      while($row = $result->fetch_assoc()) {
          // 转换数据结构
          $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
          $row['status'] = (int)$row['status'];
          $data[] = $row;
      }

      echo json_encode([
          'code' => 0,
          'data' => $data,
          'pageInfo' => [
              'current' => $page,
              'pageSize' => $pageSize,
              'hasMore' => count($data) >= $pageSize
          ]
      ]);

  } catch(Exception $e) {
      http_response_code(500);
      echo json_encode(['code' => 500, 'message' => '服务器异常']);
  }
}


// 更新救助状态
if ($_GET['action'] == 'updateRescueStatus') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  // 参数验证
  $required = ['rescue_id', 'status', 'user_id'];
  foreach ($required as $field) {
      if (!isset($data[$field])) {
          echo json_encode(['code' => 400, 'message' => "缺少必要参数: $field"]);
          exit;
      }
  }

  try {
      // 开启事务
      $conn->begin_transaction();

      // 更新救助状态
      $stmt = $conn->prepare("
          UPDATE help_request 
          SET status = ?, operator_id = ?, update_time = NOW() 
          WHERE request_id = ?
      ");
      $stmt->bind_param("iii", $data['status'], $data['user_id'], $data['rescue_id']);
      $stmt->execute();

      // 同步宠物状态（假设救助完成后标记为已领养）
      if ($data['status'] == 1) {
          $stmt = $conn->prepare("
              UPDATE pet p
              JOIN help_request hr ON p.pet_id = hr.pet_id
              SET p.is_adopted = 1
              WHERE hr.request_id = ?
          ");
          $stmt->bind_param("i", $data['rescue_id']);
          $stmt->execute();
      }

      $conn->commit();
      echo json_encode(['code' => 0, 'affected' => $stmt->affected_rows]);

  } catch(Exception $e) {
      $conn->rollback();
      error_log("更新失败: ".$e->getMessage());
      echo json_encode(['code' => 500, 'message' => '状态更新失败']);
  }
}





$conn->close();
?>