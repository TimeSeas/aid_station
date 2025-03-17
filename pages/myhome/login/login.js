// 任意页面的js中获取用户信息
Page({

  navigateToMobileLogin(){
    wx.navigateTo({
      url: "/pages/myhome/login-form/login-form"  // 请确认实际页面路径
  });
  },
  navigateToRegister(){
    wx.navigateTo({
      url: "/pages/myhome/register-form/register-form"  // 请确认实际页面路径
  });
},
})