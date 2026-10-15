<?php
// CLI only: no schema changes through HTTP.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$config = require __DIR__ . '/config.example.php';
if (is_file(__DIR__ . '/config.local.php')) $config = array_replace($config, require __DIR__ . '/config.local.php');
if (getenv('AID_DATABASE')) $config['database'] = getenv('AID_DATABASE');
if (getenv('AID_DEMO_MODE') !== false) $config['demo_mode'] = filter_var(getenv('AID_DEMO_MODE'), FILTER_VALIDATE_BOOLEAN);
if (!is_dir(dirname($config['database']))) mkdir(dirname($config['database']), 0700, true);
$db = new PDO('sqlite:' . $config['database'], null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$db->exec(file_get_contents(__DIR__ . '/schema.sql'));
if (in_array('--seed', $argv, true)) {
    if (!$config['demo_mode']) { fwrite(STDERR, "Seed requires demo_mode=true\n"); exit(1); }
    $db->beginTransaction();
    if (!(int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn()) {
        $stmt = $db->prepare('INSERT INTO users (openid,nickname) VALUES (?,?)');
        $stmt->execute(['demo-guardian', '演示守护者']);
        $guardian = (int)$db->lastInsertId();
        $stmt->execute(['demo-station', '暖爪救助站']);
        $station = (int)$db->lastInsertId();
        $pet = $db->prepare('INSERT INTO pets(name,species,gender,age,health_status,description,images,created_by) VALUES (?,?,?,?,?,?,?,?)');
        foreach (['豆豆', '小麦', '团团'] as $index => $name) {
            $pet->execute([$name,'犬类',1,8+$index*4,'已体检，等待有缘人','性格亲人，适合有耐心、愿意长期陪伴的家庭。',json_encode(['/images/animals/dog'.($index+1).'.jpg']),$station]);
        }
        $db->prepare('INSERT INTO posts(user_id,content,images) VALUES (?,?,?)')->execute([$station,'欢迎来到暖爪救助站。这里记录救助日常，也期待每一次认真负责的领养。',json_encode(['/images/animals/dog1.jpg'])]);
        $db->prepare('INSERT INTO rescues(user_id,name,location,images) VALUES (?,?,?,?)')->execute([$guardian,'等待安置的小狗','示例：社区公园北门（演示数据）',json_encode(['/images/animals/dog2.jpg'])]);
    }
    $db->commit();
}
echo "Database ready" . (in_array('--seed', $argv, true) ? ' (demo data)' : '') . PHP_EOL;
