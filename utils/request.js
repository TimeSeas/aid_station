const config = require('./config')

function headers(extra) {
  const auth = wx.getStorageSync('authData') || {}
  return Object.assign({ 'Content-Type': 'application/json' }, extra || {},
    auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
}

function request(options) {
  return wx.request(Object.assign({}, options, {
    url: config.baseUrl + options.url,
    timeout: 15000,
    header: headers(options.header),
    success(res) {
      if (res.statusCode === 401) {
        getApp().clearAuth()
        wx.showToast({ title: '请重新登录', icon: 'none' })
      }
      if (options.success) options.success(res)
    }
  }))
}

function call(action, data = {}, method = 'GET') {
  return new Promise((resolve, reject) => request({
    url: `/api.php?action=${action}`, method, data,
    success(res) {
      if (res.statusCode >= 200 && res.statusCode < 300 && [0, 200].includes(res.data.code)) resolve(res.data)
      else reject(new Error(res.data.message || res.data.msg || '请求失败'))
    },
    fail() { reject(new Error('连接失败，请检查后端是否启动')) }
  }))
}

function upload(filePath, type, formData = {}) {
  return new Promise((resolve, reject) => wx.uploadFile({
    url: `${config.baseUrl}/upload.php?type=${type}`, filePath, name: 'image', formData,
    header: { Authorization: headers().Authorization || '' },
    success(res) {
      try {
        const body = JSON.parse(res.data)
        if (res.statusCode !== 200 || body.code !== 200) throw new Error(body.msg || '图片上传失败')
        resolve(body)
      } catch (error) { reject(error) }
    },
    fail() { reject(new Error('图片上传失败，请重试')) }
  }))
}

module.exports = { request, call, upload }
