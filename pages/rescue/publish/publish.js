const MAX_IMAGE_COUNT = 3;
Page({
  
  data: {
    tempImages: [],  // 统一变量名
    isSubmitting: false,
  },

  // 选择图片
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

  // 上传图片
  async _uploadImages() {
    try {
      const uploadTasks = this.data.tempImages.map(path => 
        new Promise((resolve, reject) => {
          wx.uploadFile({
            url: 'http://118.178.92.183/upload.php?type=pet',
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

  // 表单提交
  submitForm(e) {

        if (this.data.name === ''||this.data.location==='') {
          wx.showToast({ title: '请完整填写内容', icon: 'none' });
          return ;
        }
        if (this.data.tempImages.length === 0) {
          wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
          return ;
        }
    const { name, location } = e.detail.value;
    const user = wx.getStorageSync('authData');
    
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中' });
    this._uploadImages()
    wx.request({
      url: 'http://118.178.92.183/api.php?action=createRescue',
      method: 'POST',
      data: {
        name,
        location,
        images: this.data.images,
        user_id: user.user_id
      },
      success: res => {
        if (res.data.code === 0) {
          wx.navigateBack();
          wx.showToast({ title: '提交成功' });
        }
      },
      complete: () => wx.hideLoading()
    });
  },

  // 检查表单有效性
  onshow(){

  },
  

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.tempImages
    });
  }
});