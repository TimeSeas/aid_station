# 启动与部署

## 本地配置

默认配置位于 `php/config.example.php`。需要修改时复制成 `php/config.local.php`，该文件已忽略：

```php
<?php
return [
    'demo_mode' => false,
    'database' => dirname(__DIR__) . '/var/aid_station.sqlite',
    'base_url' => 'https://your-api-domain.example',
    'wechat_appid' => '填写自己的 AppID',
    'wechat_secret' => '填写重置后的 AppSecret',
];
```

`base_url` 是图片 URL 的前缀，必须与前端使用的服务地址一致，不包含 `api.php`。默认示例是本地演示环境；正式服务应关闭演示登录。

## 正式运行

1. 准备 PHP 8.2+、`pdo_sqlite`、`fileinfo`、`openssl` 和 PHP-FPM。确认 PHP 能访问微信 API，且 TLS CA 配置有效。
2. 克隆代码，创建本地配置，关闭 `demo_mode`。全新正式库运行 `php php/init.php`，不要加 `--seed`。本地已有演示库时应使用另外的正式数据库文件，关闭演示入口不会删除旧示例内容。
3. Web 根目录设为项目的 `php/`，数据库放在根目录外的 `var/`，只给 PHP 服务账户所需的写权限；图片存储目录 `php/uploads/` 同样需要写权限。
4. 参考 `docs/nginx.conf.example`，只暴露 API 入口和随机命名的图片文件。示例监听回环地址，供本机 TLS 反向代理转发；直接部署时由托管面板配置 HTTPS 虚拟主机、域名及相应 PHP-FPM socket。示例未在本机 Nginx 上实测。
5. 更新前端 `utils/config.js`：`baseUrl` 使用 HTTPS 域名、`demoMode` 改成 `false`。`project.config.json` 填自己的 AppID，选择开发者工具可用的基础库版本。
6. 在微信平台配置 request、uploadFile、downloadFile 合法域名；恢复开发者工具域名校验并完成真机预览，再提交微信审核。
7. 在反向代理保留 Authorization 请求头。示例包含基本请求限速；根据真实访问量调整限流、备份、监控、内容审核与隐私政策。上线前应单独完成这些运营配置。

数据库可通过 SQLite 备份 API 或 `sqlite3 var/aid_station.sqlite '.backup backup.sqlite'` 备份，勿只复制正在写入的文件。上传图片需要同步备份。

默认本地端口使用 `8082`。本机调试时 `8080` 的 HTTP 请求出现超时，切换端口后恢复；如自行改端口，请同时修改前端地址、服务端图片地址和启动参数。

## 常见问题

| 现象 | 检查位置 |
| --- | --- |
| `could not find driver` | PHP 是否启用 `pdo_sqlite`，CLI 与 FPM 是否使用同一配置 |
| 首页连接失败 | 后端是否启动、前端地址、微信本地设置和防火墙 |
| 初始化返回 503 | 是否运行过 `php php/init.php --seed`，配置的数据库路径是否一致 |
| 图片上传失败 | 登录令牌、文件类型、5MB 限制、目录权限和反向代理体积限制 |
| 图片上传后无法显示 | `base_url`、HTTPS、downloadFile 合法域名 |
| 微信登录不可用 | AppID/AppSecret、微信返回、外网与 CA、工具真实身份 |
| 领养重复提交 | 每个用户对同一只宠物只能提交一次；查看申请列表 |

## GitHub 发布

原仓库：`TimeSeas/aid_station`。使用独立维护分支便于查看本次改动；合并到默认分支后 README 和自动化检查才会成为仓库首页默认内容。

README 已加入首页、宠物详情、救助列表与个人中心的真实模拟器截图，保存于 `docs/screenshots/`。后续更新截图时仍应运行真实页面，并避免泄露真实姓名、手机号与地址。

旧 Git 历史已出现过明文凭据，必须先在微信平台和数据库侧轮换。历史重写需要协调所有贡献者和克隆副本，本轮不重写历史、不强制推送。
