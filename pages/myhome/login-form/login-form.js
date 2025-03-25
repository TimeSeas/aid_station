Page({
  data: { 
    phone: '', 
    password: ''
  },
  
  // 输入处理（保持与发布页面的统一风格）
  onPhoneInput(e) { 
    this.setData({ phone: e.detail.value.replace(/\s+/g, '') }) 
  },
  onPasswordInput(e) { 
    this.setData({ password: e.detail.value.trim() }) 
  },

  handleLogin() {
    const { phone, password } = this.data;
    
    // 客户端验证（参考发布接口的参数校验逻辑）
    if (!phone || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });
    
    wx.request({
      url: 'http://118.178.92.183/login.php',
      method: 'POST',
      header: {
        'Content-Type': 'application/json' // 统一JSON格式（与发布接口一致）
      },
      data: {
        phone: phone,
        password: password
      },
      success: (res) => {
        // wx.hideLoading();
        // 根据接口文档调整状态码判断（参考网页1的返回示例）
        if (res.data.code === 200) { 
          // 存储凭证（参考发布页面的全局数据存储）
          getApp().globalData = {
            userId: res.data.data.user_id,
          };
          wx.setStorageSync('auth', res.data.data);
          
          wx.showToast({ title: '登录成功' });
          
          setTimeout(() => wx.switchTab({ url: '/pages/mypage/mypage' }), 500); // 保持与发布成功相同的跳转逻辑
        } else {
          // 使用接口返回的错误信息（参考网页2的错误码规范）
          wx.showToast({ 
            title: res.data.msg || `登录失败（${res.data.code}）`,
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络连接失败', icon: 'none' }); // 新增网络错误处理
      }
    })
  }
})