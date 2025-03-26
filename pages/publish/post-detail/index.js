Page({
  data: {
    post: {},
    comments: [],
    commentContent: '',
    postId: null
  },

  onLoad(options) {
    const postId = options.id;
    this.setData({ postId });
    
    // 获取帖子详情
    wx.request({
      url: 'http://118.178.92.183/api.php',
      method: 'GET',
      data: {
        action: 'getPostDetail',
        id: postId
      },
      success: (res) => {
        this.setData({ post: res.data.post });
      }
    });

    // 获取评论
    wx.request({
      url: 'http://118.178.92.183/api.php',
      method: 'GET',
      data: {
        action: 'getComments',
        postId: postId
      },
      success: (res) => {
        this.setData({ comments: res.data.comments });
      }
    });
  },

  onCommentInput(e) {
    this.setData({ commentContent: e.detail.value });
  },

  submitComment() {
    const { commentContent, postId } = this.data;
    if (!commentContent.trim()) return;

    wx.request({
      url: 'http://118.178.92.183/api.php',
      method: 'POST',
      data: {
        action: 'addComment',
        postId: postId,
        content: commentContent,
        nickname: "当前用户" // 应从用户信息获取
      },
      success: (res) => {
        this.setData({ 
          comments: [...this.data.comments, res.data.newComment],
          commentContent: '' 
        });
      }
    });
  },

  // 复用点赞/差评方法
  handleLike(e) {
    this.updateInteraction(e, 'like');
  },

  handleDislike(e) {
    this.updateInteraction(e, 'dislike');
  },

  updateInteraction(e, type) {
    const { id, type: targetType } = e.currentTarget.dataset;
    wx.request({
      url: 'http://118.178.92.183/api.php',
      method: 'POST',
      data: {
        action: type,
        targetId: id,
        targetType: targetType
      },
      success: (res) => {
        const key = targetType === 'post' ? 'post' : 'comments';
        const updatedData = this.data[key].map(item => {
          if (item._id === id) {
            return { ...item, [type+'s']: res.data.newCount };
          }
          return item;
        });
        this.setData({ [key]: updatedData });
      }
    })
  }
});