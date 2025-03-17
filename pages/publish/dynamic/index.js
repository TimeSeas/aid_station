// pages/publish/publish.js
Page({
  data: {
    content: '',
    userId: getApp().globalData.userId // 假设已登录，实际需从全局或缓存获取
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onPublish() {
    const { content, userId } = this.data;
    
    if (!content.trim()) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    wx.request({
      url: 'http://118.178.92.183/publish_post.php',
      method: 'POST',
      data: {
        user_id: userId,
        content: content
      },
      success: (res) => {
        console.log(res)
        if (res.data.code === 200) {

          wx.showToast({ title: '发布成功' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: res.data.msg || '发布失败', icon: 'none' });
          console.log(res);
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
});