const client = require('../../../../utils/request')
Page({
  data: {
    selectedGender: '', // 当前选中的性别
    selectedExperience: '', // 当前选中的养宠经验
    selectedMarriage: '', // 当前选中的婚姻状况
    selectedHousing: '', // 当前选中的住房情况
    selectedWork: '', // 当前选中的工作状态
    phone: '', // 手机号
    address: '', // 地址
    wechat: '', // 微信号
    message: '' // 留言
  },
  onLoad(options) { this.setData({ petId: Number(options.petId) }) },
  selectGender(e) {
    this.setData({ selectedGender: e.currentTarget.dataset.value });
  },
  selectExperience(e) {
    this.setData({ selectedExperience: e.currentTarget.dataset.value });
  },
  selectMarriage(e) {
    this.setData({ selectedMarriage: e.currentTarget.dataset.value });
  },
  selectHousing(e) {
    this.setData({ selectedHousing: e.currentTarget.dataset.value });
  },
  selectWork(e) {
    this.setData({ selectedWork: e.currentTarget.dataset.value });
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },
  onWechatInput(e) {
    this.setData({ wechat: e.detail.value });
  },
  onMessageInput(e) {
    this.setData({ message: e.detail.value });
  },
  submitForm() {
    if (this.data.isSubmitting || !getApp().requireLogin()) return;
    this.setData({ isSubmitting: true });
    const { selectedGender, selectedExperience, selectedMarriage, selectedHousing, selectedWork, phone, address, wechat, message } = this.data;

    // 验证必填字段
    if (!selectedGender || !selectedExperience || !selectedMarriage || !selectedHousing || !selectedWork || !phone || !address || !wechat || !message) {
      this.setData({ isSubmitting: false });
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 新增：发送数据到后端
    client.request({
      url: '/api.php?action=submitAdoptionInfo',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        pet_id: this.data.petId,
        gender: selectedGender,
        experience: selectedExperience,
        marriage: selectedMarriage,
        housing: selectedHousing,
        work: selectedWork,
        phone: phone,
        address: address,
        wechat: wechat,
        message: message
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({ title: '申请已提交', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 800);
        } else {
          wx.showToast({ title: res.data.message || '提交失败', icon: 'none' });
        }
      },
      complete: () => this.setData({ isSubmitting: false }),
      fail: (err) => {
        console.error('网络错误:', err);
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      }
    });

  }
});
