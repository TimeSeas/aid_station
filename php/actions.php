<?php
require __DIR__ . '/bootstrap.php';
$data = input();
$action = $_GET['action'] ?? $data['action'] ?? '';
switch ($action) {
case 'health':
    query('SELECT 1'); respond(['code'=>200,'service'=>'aid-station','demoMode'=>$config['demo_mode']]);
case 'demoLogin':
    postOnly();
    if (!$config['demo_mode']) problem('演示登录已关闭',403);
    $id = query('SELECT user_id FROM users WHERE openid=?',['demo-guardian'])->fetchColumn();
    if (!$id) problem('请先执行 php php/init.php --seed',503);
    respond(['code'=>200] + sessionFor((int)$id));
case 'wechatLogin':
    postOnly();
    if (!$config['wechat_appid'] || !$config['wechat_secret']) problem('尚未配置微信登录，请使用演示登录或账号登录',503);
    $url = 'https://api.weixin.qq.com/sns/jscode2session?' . http_build_query(['appid'=>$config['wechat_appid'],'secret'=>$config['wechat_secret'],'js_code'=>textField($data,'code',256),'grant_type'=>'authorization_code']);
    $result = json_decode(@file_get_contents($url,false,stream_context_create(['http'=>['timeout'=>10]])) ?: '{}',true);
    if (empty($result['openid'])) problem('微信登录失败，请重试',401);
    $id = query('SELECT user_id FROM users WHERE openid=?',[$result['openid']])->fetchColumn();
    if (!$id) { query('INSERT INTO users(openid,nickname) VALUES (?,?)',[$result['openid'],'新的守护者']); $id = db()->lastInsertId(); }
    respond(['code'=>200] + sessionFor((int)$id));
case 'register':
    postOnly(); $phone = textField($data,'phone',11); $password = textField($data,'password',72);
    if (!preg_match('/^1[3-9][0-9]{9}$/',$phone) || strlen($password)<8 || strlen($password)>72) problem('请输入有效手机号和 8 至 72 字节密码');
    $name = textField($data,'username',32);
    if (query('SELECT user_id FROM users WHERE phone=?',[$phone])->fetch()) problem('手机号已注册',409);
    query('INSERT INTO users(phone,password_hash,nickname) VALUES (?,?,?)',[$phone,password_hash($password,PASSWORD_DEFAULT),$name]);
    respond(['code'=>200] + sessionFor((int)db()->lastInsertId()));
case 'login':
    postOnly(); $user = query('SELECT * FROM users WHERE phone=?',[textField($data,'phone',11)])->fetch();
    $valid = password_verify(textField($data,'password',72),$user['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
    if (!$user || !$user['password_hash'] || !$valid) problem('手机号或密码错误',401);
    $session = sessionFor((int)$user['user_id']); respond(['code'=>200,'data'=>$session] + $session);
case 'logout':
    postOnly(); actor(); query('DELETE FROM sessions WHERE token_hash=?',[hash('sha256',substr($_SERVER['HTTP_AUTHORIZATION'],7))]); respond(['code'=>200]);
case 'getUsers':
    $user = query('SELECT user_id,nickname,avatar,user_type FROM users WHERE user_id=?',[positiveId($_GET['id'] ?? null)])->fetch();
    if (!$user) problem('用户不存在',404); respond($user);
case 'getUserStats':
    $id = positiveId($_GET['user_id'] ?? null);
    respond(['post_count'=>(int)query('SELECT COUNT(*) FROM posts WHERE user_id=?',[$id])->fetchColumn(),'followers'=>(int)query('SELECT COUNT(*) FROM follows WHERE followed_id=?',[$id])->fetchColumn(),'following'=>(int)query('SELECT COUNT(*) FROM follows WHERE follower_id=?',[$id])->fetchColumn()]);
case 'updateUser':
    postOnly(); $user = actor(); $name = textField($data,'nickname',64); $avatar = $data['avatarUrl'] ?? $user['avatar'];
    if (!is_string($avatar) || strlen($avatar)>2048 || ($avatar !== '/images/icon/avatar.png' && !preg_match('#^https?://#i',$avatar))) problem('头像地址无效');
    query('UPDATE users SET nickname=?,avatar=? WHERE user_id=?',[$name,$avatar,$user['user_id']]); respond(['code'=>200,'newAvatarUrl'=>$avatar,'nickName'=>$name]);
case 'getPetList':
case 'getUserPets':
    [$size,$offset,$page] = pageBounds();
    $where = $action === 'getUserPets' ? 'created_by=' . positiveId($_GET['user_id'] ?? null) : 'is_adopted=0';
    $rows = query("SELECT * FROM pets WHERE $where ORDER BY pet_id DESC LIMIT $size OFFSET $offset")->fetchAll();
    foreach ($rows as &$row) { $row['images'] = json_decode($row['images'],true); $row['cover'] = $row['images'][0] ?? ''; }
    respond(['code'=>0,'data'=>$rows,'page'=>$page]);
case 'getPetDetail':
    $row = query('SELECT * FROM pets WHERE pet_id=?',[positiveId($_GET['id'] ?? null)])->fetch();
    if (!$row) problem('宠物不存在',404); $row['images'] = json_decode($row['images'],true); $row['is_adopted'] = (bool)$row['is_adopted']; respond(['code'=>0,'data'=>$row]);
case 'createPet':
    postOnly(); $user = actor(); $gender = (int)($data['gender'] ?? 0); $age = (int)($data['age'] ?? 0);
    if (!in_array($gender,[0,1,2],true) || $age<0 || $age>600) problem('性别或月龄不正确');
    query('INSERT INTO pets(name,species,gender,age,health_status,description,images,created_by) VALUES (?,?,?,?,?,?,?,?)',[textField($data,'name',50),textField($data,'species',50),$gender,$age,substr((string)($data['health_status'] ?? ''),0,400),substr((string)($data['description'] ?? ''),0,8000),json_encode(images($data,'photos')),$user['user_id']]);
    respond(['code'=>200,'pet_id'=>(int)db()->lastInsertId(),'msg'=>'登记成功']);
case 'getpost':
case 'getuserpost':
case 'getpostdetail':
    [$size,$offset] = pageBounds(); $params = [];
    $sql = 'SELECT p.*,p.created_at AS post_time,u.nickname,u.avatar FROM posts p JOIN users u ON p.user_id=u.user_id';
    if ($action === 'getuserpost') { $sql .= ' WHERE p.user_id=?'; $params[] = positiveId($_GET['user_id'] ?? null); }
    if ($action === 'getpostdetail') { $sql .= ' WHERE p.post_id=?'; $params[] = positiveId($_GET['post_id'] ?? null); }
    $rows = query($sql . " ORDER BY p.post_id DESC LIMIT $size OFFSET $offset",$params)->fetchAll();
    foreach ($rows as &$row) $row['images'] = json_decode($row['images'],true);
    if ($action === 'getpostdetail' && !$rows) problem('动态不存在',404);
    respond(['code'=>200,'data'=>$action === 'getpostdetail' ? $rows[0] : $rows]);
case 'createPost':
    postOnly(); $user = actor(); query('INSERT INTO posts(user_id,content,images) VALUES (?,?,?)',[$user['user_id'],textField($data,'content'),json_encode(images($data,'photos',false))]);
    respond(['code'=>200,'post_id'=>(int)db()->lastInsertId(),'msg'=>'发布成功']);
case 'getComments':
    [$size,$offset] = pageBounds(); $rows = query("SELECT c.*,u.nickname,u.avatar,0 AS like_count FROM comments c JOIN users u ON c.user_id=u.user_id WHERE c.parent_id=? ORDER BY c.comment_id DESC LIMIT $size OFFSET $offset",[positiveId($_GET['parent_id'] ?? null)])->fetchAll(); respond(['code'=>200,'data'=>$rows]);
case 'createComment':
    postOnly(); $user = actor(); $id = positiveId($data['parent_id'] ?? null);
    if (($data['parent_type'] ?? 'post') !== 'post') problem('不支持的评论类型');
    if (!query('SELECT post_id FROM posts WHERE post_id=?',[$id])->fetch()) problem('动态不存在',404);
    query('INSERT INTO comments(user_id,parent_id,content) VALUES (?,?,?)',[$user['user_id'],$id,textField($data,'content',500)]);
    $row = query('SELECT c.*,u.nickname,u.avatar,0 AS like_count FROM comments c JOIN users u ON c.user_id=u.user_id WHERE c.comment_id=?',[db()->lastInsertId()])->fetch(); respond(['code'=>200,'data'=>$row]);
case 'deleteComment':
    postOnly(); $user = actor(); $stmt = query('DELETE FROM comments WHERE comment_id=? AND user_id=?',[positiveId($data['comment_id'] ?? null),$user['user_id']]);
    if (!$stmt->rowCount()) problem('评论不存在或无权删除',403); respond(['code'=>200]);
case 'getRescueList':
    [$size,$offset,$page] = pageBounds(); $rows = query("SELECT r.*,r.created_at AS time,u.nickname,u.avatar FROM rescues r JOIN users u ON r.user_id=u.user_id ORDER BY r.rescue_id DESC LIMIT $size OFFSET $offset")->fetchAll();
    foreach ($rows as &$row) $row['images'] = json_decode($row['images'],true);
    respond(['code'=>0,'data'=>$rows,'pageInfo'=>['current'=>$page,'pageSize'=>$size,'hasMore'=>count($rows)===$size]]);
case 'createRescue':
    postOnly(); $user = actor(); query('INSERT INTO rescues(user_id,name,location,images) VALUES (?,?,?,?)',[$user['user_id'],textField($data,'name',50),textField($data,'location',200),json_encode(images($data,'images'))]); respond(['code'=>0,'rescue_id'=>(int)db()->lastInsertId()]);
case 'updateRescueStatus':
    postOnly(); $user = actor(); $id = positiveId($data['rescue_id'] ?? null); $row = query('SELECT * FROM rescues WHERE rescue_id=?',[$id])->fetch();
    if (!$row) problem('求助不存在',404);
    if ($row['user_id'] !== $user['user_id'] && $user['user_type'] !== 1) problem('只能修改自己发布的求助',403);
    if (!isset($data['status']) || !in_array($data['status'],[0,1],true)) problem('状态无效');
    query('UPDATE rescues SET status=? WHERE rescue_id=?',[$data['status'],$id]); respond(['code'=>0]);
case 'submitAdoptionInfo':
    postOnly(); $user = actor(); $id = positiveId($data['pet_id'] ?? null); $pet = query('SELECT * FROM pets WHERE pet_id=?',[$id])->fetch();
    if (!$pet || $pet['is_adopted']) problem('宠物不存在或已领养',409);
    if ($pet['created_by'] === $user['user_id']) problem('不能申请领养自己发布的宠物');
    $details = []; foreach (['gender','experience','marriage','housing','work','phone','address','wechat','message'] as $field) $details[$field] = textField($data,$field,500);
    if (!preg_match('/^1[3-9][0-9]{9}$/',$details['phone'])) problem('手机号格式错误');
    if (query('SELECT application_id FROM adoptions WHERE pet_id=? AND user_id=?',[$id,$user['user_id']])->fetch()) problem('已提交过申请',409);
    query('INSERT INTO adoptions(pet_id,user_id,details) VALUES (?,?,?)',[$id,$user['user_id'],json_encode($details,JSON_UNESCAPED_UNICODE)]); respond(['code'=>200,'application_id'=>(int)db()->lastInsertId(),'message'=>'申请已提交']);
case 'getAdoptions':
    $user = actor(); $rows = query('SELECT a.*,p.name AS pet_name,p.created_by FROM adoptions a JOIN pets p ON a.pet_id=p.pet_id WHERE a.user_id=? OR p.created_by=? ORDER BY a.application_id DESC',[$user['user_id'],$user['user_id']])->fetchAll();
    foreach ($rows as &$row) $row['details'] = json_decode($row['details'],true); respond(['code'=>200,'data'=>$rows]);
case 'reviewAdoption':
    postOnly(); $user = actor(); if (!in_array($data['status'] ?? '',['approved','rejected'],true)) problem('审核状态无效');
    db()->beginTransaction(); $application = query('SELECT a.*,p.created_by,p.is_adopted FROM adoptions a JOIN pets p ON a.pet_id=p.pet_id WHERE a.application_id=?',[positiveId($data['application_id'] ?? null)])->fetch();
    if (!$application || $application['created_by'] !== $user['user_id']) { db()->rollBack(); problem('无权审核',403); }
    if ($application['status'] !== 'pending' || $application['is_adopted']) { db()->rollBack(); problem('该申请或宠物状态已变更',409); }
    query('UPDATE adoptions SET status=? WHERE application_id=?',[$data['status'],$application['application_id']]);
    if ($data['status'] === 'approved') { query('UPDATE pets SET is_adopted=1 WHERE pet_id=?',[$application['pet_id']]); query("UPDATE adoptions SET status='rejected' WHERE pet_id=? AND status='pending'",[$application['pet_id']]); }
    db()->commit(); respond(['code'=>200]);
case 'chatSend':
    postOnly(); $user = actor(); $recipient = positiveId($data['receiver_id'] ?? null);
    if ($recipient === $user['user_id'] || !query('SELECT user_id FROM users WHERE user_id=?',[$recipient])->fetch()) problem('接收者无效');
    query('INSERT INTO messages(sender_id,receiver_id,content) VALUES (?,?,?)',[$user['user_id'],$recipient,textField($data,'content')]); respond(['code'=>200,'data'=>['msg_id'=>(int)db()->lastInsertId()]]);
case 'chatHistory':
    $user = actor(); $partner = positiveId($_GET['receiver_id'] ?? null);
    $rows = query('SELECT * FROM (SELECT * FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY msg_id DESC LIMIT 100) ORDER BY msg_id',[$user['user_id'],$partner,$partner,$user['user_id']])->fetchAll(); respond(['code'=>200,'data'=>$rows]);
case 'chatRead':
    postOnly(); $user = actor(); $stmt = query('UPDATE messages SET status=1 WHERE receiver_id=? AND sender_id=? AND status=0',[$user['user_id'],positiveId($data['partner_id'] ?? null)]); respond(['code'=>200,'read_count'=>$stmt->rowCount()]);
case 'chatConversations':
    $id = actor()['user_id']; $rows = query('SELECT m.*,u.nickname,u.avatar,u.user_id AS partner_id,(SELECT COUNT(*) FROM messages unread WHERE unread.sender_id=u.user_id AND unread.receiver_id=? AND unread.status=0) AS unread_count FROM messages m JOIN users u ON u.user_id=CASE WHEN m.sender_id=? THEN m.receiver_id ELSE m.sender_id END WHERE m.msg_id IN (SELECT MAX(msg_id) FROM messages WHERE sender_id=? OR receiver_id=? GROUP BY CASE WHEN sender_id=? THEN receiver_id ELSE sender_id END) ORDER BY m.msg_id DESC',[$id,$id,$id,$id,$id])->fetchAll(); respond(['code'=>200,'data'=>$rows]);
default: problem('接口不存在',404);
}
