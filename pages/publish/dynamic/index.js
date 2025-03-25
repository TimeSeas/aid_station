Page({
  data: {
    posts: [],          // 帖子列表数据
    isLoading: false    // 加载状态
  },

  onLoad() {
    this.getPostList()
  },

  // 获取帖子列表（带加载状态）
  async getPostList() {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    
    const db = wx.cloud.database()
    const res = await db.collection('posts')
      .orderBy('createTime', 'desc')
      .get()
    
    this.setData({ 
      posts: res.data,
      isLoading: false 
    })
  },

  // 跳转发帖页
  toPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },

  // 跳转帖子详情页
  toPostDetail(e) {
    const postId = e.currentTarget.dataset.id
    wx.navigateTo({ 
      url: `/pages/post-detail/post-detail?id=${postId}` 
    })
  }
})