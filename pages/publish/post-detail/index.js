const client = require('../../../utils/request')
Page({
  data: { postId: null, comments: [], postDetail: null, newContent: '', currentPage: 1, currentUser: {}, hasMore: true, loading: false, submitting: false },
  onLoad(options) { this.setData({ postId: Number(options.id) }); this.loadPostDetail(); this.loadComments() },
  onShow() { this.setData({ currentUser: { id: getApp().globalData.userId } }) },
  async loadPostDetail() {
    try { const result = await client.call('getpostdetail', { post_id: this.data.postId }); this.setData({ postDetail: result.data }) }
    catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
  },
  async loadComments() {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ loading: true })
    try {
      const result = await client.call('getComments', { parent_id: this.data.postId, page: this.data.currentPage })
      this.setData({ comments: [...this.data.comments, ...result.data], currentPage: this.data.currentPage + 1, hasMore: result.data.length === 10 })
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.setData({ loading: false }) }
  },
  onReachBottom() { this.loadComments() },
  onContentInput(e) { this.setData({ newContent: e.detail.value }) },
  async submitComment() {
    if (this.data.submitting || !getApp().requireLogin() || !this.data.newContent.trim()) return
    this.setData({ submitting: true })
    try {
      await client.call('createComment', { parent_id: this.data.postId, content: this.data.newContent, parent_type: 'post' }, 'POST')
      this.setData({ newContent: '', comments: [], currentPage: 1, hasMore: true })
      await this.loadComments()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.setData({ submitting: false }) }
  },
  onDeleteComment(e) {
    wx.showModal({ title: '删除评论', content: '确定删除自己的这条评论吗？', success: async res => {
      if (!res.confirm) return
      try { await client.call('deleteComment', { comment_id: e.currentTarget.dataset.id }, 'POST'); this.setData({ comments: this.data.comments.filter(item => item.comment_id !== e.currentTarget.dataset.id) }) }
      catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    } })
  }
})
