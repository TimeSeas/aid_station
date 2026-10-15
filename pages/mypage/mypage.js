const client = require('../../utils/request')
const config = require('../../utils/config')
Page({
  data: { hasUserInfo: false, userId: null, myPets: [], swiperCurrent: 0,
    demoMode: config.demoMode, userInfo: {}, stats: { followers: 0, posts: 0, following: 0 } },
  onShow() {
    if (this.getTabBar && this.getTabBar()) this.getTabBar().setData({ active: 2 })
    if (getApp().globalData.userId) this.loadUserData()
    else this.setData({ hasUserInfo: false, myPets: [], userId: null, stats: { followers: 0, posts: 0, following: 0 } })
  },
  async handleLogin() {
    if (this.data.loggingIn) return
    this.setData({ loggingIn: true })
    try {
      const action = config.demoMode ? 'demoLogin' : 'wechatLogin'
      const data = config.demoMode ? {} : await wx.login()
      const result = await client.call(action, data, 'POST')
      getApp().saveAuth(result)
      await this.loadUserData()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.setData({ loggingIn: false }) }
  },
  async loadUserData() {
    const id = getApp().globalData.userId
    try {
      const responses = await Promise.all([
        new Promise((resolve, reject) => client.request({ url: '/api.php?action=getUsers', data: { id }, success: res => res.statusCode === 200 ? resolve(res.data) : reject(new Error('用户信息加载失败')), fail: reject })),
        new Promise((resolve, reject) => client.request({ url: '/api.php?action=getUserStats', data: { user_id: id }, success: res => res.statusCode === 200 ? resolve(res.data) : reject(new Error('统计加载失败')), fail: reject })),
        client.call('getUserPets', { user_id: id })
      ])
      const [user, stats, pets] = responses
      getApp().globalData.isAdmin = user.user_type === 1
      const profile = { avatarUrl: user.avatar, nickName: user.nickname }
      wx.setStorageSync('userProfile', profile)
      this.setData({ hasUserInfo: true, userId: id, userInfo: { ...profile, nickname: user.nickname }, myPets: pets.data,
        stats: { followers: stats.followers, posts: stats.post_count, following: stats.following } })
    } catch (error) { wx.showToast({ title: error.message || '连接失败，请检查服务', icon: 'none' }) }
  },
  bindViewTap() { wx.navigateTo({ url: '/pages/myhome/login/login' }) },
  goToFavorites() { wx.navigateTo({ url: '/pages/favorites/index' }) },
  goToAccountLogin() { wx.navigateTo({ url: '/pages/myhome/login-form/login-form' }) },
  goToApplications() { if (getApp().requireLogin()) wx.navigateTo({ url: '/pages/adoptions/index' }) },
  goToMessages() { if (getApp().requireLogin()) wx.navigateTo({ url: '/pages/messages/index' }) },
  swiperChange(e) { this.setData({ swiperCurrent: e.detail.current }) },
  async logout() {
    try { await client.call('logout', {}, 'POST') } catch (_) { /* Local logout remains available offline. */ }
    getApp().clearAuth()
    this.onShow()
  }
})
