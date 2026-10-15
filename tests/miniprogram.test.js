const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '..')
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)])
let checks = 0
const files = ['pages', 'components', 'custom-tab-bar', 'utils'].flatMap(folder => walk(path.join(root, folder)))
for (const file of files.filter(file => file.endsWith('.js')).concat(path.join(root, 'app.js'))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr); checks++
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
    assert(fs.existsSync(path.resolve(path.dirname(file), match[1].endsWith('.js') ? match[1] : match[1] + '.js')), `Missing module: ${file} -> ${match[1]}`)
  }
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
for (const page of manifest.pages) {
  for (const extension of ['js', 'json', 'wxml', 'wxss']) assert(fs.existsSync(path.join(root, `${page}.${extension}`)), `Missing page: ${page}.${extension}`)
  JSON.parse(fs.readFileSync(path.join(root, page + '.json'), 'utf8'))
  const script = fs.readFileSync(path.join(root, page + '.js'), 'utf8')
  const template = fs.readFileSync(path.join(root, page + '.wxml'), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  for (const match of template.matchAll(/(?:bind|catch):?[a-z]+\s*=\s*"([A-Za-z]\w*)"/g)) {
    assert(new RegExp(`\\b${match[1]}\\s*(?:\\(|:)`).test(script), `Missing handler: ${page} -> ${match[1]}`)
  }
  checks++
}
const storage = new Map()
let app
const wx = {
  getStorageSync: key => storage.get(key), setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: key => storage.delete(key), showToast: () => {}
}
vm.runInNewContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), { App: value => { app = value }, wx, Date })
storage.set('authData', { userId: 5, token: 'token', lastLogin: Date.now() })
app.onLaunch(); assert.equal(app.globalData.userId, 5)
storage.set('authData', { userId: 5, lastLogin: Date.now() })
app.onLaunch(); assert.equal(app.globalData.userId, null)
app.saveAuth({ userId: 8, token: 'session' }); assert.equal(storage.get('authData').token, 'session')
app.clearAuth(); assert.equal(storage.has('authData'), false)
let intervalCount = 0
let chat
vm.runInNewContext(fs.readFileSync(path.join(root, 'pages/home/square/chat/chat.js'), 'utf8'), {
  require: () => ({}), Page: value => { chat = value }, getApp: () => ({ requireLogin: () => true }),
  setInterval: () => { intervalCount++; return 7 }, clearInterval: id => { assert.equal(id, 7); intervalCount-- }
})
chat.loadHistory = () => {}; chat.onShow(); chat.onHide(); assert.equal(intervalCount, 0)
chat.onShow(); chat.onUnload(); assert.equal(intervalCount, 0)
const client = require('../utils/request')
global.wx = wx; global.getApp = () => app
wx.request = options => options.success({ statusCode: 500, data: { code: 500, message: '测试失败' } })
async function run() {
  await assert.rejects(client.call('createPost', {}, 'POST'), /测试失败/)
  wx.uploadFile = options => options.success({ statusCode: 400, data: '{"code":400,"msg":"图片格式错误"}' })
  await assert.rejects(client.upload('local.jpg', 'post'), /图片格式错误/)
  wx.uploadFile = options => options.success({ statusCode: 200, data: 'not JSON' })
  await assert.rejects(client.upload('local.jpg', 'post'))
  app.saveAuth({ userId: 8, token: 'session' })
  wx.request = options => {
    assert.equal(options.header.Authorization, 'Bearer session')
    assert.equal(options.url, 'http://127.0.0.1:8080/api.php?action=getAdoptions')
    options.success({ statusCode: 401, data: { code: 401 } })
  }
  await assert.rejects(client.call('getAdoptions'))
  assert.equal(app.globalData.userId, null)
  console.log(`PASS: ${checks} source/page checks plus auth restoration, request failures, uploads and chat timer lifecycle`)
}
run().catch(error => { console.error(error); process.exitCode = 1 })
