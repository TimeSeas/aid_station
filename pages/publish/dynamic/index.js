const client = require('../../../utils/request')
Page({
  data: { content: '', tempImages: [], isSubmitting: false },
  onContentInput(e) { this.setData({ content: e.detail.value }) },
  chooseImage() {
    wx.chooseMedia({ count: 6 - this.data.tempImages.length, mediaType: ['image'], sizeType: ['compressed'],
      success: res => this.setData({ tempImages: [...this.data.tempImages, ...res.tempFiles.map(file => file.tempFilePath)] }) })
  },
  goBack() { wx.navigateBack() },
  async formSubmit() {
    if (this.data.isSubmitting || !getApp().requireLogin()) return
    if (!this.data.content.trim() || this.data.content.length > 2000) return wx.showToast({ title: '请填写 1 至 2000 字内容', icon: 'none' })
    this.setData({ isSubmitting: true }); wx.showLoading({ title: '发布中' })
    try {
      const photos = await Promise.all(this.data.tempImages.map(path => client.upload(path, 'post').then(result => result.url)))
      await client.call('createPost', { content: this.data.content, photos }, 'POST')
      wx.navigateBack()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { wx.hideLoading(); this.setData({ isSubmitting: false }) }
  }
})
