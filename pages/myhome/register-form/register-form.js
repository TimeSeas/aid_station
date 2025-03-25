Page({
  data: { 
    phone: '', 
    username: '', 
    password: '' ,
    role: 0 // 默认普通用户[6](@ref)
  },
  
  // 输入处理
  onPhoneInput(e) { this.setData({ phone: e.detail.value }) },
  onUsernameInput(e) { this.setData({ username: e.detail.value }) },
  onPasswordInput(e) { this.setData({ password: e.detail.value }) },
  onRoleChange(e) {
    this.setData({ role: parseInt(e.detail.value) })
  },
  handleRegister() {
    const { phone, username, password, role } = this.data;
    
    // 客户端基本校验（与发布动态参数校验逻辑一致[1](@ref)）
    if (!phone || !username || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.request({
      url: 'http://118.178.92.183/register.php',
      method: 'POST',
      header: {
        'Content-Type': 'application/json' // 统一使用JSON格式[1,4](@ref)
      },
      data: { 
        phone: phone,
        username: username,
        password: password,
        role: role // 新增角色参数[3](@ref)
      },
      success: (res) => {
        console.log(res);
        if (res.data.code === 200) {
          // 存储用户ID（与发布页面获取globalData.userId逻辑一致[1](@ref)）
          getApp().globalData.userId = res.data.user_id;
          wx.showToast({ title: '注册成功' });
          setTimeout(() => wx.switchTab({ url: '/pages/mypage/mypage' }), 500); 
        } else {
          wx.showToast({ title: res.data.msg || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    })
  }
})