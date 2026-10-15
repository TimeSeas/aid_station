# API 约定

主入口为 `/api.php?action=动作名`。GET 参数放查询串，POST 使用 JSON；图片上传使用 multipart。受保护接口要求 `Authorization: Bearer <token>`，令牌默认有效期 7 天。

兼容旧前端约定：宠物与救助接口成功码为 `0`，其余成功码为 `200`；错误返回非 2xx HTTP 状态及 `{code, message, msg}`。客户端统一支持两种成功码。

| 动作 | 方法 | 参数或说明 |
| --- | --- | --- |
| health | GET | 数据库连通性与演示开关 |
| demoLogin | POST | 仅 demo_mode 开启并已 seed 时可用 |
| wechatLogin | POST | code；需服务端微信配置 |
| register | POST | phone、username、password；角色固定普通用户 |
| login | POST | phone、password |
| logout | POST | 当前令牌立即失效 |
| getUsers | GET | id；只返回公开资料 |
| getUserStats | GET | user_id |
| updateUser | POST | nickname、avatarUrl；仅修改本人 |
| getPetList | GET | page、pageSize；仅未领养 |
| getPetDetail | GET | id |
| getUserPets | GET | user_id、page、pageSize |
| createPet | POST | name、species、gender、age、health_status、description、photos |
| getpost / getuserpost | GET | page、pageSize；后者需 user_id |
| getpostdetail | GET | post_id |
| createPost | POST | content、photos（可空数组） |
| getComments | GET | parent_id、page、pageSize |
| createComment | POST | parent_id、content、parent_type=post |
| deleteComment | POST | comment_id；仅删除本人评论 |
| getRescueList | GET | page、pageSize |
| createRescue | POST | name、location、images |
| updateRescueStatus | POST | rescue_id、status=0/1；仅发布者或服务端管理员 |
| submitAdoptionInfo | POST | pet_id、gender、experience、marriage、housing、work、phone、address、wechat、message |
| getAdoptions | GET | 当前用户申请的或自己发布宠物收到的申请，含联系资料 |
| reviewAdoption | POST | application_id、status=approved/rejected；仅宠物发布者 |
| chatSend | POST | receiver_id、content；发送者取自令牌 |
| chatHistory | GET | receiver_id；读取本人和对方最近 100 条消息 |
| chatRead | POST | partner_id；将对方发给本人的消息标记已读 |
| chatConversations | GET | 本人各会话最近消息和未读数 |

宠物、动态、评论、救助、申请、资料和聊天写操作均需登录。列表分页最大 20 条。申请审核通过在一个事务内更新申请和宠物状态，并拒绝该宠物其他待审申请；救助完成独立于领养状态。

上传入口 `/upload.php?type=pet|post|avatar|nhpet`，字段 `image`；头像还需 `nickname`。文件上限 5MB，检查真实 MIME 和图片结构，仅接收 JPEG、PNG、GIF、WebP。成功返回 `{code:200,url}`；头像返回 `{code:200,newAvatarUrl,nickName}`。

原 `pets.php`、`publish_post.php`、`createResue.php`、`updataUser.php`、`chat_*.php` 等文件保留为兼容入口，新页面统一调用主入口。
