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
  if (this.data.isSubmitting) return;
  this.setData({ isSubmitting: true });

  const { avatarUrl, nickName } = this.data.userInfo;
  const userId = getApp().globalData.userId;

  // 昵称长度验证
  if (nickName.length > 64) {
    wx.showToast({ title: '昵称不能超过64字符', icon: 'none' });
    this.setData({ isSubmitting: false });
    return;
  }

  wx.showLoading({ title: '保存中...' });

  // 判断头像是否为本地文件
  const isLocalAvatar = avatarUrl.startsWith('wxfile://') || avatarUrl.startsWith('http://tmp/');

  if (isLocalAvatar) {
    // 上传新头像
    wx.uploadFile({
      url: 'http://118.178.92.183/upload.php?type=avatar',
      filePath: avatarUrl,
      name: 'image',
      formData: {
        nickname: nickName,
        userId: userId
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            wx.setStorageSync('userProfile', {
              avatarUrl: data.newAvatarUrl,
              nickName: nickName
            });
            wx.showToast({ title: '保存成功' });
            setTimeout(() => wx.navigateBack(), 1500);
          } else {
            throw new Error(data.msg || '保存失败');
          }
        } catch (e) {
          wx.showToast({ title: e.message, icon: 'none' });
        }
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
      }
    });
  } else {
    // 仅更新资料
    wx.request({
      url: 'http://118.178.92.183/updataUser.php',
      method: 'POST',
      data: {
        userId: userId,
        nickname: nickName,
        avatarUrl: avatarUrl
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.setStorageSync('userProfile', {
            avatarUrl: avatarUrl,
            nickName: nickName
          });
          wx.showToast({ title: '保存成功' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
        }
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
      }
    });
  }
}
})