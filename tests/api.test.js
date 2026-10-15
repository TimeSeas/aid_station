// Real HTTP integration tests against an isolated SQLite database.
const { spawn, spawnSync } = require('node:child_process')
const { existsSync, mkdirSync, rmSync } = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '..')
const portable = path.join(root, '.runtime/php/php.exe')
const php = process.env.PHP_BIN || (existsSync(portable) ? portable : 'php')
const args = php === portable ? ['-d', `extension_dir=${path.join(root, '.runtime/php/ext')}`, '-d', 'extension=pdo_sqlite', '-d', 'extension=fileinfo', '-d', 'extension=openssl'] : []
const database = path.join(root, 'var', `test-${process.pid}.sqlite`)
const env = { ...process.env, AID_DATABASE: database, AID_DEMO_MODE: '1' }
mkdirSync(path.dirname(database), { recursive: true })
const init = spawnSync(php, [...args, 'php/init.php', '--seed'], { cwd: root, env, encoding: 'utf8' })
assert.equal(init.status, 0, init.stderr || init.error?.message)
const port = 18000 + process.pid % 10000
const server = spawn(php, [...args, '-S', `127.0.0.1:${port}`, '-t', 'php', 'php/router.php'], { cwd: root, env, stdio: 'pipe' })
let logs = ''; server.stderr.on('data', chunk => { logs += chunk })
let checks = 0
async function request(action, { data, token, status = 200, url } = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${url || '/api.php?action=' + action}`, {
    method: data === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data)
  })
  const body = await response.json()
  assert.equal(response.status, status, `${action}: ${JSON.stringify(body)}`)
  checks++
  return body
}
async function run() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try { await request('health'); break } catch (error) { if (attempt === 49) throw error; await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  await request('demoLogin', { status: 405 })
  const demo = await request('demoLogin', { data: {} })
  const owner = await request('register', { data: { phone: '13800000001', username: '发布者', password: 'test-password', role: 1 } })
  const applicant = await request('register', { data: { phone: '13800000002', username: '领养人', password: 'test-password' } })
  const stranger = await request('register', { data: { phone: '13800000003', username: '旁观者', password: 'test-password' } })
  await request('register', { data: { phone: '13800000001', username: '重复', password: 'test-password' }, status: 409 })
  await request('login', { data: { phone: '13800000001', password: 'wrong' }, status: 401 })
  const login = await request('login', { data: { phone: '13800000001', password: 'test-password' } })
  assert.equal(login.userId, owner.userId)
  assert.equal((await request('getUsers', { url: `/api.php?action=getUsers&id=${owner.userId}` })).user_type, 0)
  await request('getUsers', { url: '/api.php?action=getUsers&id=999999', status: 404 })
  await request('getPetList', { url: '/api.php?action=getPetList&pageSize=-10' })
  await request('createPost', { data: { user_id: owner.userId, content: '冒名发布' }, status: 401 })
  const post = await request('createPost', { token: owner.token, data: { user_id: stranger.userId, content: "守护者的日常 ' OR 1=1 --", photos: [] } })
  const detail = await request('getpostdetail', { url: `/api.php?action=getpostdetail&post_id=${post.post_id}` })
  assert.equal(detail.data.user_id, owner.userId)
  assert.deepEqual(detail.data.images, [])
  await request('createPost', { token: owner.token, data: { content: '   ' }, status: 400 })
  const comment = await request('createComment', { token: applicant.token, data: { parent_id: post.post_id, content: '加油' } })
  await request('getComments', { url: `/api.php?action=getComments&parent_id=${post.post_id}` })
  await request('deleteComment', { token: owner.token, data: { comment_id: comment.data.comment_id, user_id: applicant.userId }, status: 403 })
  await request('deleteComment', { token: applicant.token, data: { comment_id: comment.data.comment_id } })
  const photos = ['https://example.org/dog.jpg']
  const pet = await request('createPet', { token: owner.token, data: { name: '测试宠物', species: '犬类', photos, created_by: stranger.userId } })
  await request('createPet', { token: owner.token, data: { name: '测试', species: '犬类', photos: ['file:///etc/passwd'] }, status: 400 })
  const adoption = { pet_id: pet.pet_id, gender: '女', experience: '有', marriage: '未婚', housing: '自有', work: '稳定', phone: '13800000002', address: '示例地址', wechat: 'demo', message: '愿意长期陪伴' }
  const application = await request('submitAdoptionInfo', { token: applicant.token, data: adoption })
  await request('submitAdoptionInfo', { token: applicant.token, data: adoption, status: 409 })
  assert.equal((await request('getAdoptions', { token: stranger.token })).data.length, 0)
  assert.equal((await request('getAdoptions', { token: owner.token })).data[0].details.phone, adoption.phone)
  await request('reviewAdoption', { token: stranger.token, data: { application_id: application.application_id, status: 'approved' }, status: 403 })
  await request('reviewAdoption', { token: owner.token, data: { application_id: application.application_id, status: 'approved' } })
  assert.equal((await request('getPetDetail', { url: `/api.php?action=getPetDetail&id=${pet.pet_id}` })).data.is_adopted, true)
  const rescue = await request('createRescue', { token: owner.token, data: { name: '求助', location: '公园', images: photos } })
  await request('updateRescueStatus', { token: stranger.token, data: { rescue_id: rescue.rescue_id, status: 1, user_id: owner.userId }, status: 403 })
  await request('updateRescueStatus', { token: owner.token, data: { rescue_id: rescue.rescue_id, status: 2 }, status: 400 })
  await request('updateRescueStatus', { token: owner.token, data: { rescue_id: rescue.rescue_id, status: 1 } })
  await request('chatSend', { token: applicant.token, data: { sender_id: owner.userId, receiver_id: owner.userId, content: '你好' } })
  assert.equal((await request('chatHistory', { token: owner.token, url: `/api.php?action=chatHistory&receiver_id=${applicant.userId}` })).data[0].sender_id, applicant.userId)
  assert.equal((await request('chatHistory', { token: stranger.token, url: `/api.php?action=chatHistory&receiver_id=${owner.userId}&sender_id=${applicant.userId}` })).data.length, 0)
  assert.equal((await request('chatConversations', { token: owner.token })).data[0].unread_count, 1)
  await request('chatRead', { token: owner.token, data: { partner_id: applicant.userId } })
  assert.equal((await request('chatConversations', { token: owner.token })).data[0].unread_count, 0)
  await request('updateUser', { token: owner.token, data: { userId: stranger.userId, nickname: '新的昵称', avatarUrl: '/images/icon/avatar.png' } })
  assert.equal((await request('getUsers', { url: `/api.php?action=getUsers&id=${owner.userId}` })).nickname, '新的昵称')
  await request('anything', { status: 404 })
  for (const url of ['/schema.sql', '/config.example.php', '/bootstrap.php', '/../var/aid_station.sqlite', '/init.php']) await request('', { url, status: 404 })
  const uploaded = []
  for (const valid of [false, true]) {
    const form = new FormData()
    const bytes = valid ? Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') : Buffer.from('<?php echo 1; ?>')
    form.append('image', new Blob([bytes], { type: 'image/png' }), 'image.png')
    const response = await fetch(`http://127.0.0.1:${port}/upload.php?type=pet`, { method: 'POST', headers: { Authorization: `Bearer ${owner.token}` }, body: form })
    const result = await response.json(); assert.equal(response.status, valid ? 200 : 400); checks++
    if (valid) {
      const uploadPath = new URL(result.url).pathname
      uploaded.push(path.join(root, 'php', uploadPath))
      assert.equal((await fetch(`http://127.0.0.1:${port}${uploadPath}`)).status, 200)
    }
  }
  uploaded.forEach(file => rmSync(file, { force: true }))
  await request('logout', { token: demo.token, data: {} })
  await request('getAdoptions', { token: demo.token, status: 401 })
  assert(!/Fatal error|Warning:|Uncaught/.test(logs), logs)
  console.log(`PASS: ${checks} HTTP checks plus ownership, privacy, persistence, adoption and upload assertions`)
}
run().catch(error => { console.error(error); console.error(logs); process.exitCode = 1 }).finally(async () => {
  server.kill()
  await new Promise(resolve => server.once('exit', resolve))
  rmSync(database, { force: true })
})
