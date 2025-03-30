// pages\publish\dynamic\index.js
const app = getApp()
const MAX_IMAGE_COUNT = 6;

Page({
  data: {
    content: '',
    tempImages: [],  // 统一变量名
    isSubmitting: false
  },

  // 内容输入处理
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },
  chooseImage() {
    if (this.data.tempImages.length >= MAX_IMAGE_COUNT) {
      wx.showToast({ title: `最多上传${MAX_IMAGE_COUNT}张图片`, icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: MAX_IMAGE_COUNT - this.data.tempImages.length,
      sizeType: ['compressed'],
      success: chooseResult => {  // 参数命名优化
        const newPaths = chooseResult.tempFiles.map(file => file.tempFilePath)
        this.setData({ 
          tempImages: [...this.data.tempImages, ...newPaths]
        })
      }
    })
  },
  // validateForm(formData = {}) { // 添加默认值
  //   if (!formData.content?.trim()) {
  //     wx.showToast({ title: '请填写内容', icon: 'none' })
  //     return false
  //   }
  //    // 检查是否有图片
  //    if (this.data.tempImages.length === 0) {
  //     wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
  //     return false;
  //   }
  //   return true
  // },
 // 图片上传（网页5[5](@ref)、网页8[8](@ref)优化方案）
 async _uploadImages() {
  try {
    const uploadTasks = this.data.tempImages.map(path => 
      new Promise((resolve, reject) => {
        wx.uploadFile({
          url: 'http://118.178.92.183/upload.php?type=post',
          filePath: path,
          name: 'image',
          success: (res) => {
            const response = JSON.parse(res.data);
            resolve(response.url); 
          },
          fail: (err) => reject(err)
        })
      })
    )

    const uploadedImageUrls = await Promise.all(uploadTasks)
    return uploadedImageUrls.filter(Boolean)
  } catch (error) {
    wx.showToast({ title: error.message, icon: 'none' })
    throw error
  }
},

  // 表单提交（网页9[9](@ref)错误处理优化）
  formSubmit(e) {
    const user = wx.getStorageSync('authData');
    
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    // if (!this.validateForm(formData)) {
    //   this.setData({ isSubmitting: false });
    //   return;
    // }

    wx.showLoading({ title: '提交中...' })
    
    this._uploadImages()
      .then(uploadedImageUrls => {
        this.submitPetInfo({
          content:this.data.content,
          photos: uploadedImageUrls,
          user_id: app.globalData.userId  // 变量名修正
        })
      })
      .finally(() => {
        wx.hideLoading();
        this.setData({ isSubmitting: false })
      })
  },

  submitPetInfo(postData) {
    wx.request({
      url: 'http://118.178.92.183/publish_post.php',
      method: 'POST',
      data: postData,
      success: res => {
        if (res.data.code === 200) {
          wx.showToast({ title: '登记成功' })
          setTimeout(() => wx.navigateBack(), 1500)
        }
      }
    })
  }
})