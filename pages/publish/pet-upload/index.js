const client = require('../../../utils/request')
Page({
  data: { speciesList: ['犬类', '猫类', '兔类', '其他'], speciesIndex: 0,
    genderList: [{ name: '公', value: 1 }, { name: '母', value: 2 }, { name: '未知', value: 0, checked: true }], tempImages: [], isSubmitting: false },
  speciesChange(e) { this.setData({ speciesIndex: Number(e.detail.value) }) },
  chooseImage() {
    wx.chooseMedia({ count: 6 - this.data.tempImages.length, mediaType: ['image'], sizeType: ['compressed'],
      success: res => this.setData({ tempImages: [...this.data.tempImages, ...res.tempFiles.map(file => file.tempFilePath)] }) })
  },
  async formSubmit(e) {
    if (this.data.isSubmitting || !getApp().requireLogin()) return
    const form = e.detail.value
    if (!form.name.trim() || !this.data.tempImages.length) return wx.showToast({ title: '请填写名称并上传照片', icon: 'none' })
    this.setData({ isSubmitting: true }); wx.showLoading({ title: '提交中' })
    try {
      const photos = await Promise.all(this.data.tempImages.map(path => client.upload(path, 'pet').then(result => result.url)))
      await client.call('createPet', { ...form, species: this.data.speciesList[this.data.speciesIndex], gender: Number(form.gender), age: Number(form.age), photos }, 'POST')
      wx.navigateBack()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { wx.hideLoading(); this.setData({ isSubmitting: false }) }
  }
})
