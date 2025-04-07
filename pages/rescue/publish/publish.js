const MAX_IMAGE_COUNT = 3;

Page({
  data: {
    tempImages: [],
    isSubmitting: false,
    name: '',
    location: ''  // 仅保留手动输入的地址字段
  },

  // 输入框数据绑定
  bindInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  // 图片选择
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

  // 图片上传
  async _uploadImages() {
    try {
      const uploadTasks = this.data.tempImages.map(path => 
        new Promise((resolve, reject) => {
          wx.uploadFile({
            url: 'http://118.178.92.183/upload.php?type=nhpet',
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
  async submitForm(e) {
    const { name, location } = this.data;
    
    // 表单验证
    if (!name.trim() || !location.trim()) {
      wx.showToast({ title: '请完整填写内容', icon: 'none' });
      return;
    }
    
    if (this.data.tempImages.length === 0) {
      wx.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return;
    }
    
    if (this.data.isSubmitting) return;
    
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中' });

    try {
      const user = wx.getStorageSync('authData');
      if (!user?.userId) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      // 上传图片并准备数据
      this._uploadImages()
      .then(uploadedImageUrls => {
        this.submitPetInfo({
          name: this.data.name,
          location: this.data.location,
          images: uploadedImageUrls,
          user_id: user.userId
        })
      })
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
      this.setData({ isSubmitting: false });
    }
  },

  submitPetInfo(postData) {
    wx.request({
      url: 'http://118.178.92.183/help_request/createResue.php',
      method: 'POST',
      data: postData,
      success: (res) => {
        // console.log('完整响应:', res); // 调试日志
        if (res.data?.code === 0) {
          wx.navigateBack();
          wx.showToast({ title: '提交成功' });
        }else {
          wx.showToast({ 
            title: res.data?.msg || `错误码: ${res.statusCode}`,
            icon: 'none'
          });
        }
      }
    })
  },
  // 图片预览
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.tempImages
    });
  }
});