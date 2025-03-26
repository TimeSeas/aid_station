Page({
  data: {
    images: [],
    formValid: false
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 3 - this.data.images.length,
      sizeType: ['compressed'],
      success: res => {
        const tempFiles = res.tempFilePaths;
        this.uploadImages(tempFiles);
      }
    });
  },

  // 上传图片
  uploadImages(files) {
    wx.showLoading({ title: '上传中' });
    const uploadTasks = files.map(file => {
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: 'http://118.178.92.183/api.php?action=uploadRescueImage',
          filePath: file,
          name: 'image',
          success: res => {
            const data = JSON.parse(res.data);
            if(data.code === 0) resolve(data.url);
          },
          fail: reject
        });
      });
    });

    Promise.all(uploadTasks)
      .then(urls => {
        this.setData({ images: [...this.data.images, ...urls] });
        this.checkFormValid();
      })
      .finally(() => wx.hideLoading());
  },

  // 表单提交
  submitForm(e) {
    const { name, location } = e.detail.value;
    const user = wx.getStorageSync('userInfo');
    
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中' });
    wx.request({
      url: 'http://118.178.92.183/api.php?action=submitRescue',
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
  checkFormValid() {
    const valid = this.data.images.length > 0;
    this.setData({ formValid: valid });
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.images
    });
  }
});