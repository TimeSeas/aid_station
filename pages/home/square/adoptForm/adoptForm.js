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
    const { selectedGender, selectedExperience, selectedMarriage, selectedHousing, selectedWork, phone, address, wechat, message } = this.data;

    // 验证必填字段
    if (!selectedGender || !selectedExperience || !selectedMarriage || !selectedHousing || !selectedWork || !phone || !address || !wechat || !message) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 提交数据（示例：打印到控制台）
    console.log('提交的数据:', {
      gender: selectedGender,
      experience: selectedExperience,
      marriage: selectedMarriage,
      housing: selectedHousing,
      work: selectedWork,
      phone,
      address,
      wechat,
      message
    });

    // 模拟提交成功
    wx.showToast({ title: '提交成功', icon: 'success' });
  }
});