const client = require('../../../utils/request')
Page({
  data: {
    posts: [],
    isLoading: false,
    userId:null
  },

  onLoad: function(options) {
    console.log(options)
    this.setData({ userId: options.id });
    this.loadUserPosts();
  },

  loadUserPosts: function() {
    const that = this;
    this.setData({ isLoading: true });

    client.request({
      url: '/api.php?action=getuserpost',
      data: {
        user_id: this.data.userId
      },
      success(res) {
        if (res.data.code === 200) {
          that.setData({
            posts: res.data.data,
            isLoading: false
          });
        }
      },
      fail() {
        wx.showToast({ title: '加载失败', icon: 'none' });
        that.setData({ isLoading: false });
      }
    });
  },
  toPostDetail(e) {
    const postId = e.currentTarget.dataset.id; // 确保这里能获取到id
    if (!postId) {
      wx.showToast({ title: '数据加载中...', icon: 'none' });
      return;
    }
    console.log('跳转postID:', postId);
    wx.navigateTo({
      url: `/pages/publish/post-detail/index?id=${postId}`  // 注意使用反引号
    });
  },
})
