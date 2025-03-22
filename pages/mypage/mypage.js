import { api } from '../../utils/util.js'
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({
  data: {
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    userInfo: {
    },
    stats: {
      followers: 0,
      posts: 0,
      following: 0
    }
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  handleLogin() {
    this.getWechatUserInfo()
      .then(userInfo => this.processLogin(userInfo))
      .catch(err => console.error('登录失败', err))
  },

  // 获取用户信息（必须由点击直接触发）
  getWechatUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: ({ userInfo }) => resolve(userInfo),
        fail: reject
      })
    })
  },

  // 处理登录流程
  async processLogin(userInfo) {
    try {
      // 获取code
      const { code } = await wx.login()
      
      // 调用登录接口
      const res = await api.wechatLogin(code, {
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      })

      // 更新全局状态
      getApp().globalData.userId = res.userId
      this.setData({
        hasUserInfo: true,
        userInfo: {
          avatarUrl: userInfo.avatarUrl,
          nickname: userInfo.nickName
        }
      })
      
      // 加载用户数据
      this.loadUserData()
    } catch (error) {
      wx.showToast({ title: '登录失败', icon: 'none' })
    }
  },

  // 更新用户资料
  updateUserProfile: function(userInfo) {
    this.setData({
      hasUserInfo: true,
      userInfo: {
        ...this.data.userInfo,
        avatarUrl: userInfo.avatarUrl,
        nickname: userInfo.nickName
      }
    })
  },

  // 加载用户数据
  loadUserData: async function() {
    try {
      const [basicInfo, stats] = await Promise.all([
        api.getUserInfo(getApp().globalData.userId),
        api.getUserStats(getApp().globalData.userId)
      ])
      
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          avatarUrl: basicInfo.avatar || this.data.userInfo.avatar,
          nickname: basicInfo.nickname || this.data.userInfo.nickname,
         
        },
        stats: {
          followers: stats.followers || 0,
          posts: stats.post_count || 0,
          following: stats.following || 0
        }
      })
    } catch (error) {
      console.error('数据加载失败', error)
    }
  },

  // 头像上传
  onChooseAvatar: async function(e) {
    const userId = getApp().globalData.userId
    if (!userId){
      wx.showToast({ title: '未登录', icon: 'none'})
      return
    } 

    try {
      const res = await api.uploadAvatar(userId, e.detail.avatarUrl)
      this.setData({
        userInfo:{
          avatarUrl:res.url
        } 
      })
      await api.updateAvatar(userId, res.url)
      wx.showToast({ title: '头像更新成功' })
    } catch (error) {
      wx.showToast({ title: '头像上传失败', icon: 'none' })
    }
  },

  // 页面显示处理
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 2 })
    }
    this.checkLoginStatus()
    if (this.data.isLogin) this.loadUserData()
  },

  // 检查登录状态
  checkLoginStatus() {
    const hasLogin = !!getApp().globalData.userId
    this.setData({ hasUserInfo: hasLogin })
    if (!hasLogin) {
      this.setData({
        userInfo: {
          avatarUrl: DEFAULT_AVATAR,
          nickname: '未登录',
        },
        stats: { followers: 0, posts: 0, following: 0 }
      })
    }
  },

  // 跳转收藏
  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/index' })
  }
})