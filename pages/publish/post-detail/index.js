// pages/post-detail/post-detail.js
Page({
  data: {
    postId: null,
    comments: [],
    postDetail: null, // 新增帖子详情数据
    newContent: '',
    currentPage: 1,
    currentUser: { id: getApp().globalData.userId }, // 从全局获取
    hasMore: true
  },

  // 页面加载
  onLoad(options) {
    this.setData({ postId: options.id });
    this.loadPostDetail(); // 新增帖子内容请求
    this.loadComments();
  },
 // 新增：获取帖子详情
 loadPostDetail() {
  wx.request({
    url: 'http://118.178.92.183/api.php',
    method: 'GET',
    data: {
      action: 'getpostdetail',
      post_id: this.data.postId
    },
    success: (res) => {
      if (res.data.code === 200) {
        this.setData({ 
          postDetail: {
            ...res.data.data,
            post_time: this.formatTime(res.data.data.post_time)
          }
        });
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }
  });
},
// 时间格式化方法
formatTime(timeStr) {
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
},
  // 加载评论
  loadComments(isAppend = false) {
    wx.request({
      url: 'http://118.178.92.183/api.php',
    method: 'GET',
      data: {
        action: 'getComments',
        parent_type: 'post',
        parent_id: this.data.postId,
        page: this.data.currentPage,
        pageSize: 10
      },
      success: (res) => {
        if (res.data.code === 200) {
          const newData = isAppend ? 
            [...this.data.comments, ...res.data.data] : 
            res.data.data;
          
          this.setData({
            comments: newData,
            hasMore: res.data.data.length >= 10
          });
        } else {
          wx.showToast({ title: '加载评论失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.loadComments(true);
    }
  },

  // 输入内容
  onContentInput(e) {
    this.setData({ newContent: e.detail.value });
  },

  // 提交评论
  submitComment() {
    const { newContent, postId, currentUser } = this.data;
    
    if (!newContent.trim()) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }
  
    wx.request({
      url: 'http://118.178.92.183/api.php?action=createComment', // 保持action在URL
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded' // 使用表单形式
      },
      data: { // 直接传对象，小程序会自动编码
        user_id: currentUser.id,
        parent_type: 'post',
        parent_id: postId,
        content: newContent
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({ 
            comments: [res.data.data, ...this.data.comments] 
          });
        } else {
          wx.showToast({ title: res.data.message || '提交失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  // 删除评论
  onDeleteComment(e) {
    const commentId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'http://118.178.92.183/api.php',
            method: 'GET',
            data: {
              action: 'deleteComment',
              comment_id: commentId,
              user_id: this.data.currentUser.id
            },
            success: (res) => {
              if (res.data.code === 200) {
                const newComments = this.data.comments.filter(
                  item => item.comment_id !== commentId
                );
                this.setData({ comments: newComments });
              } 
              else {
                wx.showToast({ title: res.data.message || '删除失败', icon: 'none' });
              }
            }
          });
        }
      }
    });
  }
});