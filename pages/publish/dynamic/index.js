Page({
  data: {
    content: '',
    images: [],
    maxImages: 9
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  chooseImage() {
    const remain = this.data.maxImages - this.data.images.length;
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      success: (res) => {
        const newImages = [...this.data.images, ...res.tempFilePaths];
        this.setData({ images: newImages.slice(0, this.data.maxImages) });
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  handleSubmit() {
    const { content, images } = this.data;
    
    if (!content.trim() && images.length === 0) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...' });
    
    // 图片上传逻辑（需要根据实际API调整）
    const uploadTasks = images.map(img => {
      return new Promise((resolve) => {
        wx.uploadFile({
          url: 'http://118.178.92.183/api.php',
          filePath: img,
          name: 'image',
          formData: { action: 'uploadImage' },
          success: resolve
        });
      });
    });

    Promise.all(uploadTasks).then(results => {
      const imageUrls = results.map(res => JSON.parse(res.data).url);
      
      // 提交主内容（模仿示例API调用）
      wx.request({
        url: 'http://118.178.92.183/api.php',
        method: 'POST',
        data: {
          action: 'createPost',
          content: content,
          images: imageUrls,
          nickname: "当前用户" // 应从全局状态获取
        },
        success: () => {
          wx.hideLoading();
          wx.showToast({ title: '发布成功' });
          setTimeout(() => wx.navigateBack(), 1500);
        }
      });
    });
  },

  goBack() {
    wx.navigateBack();
  }
});