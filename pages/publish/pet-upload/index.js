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
    tempImages: []
  },

  onLoad() {
    this.checkAdminPermission()
  },

  // 权限验证
  checkAdminPermission() {
    if (!app.globalData.userInfo || app.globalData.userInfo.role !== 1) {
      wx.redirectTo({ url: '/pages/mypage/mypage' })
    }
  },

  // 图片选择
// 图片选择（关键修复）
chooseImage() {
  wx.chooseMedia({
    count: 6 - this.data.tempImages.length,
    sizeType: ['compressed'],
    success: res => {
      // 正确获取路径方式
      const newPaths = res.tempFiles.map(file => file.tempFilePath)
      this.setData({ 
        tempImages: [...this.data.tempImages, ...newPaths]
      })
      console.log('当前已选图片:', this.data.tempImages) // 调试日志
    },
    fail: err => {
      console.error('选择图片失败:', err)
    }
  })
},

  // 表单验证
  validateForm(formData) {
    // // 1. 增加空值兜底
    // const name = (formData.name || "").trim();
    // if (!name) {
    //   wx.showToast({ title: '请填写名称', icon: 'none' });
    //   return false;
    // }
  
    // 2. 调试输出表单数据
    console.log('[表单数据]', JSON.stringify(formData));
  
    // 3. 确保图片路径有效性
    if (this.data.tempImages.some(path => !path.startsWith('http'))) {
      wx.showToast({ title: '存在无效的本地图片路径', icon: 'none' });
      return false;
    }
  
    return true;
  },

  // 图片上传
  // 修改后的图片上传逻辑
async uploadImages() {
  try {
    const uploadTasks = this.data.tempImages.map(path => {
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: 'http://118.178.92.183/upload.php',
          filePath: path,
          name: 'image',
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        })
      }).catch(err => {
        console.error(`文件 ${path} 上传失败:`, err);
        return null; // 允许其他文件继续上传
      });
    });

    const results = await Promise.all(uploadTasks);
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
      throw error;
    }
  },

  // 表单提交
  formSubmit(e) {
    const formData = e.detail.value
    if (!this.validateForm(formData)) return

    wx.showLoading({ title: '提交中...' })
    
    this.uploadImages()
      .then(photoPaths => {
        this.submitPetInfo({
          ...formData,
          species: this.data.speciesList[this.data.speciesIndex],
          photos: photoPaths.join(','),
          created_by: app.globalData.userId
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('提交失败:', err)
      })
      .finally(() => {
        wx.hideLoading(); // 确保始终执行
      });
  },

  // 提交宠物信息
  submitPetInfo(petData) {
    wx.request({
      url: 'http://118.178.92.183/pets.php',
      method: 'POST',
      header: {
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
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