const client = require('../../../utils/request')
Page({
  data: { phone: '', password: '', isSubmitting: false },
  onPhoneInput(e) { this.setData({ phone: e.detail.value.trim() }) },
  onPasswordInput(e) { this.setData({ password: e.detail.value }) },
  async handleLogin() {
    if (this.data.isSubmitting) return
    this.setData({ isSubmitting: true })
    try {
      const result = await client.call('login', { phone: this.data.phone, password: this.data.password }, 'POST')
      getApp().saveAuth(result)
      wx.switchTab({ url: '/pages/mypage/mypage' })
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.setData({ isSubmitting: false }) }
  },
  goToRegister() { wx.navigateTo({ url: '/pages/myhome/register-form/register-form' }) }
})
