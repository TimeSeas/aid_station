// pages/admin/pet-upload/index.js
const app = getApp()

Page({
  data: {
    speciesList: ['犬类', '猫类', '兔类', '其他'],
    speciesIndex: 0,
    genderList: [
      { name: '公', value: 1 },
      { name: '母', value: 2 },
      { name: '未知', value: 0 }
    ],
    tempImages: [],
    isSubmitting: false
  },

  onLoad() {
    // this.checkAdminPermission()
  },

  // checkAdminPermission() {
  //   if (!app.globalData.userInfo || app.globalData.userInfo.role !== 1) {
  //     wx.redirectTo({ url: '/pages/mypage/mypage' })
  //   }
  // },
  speciesChange(e) {
    this.setData({
      speciesIndex: e.detail.value
    })
    // console.log('已选择品种:', this.data.speciesList[e.detail.value])
  },
  chooseImage() {
    if (this.data.tempImages.length >= 6) {
      wx.showToast({ title: '最多上传6张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: 6 - this.data.tempImages.length,
      sizeType: ['compressed'],
      success: res => {
        const newPaths = res.tempFiles.map(file => file.tempFilePath)
        this.setData({ 
          tempImages: [...this.data.tempImages, ...newPaths]
        })
      },
      fail: err => {
        console.error('选择图片失败:', err)
      }
    })
  },

  validateForm(formData = {}) { // 添加默认值
    if (!formData.name?.trim()) {
      wx.showToast({ title: '请填写名称', icon: 'none' })
      return false
    }
     // 检查是否有图片
     if (this.data.tempImages.length === 0) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return false;
    }
    return true
  },

  async uploadImages() {
    try {
      const uploadTasks = this.data.tempImages.map(path => 
        new Promise((resolve, reject) => {
          wx.uploadFile({
            url: 'http://118.178.92.183/upload.php',
            filePath: path,
            name: 'image',
            success: (res) => {
              console.log('上传响应:', res.data); // 打印原始响应
              const response = JSON.parse(res.data);
              resolve(response.url); 
            },
            fail: (err) => {
              console.error('上传失败详情:', err); 
              reject(err)
            }
          })
        })
      )

      const results = await Promise.all(uploadTasks)
      const validPaths = results.filter(Boolean)
      if (validPaths.length === 0) throw new Error('所有图片上传失败')
      return validPaths
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' })
      throw error
    }
  },

  formSubmit(e) {
   console.log('[表单数据]', e.detail.value); // 检查实际收到的数据
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    
    // 添加空对象保护
    const formData = e.detail.value || {}; 
    
    if (!this.validateForm(formData)) {
      this.setData({ isSubmitting: false });
      return;
    }

    wx.showLoading({ title: '提交中...' })

    this.uploadImages()
      .then(photoPaths => {
        this.submitPetInfo({
          ...formData,
          species: this.data.speciesList[this.data.speciesIndex],
          photos: photoPaths,
          created_by: app.globalData.userId
        })
      })
      .catch(() => wx.hideLoading())
      .finally(() => this.setData({ isSubmitting: false }))
  },

  submitPetInfo(petData) {
    wx.request({
      url: 'http://118.178.92.183/pets.php',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: petData,
      success: res => {
        wx.hideLoading()
        if (res.data.code === 200) {
          wx.showToast({ title: '登记成功' })
          setTimeout(() => wx.navigateBack(), 1500)
        } else {
          wx.showToast({ title: res.data.msg || '提交失败', icon: 'none' })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({ title: '网络请求失败', icon: 'none' })
        console.error('API请求失败:', err)
      }
    })
  }
})