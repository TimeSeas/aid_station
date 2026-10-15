const client = require('../../../utils/request')
Page({
  data: { phone: '', username: '', password: '', isSubmitting: false },
  onPhoneInput(e) { this.setData({ phone: e.detail.value.trim() }) },
  onUsernameInput(e) { this.setData({ username: e.detail.value.trim() }) },
  onPasswordInput(e) { this.setData({ password: e.detail.value }) },
  async handleRegister() {
    if (this.data.isSubmitting) return
    this.setData({ isSubmitting: true })
    try {
      const result = await client.call('register', { phone: this.data.phone, username: this.data.username, password: this.data.password }, 'POST')
      getApp().saveAuth(result)
      wx.switchTab({ url: '/pages/mypage/mypage' })
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.setData({ isSubmitting: false }) }
  }
})
