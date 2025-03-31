<?php
//api.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
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
// 获取单个动态详情接口
if ($_GET['action'] == 'getpostdetail') {
  // 参数校验
  if (!isset($_GET['post_id']) || !is_numeric($_GET['post_id'])) {
    echo json_encode(['code' => 400, 'message' => '参数错误']);
    exit;
  }
  
  $post_id = intval($_GET['post_id']);
  
  // 使用预处理语句防止SQL注入
  $sql = "SELECT 
    p.post_id,
    p.content,
    p.like_count,
    p.created_at AS post_time,
    u.nickname,
    u.avatar,
    COALESCE(
      JSON_ARRAYAGG(pi.image_url),
      JSON_ARRAY()
    ) AS images
  FROM 
    post p
    JOIN user u ON p.user_id = u.user_id
    LEFT JOIN post_image pi ON p.post_id = pi.post_id
  WHERE 
    p.post_id = ?
  GROUP BY 
    p.post_id";
  
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $post_id);
  $stmt->execute();
  $result = $stmt->get_result();
  
  if ($result->num_rows === 0) {
    echo json_encode([
      'code' => 404,
      'message' => '动态不存在'
    ]);
    exit;
  }
  
  $data = $result->fetch_assoc();
  $data['images'] = json_decode($data['images'], true);
  
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


// 发表评论接口
// 发表评论接口
if ($_GET['action'] == 'createComment') {
  try {
    // 混合获取 GET + POST 参数
    $data = array_merge($_GET, $_POST);
    
    // 参数验证
    $required = ['user_id', 'parent_type', 'parent_id', 'content'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("参数错误: $field 不能为空", 400);
        }
    }

      // 插入评论
      $conn->begin_transaction();
      $stmt = $conn->prepare("
          INSERT INTO comment 
          (user_id, parent_type, parent_id, content)
          VALUES (?, ?, ?, ?)
      ");
      // 修正类型字符串为 isis
      $stmt->bind_param("isis", 
          $data['user_id'],
          $data['parent_type'],
          $data['parent_id'],
          $data['content']
      );
      
      if (!$stmt->execute()) {
          throw new Exception("评论发布失败: " . $stmt->error, 500);
      }

      // 获取新评论数据
      $newCommentId = $conn->insert_id;
      $stmt = $conn->prepare("
          SELECT 
              c.*,
              u.nickname,
              u.avatar,
              (SELECT COUNT(*) FROM `like` l 
               WHERE l.parent_type = 'comment' AND l.parent_id = c.comment_id) AS like_count
          FROM comment c
          JOIN user u ON c.user_id = u.user_id
          WHERE c.comment_id = ?
      ");
      $stmt->bind_param("i", $newCommentId);
      $stmt->execute();
      $result = $stmt->get_result();
      $commentData = $result->fetch_assoc();

      if (!$commentData) {
          throw new Exception("获取评论详情失败", 500);
      }

      $conn->commit();
      
      // 设置 JSON 响应头并返回数据
      header('Content-Type: application/json');
      echo json_encode([
          'code' => 200,
          'data' => array_merge($commentData, [
            'created_at' => date('Y-m-d H:i', strtotime($commentData['created_at']))
          ])
      ]);

  } catch(Exception $e) {
      $conn->rollback();
      // 设置错误响应头
      header('Content-Type: application/json');
      http_response_code($e->getCode() ?: 500);
      echo json_encode([
          'code' => $e->getCode() ?: 500,
          'message' => $e->getMessage()
      ]);
  }
  exit;
}
// 删除评论接口
// 删除评论接口
if ($_GET['action'] == 'deleteComment') {
  $data = json_decode(file_get_contents('php://input'), true);

  try {
      // 参数验证
      if (empty($data['comment_id']) || empty($data['user_id'])) {
          throw new Exception("参数错误: comment_id 或 user_id 为空", 400);
      }

      // 验证评论归属（从会话获取真实 user_id，避免前端伪造）
      $currentUserId = getAuthenticatedUserId(); // 需实现认证逻辑
      
      $stmt = $conn->prepare("
          DELETE FROM comment 
          WHERE comment_id = ? AND user_id = ?
      ");
      $stmt->bind_param("ii", 
          $data['comment_id'],
          $currentUserId // 使用服务端认证的 user_id
      );
      
      $stmt->execute();
      
      if ($stmt->affected_rows > 0) {
          echo json_encode([
              'code' => 200,
              'data' => ['comment_id' => $data['comment_id']]
          ]);
      } else {
          throw new Exception("删除失败: 评论不存在或无权操作", 403);
      }
  } catch(Exception $e) {
      http_response_code($e->getCode() ?: 500);
      echo json_encode([
          'code' => $e->getCode() ?: 500,
          'message' => $e->getMessage()
      ]);
  }
}

// 查询评论接口
// 查询评论接口
if ($_GET['action'] == 'getComments') {
  try {
      $params = [
          'parent_type' => $_GET['parent_type'],
          'parent_id' => (int)$_GET['parent_id'],
          'page' => max(1, (int)($_GET['page'] ?? 1)),
          'pageSize' => min(20, (int)($_GET['pageSize'] ?? 10))
      ];

      $sql = "
      SELECT 
          c.*,
          u.nickname,
          u.avatar,
          (SELECT COUNT(*) FROM `like` l 
           WHERE l.parent_type = 'comment' AND l.parent_id = c.comment_id) AS like_count
      FROM comment c
      JOIN user u ON c.user_id = u.user_id
      WHERE c.parent_type = ? AND c.parent_id = ?
      ORDER BY c.created_at DESC
      LIMIT ?, ?
  ";

  $stmt = $conn->prepare($sql);
  if ($stmt === false) {
      throw new Exception("预处理失败: " . $conn->error);
  }

  // 计算分页
  $offset = ($params['page'] - 1) * $params['pageSize'];
  $stmt->bind_param("siii", 
      $params['parent_type'],
      $params['parent_id'],
      $offset,
      $params['pageSize']
  );
  
  $stmt->execute();
  $result = $stmt->get_result();
  
  // 获取数据
  $comments = [];
  while ($row = $result->fetch_assoc()) {
      // 格式化时间戳
      $row['created_at'] = date('Y-m-d H:i', strtotime($row['created_at']));
      $comments[] = $row;
  }

  // 返回统一响应格式
  echo json_encode([
      'code' => 200,
      'message' => 'success',
      'data' => $comments
  ]);

} catch(Exception $e) {
  error_log("getComments Error: " . $e->getMessage()); // 记录错误日志
  echo json_encode([
      'code' => 500,
      'message' => '查询失败: ' . $e->getMessage(),
      'data' => []
  ]);
}
}
$conn->close();
?>