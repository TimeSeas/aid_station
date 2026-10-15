const client = require('../../../utils/request')
Page({
  data: { rescueList: [], page: 1, hasMore: true, currentUser: null, isLoading: false, error: '' },
  onShow() { this.onPullDownRefresh() },
  async loadData() {
    if (!this.data.hasMore || this.data.isLoading) return
    this.setData({ isLoading: true })
    try {
      const result = await client.call('getRescueList', { page: this.data.page })
      this.setData({ rescueList: [...this.data.rescueList, ...result.data], page: this.data.page + 1, hasMore: result.pageInfo.hasMore, error: '' })
    } catch (error) { this.setData({ error: error.message }) }
    finally { this.setData({ isLoading: false }); wx.stopPullDownRefresh() }
  },
  async toggleStatus(e) {
    const item = this.data.rescueList.find(row => row.rescue_id === e.currentTarget.dataset.id)
    if (!item || this.updating) return
    this.updating = true
    try {
      await client.call('updateRescueStatus', { rescue_id: item.rescue_id, status: item.status ? 0 : 1 }, 'POST')
      this.setData({ rescueList: this.data.rescueList.map(row => row.rescue_id === item.rescue_id ? { ...row, status: item.status ? 0 : 1 } : row) })
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.updating = false }
  },
  goToPublish() { if (getApp().requireLogin()) wx.navigateTo({ url: '/pages/rescue/publish/publish' }) },
  onReachBottom() { this.loadData() },
  onPullDownRefresh() {
    if (this.data.isLoading) return
    this.setData({ rescueList: [], page: 1, hasMore: true, currentUser: getApp().globalData.userId })
    this.loadData()
  }
})
