const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime
}
// utils/api.js - 接口封装模块
const API_BASE = 'http://118.178.92.183/api.php'

// 统一请求方法
const request = (action, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}?action=${action}`,
      method,
      data: method === 'GET' ? data : JSON.stringify(data),
      header: {
        'Content-Type': 'application/json',
        'Authorization': getApp().globalData.token
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

// 接口集合
export const api = {
  // 微信登录
  wechatLogin: (code, userInfo) => request('wechatLogin', 'POST', {
    code,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl
  }),

  // 获取用户信息
  getUserInfo: userId => request('getUsers', 'GET', { id: userId }),

  // 获取用户统计
  getUserStats: userId => request('getUserStats', 'GET', { user_id: userId }),

  // 上传头像
  uploadAvatar: (userId, filePath) => new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}?action=uploadAvatar`,
      filePath,
      name: 'avatar',
      formData: { userId },
      success: res => resolve(JSON.parse(res.data)),
      fail: reject
    })
  }),

  // 更新头像
  updateAvatar: (userId, url) => request('updateAvatar', 'POST', {
    userId,
    avatarUrl: url
  })
}