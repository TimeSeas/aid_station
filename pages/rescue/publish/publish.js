const client = require('../../../utils/request')
Page({
  data: { tempImages: [], isSubmitting: false, name: '', location: '' },
  bindInput(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }) },
  chooseImage() {
    wx.chooseMedia({ count: 3 - this.data.tempImages.length, mediaType: ['image'], sizeType: ['compressed'],
      success: res => this.setData({ tempImages: [...this.data.tempImages, ...res.tempFiles.map(file => file.tempFilePath)] }) })
  },
  previewImage(e) { wx.previewImage({ current: e.currentTarget.dataset.url, urls: this.data.tempImages }) },
  async submitForm() {
    if (this.data.isSubmitting || !getApp().requireLogin()) return
    if (!this.data.name.trim() || !this.data.location.trim() || !this.data.tempImages.length) return wx.showToast({ title: '请填写名称、位置并上传照片', icon: 'none' })
    this.setData({ isSubmitting: true }); wx.showLoading({ title: '提交中' })
    try {
      const images = await Promise.all(this.data.tempImages.map(path => client.upload(path, 'nhpet').then(result => result.url)))
      await client.call('createRescue', { name: this.data.name, location: this.data.location, images }, 'POST')
      wx.navigateBack()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { wx.hideLoading(); this.setData({ isSubmitting: false }) }
  }
})
