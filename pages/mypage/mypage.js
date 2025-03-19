// pages/mypage/mypage.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    isLogin: false,
    avatarUrl: defaultAvatarUrl,
    username: '',
    userfollower: 0,
    userfeed: 0,
    userfollow: 0,
    list: [],
    refreshState: false,
    loadState: "finish",
    active: 0,
  },

  // 封装数据获取方法
  loadUserData() {
    const userId = getApp().globalData.userId
    if (!userId) return

    // 获取基础信息
    wx.request({
      url: `http://118.178.92.183/api.php?action=getUsers&id=${userId}`,
      success: (res) => {
        this.setData({ 
          username: res.data.username,
          // avatarUrl: res.data.avatar || defaultAvatarUrl 
        })
      }
    })

    // 获取统计信息
    wx.request({
      url: `http://118.178.92.183/api.php?action=getUserStats&user_id=${userId}`,
      success: (res) => {
        this.setData({
          userfollower: res.data.followers,
          userfeed: res.data.post_count,
          userfollow: res.data.following
        })
      }
    })
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    // 更新tab栏状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 2 })
    }

    // 检查登录状态并更新数据
    const hasLogin = !!getApp().globalData.userId
    this.setData({ isLogin: hasLogin })
    
    if (hasLogin) {
      this.loadUserData() // 每次显示页面时重新加载数据
    }
  },

  // 其他保持原有方法不变...
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
      isLogin: true
    })
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/index' })
  },

  navigateTologin() {
    wx.navigateTo({
      url: "/pages/myhome/login/login"
    })
  }
})