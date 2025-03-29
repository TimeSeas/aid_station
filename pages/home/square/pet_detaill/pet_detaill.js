Page({
  data: {
    pet: {},
    petId: null
  },

  onLoad(options) {
    if (!options.id || isNaN(options.id)) {
      wx.showToast({ title: '参数错误', icon: 'error' })
      return wx.navigateBack()
    }
    this.setData({ 
      petId: parseInt(options.id)  // 转换为数字类型
    });
    this.loadPetDetail();
  },

  loadPetDetail() {
    wx.showLoading({ title: '加载中...' });
    
    wx.request({
      url: 'http://118.178.92.183/api.php?action=getPetDetail',
      data: {
        action: 'getPetDetail',
        id: this.data.petId
      },
      success: res => {
        if (res.data.code === 0) {

          this.setData({ pet: res.data.data });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  navigateToChat() {
    // 跳转到“聊一聊”页面
    wx.navigateTo({
      url: `/pages/home/square/chat/chat?petId=${this.data.pet.created_by}` // 传递宠物 ID 参数
    });
  },
  navigateToAdoptForm() {
    // 跳转到“我要领养”表单页面
    wx.navigateTo({
      url: `/pages/home/square/adoptForm/adoptForm?petId=${this.data.petId}` // 传递宠物 ID 参数
    });
  }
});