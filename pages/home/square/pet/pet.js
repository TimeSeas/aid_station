const client = require('../../../../utils/request')
Page({
  data: { petList: [], page: 1, hasMore: true, isLoading: false, error: '' },
  onShow() { this.onPullDownRefresh() },
  async loadData() {
    if (!this.data.hasMore || this.data.isLoading) return
    this.setData({ isLoading: true })
    try {
      const result = await client.call('getPetList', { page: this.data.page })
      this.setData({ petList: [...this.data.petList, ...result.data], page: this.data.page + 1, hasMore: result.data.length === 10, error: '' })
    } catch (error) { this.setData({ error: error.message }) }
    finally { this.setData({ isLoading: false }); wx.stopPullDownRefresh() }
  },
  onReachBottom() { this.loadData() },
  onPullDownRefresh() { if (this.data.isLoading) return; this.setData({ petList: [], page: 1, hasMore: true }); this.loadData() }
})
