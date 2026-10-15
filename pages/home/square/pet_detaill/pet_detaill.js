const client = require('../../../../utils/request')
Page({
  data: {
    pet: {},
    showButtons: true ,// 控制按钮是否显示
    petId: null,
    currentUserId: null

  },

  onLoad(options) {
    if (!options.id || isNaN(options.id)) {
      wx.showToast({ title: '参数错误', icon: 'error' })
      return wx.navigateBack()
    }
      // 获取全局用户 ID
      const globalUserId = getApp().globalData.userId;
    this.setData({
      petId: parseInt(options.id),
      currentUserId: globalUserId  // 转换为数字类型
    });


    this.loadPetDetail();

  },

  loadPetDetail() {
    wx.showLoading({ title: '加载中...' });

    client.request({
      url: '/api.php?action=getPetDetail',
      data: {
        action: 'getPetDetail',
        id: this.data.petId
      },
      success: res => {
        if (res.data.code === 0) {
          const pet = res.data.data;

          // 判断是否显示按钮
          const showButtons = String(pet.created_by) !== String(this.data.currentUserId);
          this.setData({ pet: res.data.data,showButtons: showButtons });
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
    if (!getApp().requireLogin()) return;
    // 跳转到“聊一聊”页面
    wx.navigateTo({
      url: `/pages/home/square/chat/chat?masterid=${this.data.pet.created_by}` // zhur ID 参数
    });
  },
  navigateToAdoptForm() {
    if (!getApp().requireLogin()) return;
    // 跳转到“我要领养”表单页面
    wx.navigateTo({
      url: `/pages/home/square/adoptForm/adoptForm?petId=${this.data.petId}` // 传递宠物 ID 参数
    });
  }
});
