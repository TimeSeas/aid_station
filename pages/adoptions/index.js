const client = require('../../utils/request')
Page({
  data: { applications: [], error: '', currentUser: null },
  onShow() { this.load() },
  async load() {
    if (!getApp().requireLogin()) return
    try {
      const result = await client.call('getAdoptions')
      const labels = { pending: '待审核', approved: '已通过', rejected: '未通过' }
      this.setData({ currentUser: getApp().globalData.userId, error: '', applications: result.data.map(row => ({ ...row, label: labels[row.status] })) })
    } catch (error) { this.setData({ error: error.message }) }
  },
  review(e) {
    const { id, status } = e.currentTarget.dataset
    wx.showModal({ title: '审核领养申请', content: status === 'approved' ? '确认通过？该宠物将标记为已领养，其他待审申请会自动拒绝。' : '确认拒绝这次申请？', success: async result => {
      if (!result.confirm || this.reviewing) return
      this.reviewing = true
      try { await client.call('reviewAdoption', { application_id: id, status }, 'POST'); await this.load() }
      catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
      finally { this.reviewing = false }
    } })
  }
})
