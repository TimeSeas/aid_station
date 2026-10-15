<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Shanghai');
ini_set('display_errors', '0');
$config = require __DIR__ . '/config.example.php';
if (is_file(__DIR__ . '/config.local.php')) {
    $config = array_replace($config, require __DIR__ . '/config.local.php');
}
if (getenv('AID_DATABASE')) $config['database'] = getenv('AID_DATABASE');
if (getenv('AID_DEMO_MODE') !== false) $config['demo_mode'] = filter_var(getenv('AID_DEMO_MODE'), FILTER_VALIDATE_BOOLEAN);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(array $body, int $status = 200): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function problem(string $message, int $status = 400): never {
    respond(['code' => $status, 'msg' => $message, 'message' => $message], $status);
}
set_exception_handler(function (Throwable $error): void {
    error_log((string)$error);
    problem('服务暂不可用，请检查服务端配置或日志', 500);
});
function db(): PDO {
    global $config;
    static $pdo;
    if (!$pdo) {
        if (!is_file($config['database'])) problem('请先执行 php php/init.php 初始化数据库', 503);
        $pdo = new PDO('sqlite:' . $config['database'], null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        $pdo->exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    }
    return $pdo;
}
function query(string $sql, array $params = []): PDOStatement {
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}
function input(): array {
    if (in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) return [];
    if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
        try { $value = json_decode(file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR); }
        catch (JsonException $e) { problem('JSON 格式错误'); }
        if (!is_array($value) || array_is_list($value) && $value !== []) problem('参数必须是对象');
        return $value;
    }
    return $_POST;
}
function textField(array $data, string $name, int $max = 2000): string {
    $value = $data[$name] ?? '';
    if (!is_string($value) || trim($value) === '' || strlen($value) > $max * 4) problem('请正确填写 ' . $name);
    return trim($value);
}
function positiveId($value): int {
    if (!filter_var($value, FILTER_VALIDATE_INT) || (int)$value < 1) problem('无效的记录编号');
    return (int)$value;
}
function postOnly(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') problem('请使用 POST 请求', 405);
}
function actor(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer ([a-f0-9]{64})$/', $header, $match)) problem('请先登录', 401);
    $user = query('SELECT u.* FROM users u JOIN sessions s ON u.user_id=s.user_id WHERE s.token_hash=? AND s.expires_at>?', [hash('sha256', $match[1]), time()])->fetch();
    if (!$user) problem('登录已过期，请重新登录', 401);
    return $user;
}
function sessionFor(int $id): array {
    global $config;
    $token = bin2hex(random_bytes(32));
    query('DELETE FROM sessions WHERE expires_at < ?', [time()]);
    query('INSERT INTO sessions (user_id,token_hash,expires_at) VALUES (?,?,?)', [$id, hash('sha256', $token), time() + $config['token_days'] * 86400]);
    return ['userId' => $id, 'user_id' => $id, 'token' => $token];
}
function pageBounds(): array {
    $size = max(1, min(20, (int)($_GET['pageSize'] ?? 10)));
    $page = max(1, (int)($_GET['page'] ?? 1));
    return [$size, ($page - 1) * $size, $page];
}
function images(array $data, string $key, bool $required = true): array {
    $images = $data[$key] ?? [];
    if (!is_array($images) || count($images) > 6 || ($required && !$images)) problem('请上传 1 至 6 张图片');
    foreach ($images as $url) {
        if (!is_string($url) || strlen($url) > 2048 || !preg_match('#^https?://#i', $url) || !filter_var($url, FILTER_VALIDATE_URL)) problem('图片地址无效');
    }
    return $images;
}
