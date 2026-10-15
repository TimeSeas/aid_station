App({
  globalData: { isAdmin: false, userId: null },
  onLaunch() {
    const auth = wx.getStorageSync('authData')
    if (auth && auth.token && Date.now() - auth.lastLogin < 7 * 86400000) {
      this.globalData.userId = auth.userId
    } else this.clearAuth()
  },
  saveAuth(result) {
    const userId = result.userId || result.user_id
    wx.setStorageSync('authData', { userId, token: result.token, lastLogin: Date.now() })
    this.globalData.userId = userId
    this.globalData.isAdmin = false
  },
  clearAuth() {
    wx.removeStorageSync('authData')
    wx.removeStorageSync('userProfile')
    this.globalData.userId = null
    this.globalData.isAdmin = false
  },
  requireLogin() {
    if (this.globalData.userId) return true
    wx.showToast({ title: '请先在“我的”页面登录', icon: 'none' })
    return false
  }
})
