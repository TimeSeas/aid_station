Page({
  data: {
    post: {},          // 帖子详情
    comments: [],      // 评论列表
    newComment: ''     // 新评论内容
  },

  onLoad(e) {
    const postId = e.id
    this.getPostDetail(postId)
    this.getComments(postId)
  },

  // 获取帖子详情
  async getPostDetail(postId) {
    const db = wx.cloud.database()
    const res = await db.collection('posts')
      .doc(postId)
      .get()
    
    // 更新浏览数
    db.collection('posts').doc(postId).update({
      data: {
        viewCount: res.data.viewCount + 1
      }
    })
    
    this.setData({ post: res.data })
  },

  // 获取评论列表
  async getComments(postId) {
    const db = wx.cloud.database()
    const res = await db.collection('comments')
      .where({ postId })
      .orderBy('createTime', 'asc')
      .get()
    
    this.setData({ comments: res.data })
  },

  // 输入评论内容
  onCommentInput(e) {
    this.setData({ newComment: e.detail.value })
  },

  // 提交评论
  async submitComment() {
    const { newComment } = this.data
    if (!newComment.trim()) return
    
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于评论身份标识'
      })

      await wx.cloud.callFunction({
        name: 'createComment',
        data: {
          postId: this.data.post._id,
          content: newComment,
          author: userInfo.openId,
          avatar: userInfo.avatarUrl,
          nickname: userInfo.nickName
        }
      })

      this.getComments(this.data.post._id)
      this.setData({ newComment: '' })
      wx.showToast({ title: '评论成功' })
    } catch (err) {
      console.error(err)
      wx.showToast({ title: '评论失败', icon: 'none' })
    }
  }
})