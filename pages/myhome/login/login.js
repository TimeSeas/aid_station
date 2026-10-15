const client = require('../../../utils/request')
Page({
  data: { userInfo: { avatarUrl: '/images/icon/avatar.png', nickName: '', roleType: '普通用户' }, isSubmitting: false },
  onLoad() {
    const profile = wx.getStorageSync('userProfile') || {}
    this.setData({ userInfo: { ...this.data.userInfo, ...profile, roleType: getApp().globalData.isAdmin ? '管理员' : '普通用户' } })
  },
  onChooseAvatar(e) { this.setData({ 'userInfo.avatarUrl': e.detail.avatarUrl, avatarChanged: true }) },
  onInputChange(e) { this.setData({ 'userInfo.nickName': e.detail.value }) },
  async submitUserInfo() {
    if (this.data.isSubmitting || !getApp().requireLogin()) return
    const nickname = this.data.userInfo.nickName.trim()
    if (!nickname || nickname.length > 64) return wx.showToast({ title: '请填写 1 至 64 字昵称', icon: 'none' })
    this.setData({ isSubmitting: true })
    wx.showLoading({ title: '保存中' })
    try {
      let avatar = this.data.userInfo.avatarUrl
      if (this.data.avatarChanged) avatar = (await client.upload(avatar, 'avatar', { nickname })).newAvatarUrl
      await client.call('updateUser', { nickname, avatarUrl: avatar }, 'POST')
      wx.setStorageSync('userProfile', { nickName: nickname, avatarUrl: avatar })
      wx.navigateBack()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { wx.hideLoading(); this.setData({ isSubmitting: false }) }
  }
})
