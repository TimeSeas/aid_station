const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
      roleType: '普通用户'
    }
  },

  onLoad() {
    this.initUserData()
  },

  // 初始化用户数据
  initUserData() {
    const cachedData = wx.getStorageSync('userProfile')
    if (cachedData) {
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          ...cachedData,
          roleType: getApp().globalData.isAdmin ? '管理员' : '普通用户'
        }
      })
    }
  },

  // 头像选择事件
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.cacheUserData({ avatarUrl })
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })
  },

  // 昵称输入事件
  onInputChange(e) {
    const nickName = e.detail.value
    this.cacheUserData({ nickName })
    this.setData({
      'userInfo.nickName': nickName
    })
  },

  // 数据缓存
  cacheUserData(partialData) {
    const newData = { 
      ...wx.getStorageSync('userProfile') || {},
      ...partialData 
    }
    wx.setStorageSync('userProfile', newData)
  },

  // 提交到服务器
// 提交到服务器（安全增强版）
submitUserInfo() {
  const { avatarUrl, nickName } = this.data.userInfo;
  const userId = getApp().globalData.userId;

  // 增强验证
  if (!nickName || nickName.length > 64) {
    wx.showToast({ title: '昵称需1-64字符', icon: 'none' });
    return;
  }
  if (!/^(https?|wxfile):\/\//.test(avatarUrl)) {
    wx.showToast({ title: '请重新选择头像', icon: 'none' });
    return;
  }

  wx.showLoading({ title: '保存中...' });

  // 统一使用upload.php接口
  wx.uploadFile({
    url: 'http://118.178.92.183/upload.php?type=avatar',
    filePath: avatarUrl,
    name: 'image', // 与后端接收字段名一致
    formData: {
      nickname: nickName,
      userId: userId
    },
    success: (res) => {
      try {
        const data = JSON.parse(res.data);
        if (data.code === 200) {
          // 更新本地缓存
          wx.setStorageSync('userProfile', {
            avatarUrl: data.newAvatarUrl,
            nickName: nickName
          });
          // 更新全局数据
          getApp().globalData.userInfo.avatar = data.newAvatarUrl;
          wx.showToast({ title: '保存成功' });
        } else {
          throw new Error(data.msg || '保存失败');
        }
      } catch (e) {
        wx.showToast({ title: e.message, icon: 'none' });
      }
    },
    fail: () => {
      wx.showToast({ title: '网络请求失败', icon: 'none' });
    },
    complete: () => {
      wx.hideLoading();
    }
  });
}
})