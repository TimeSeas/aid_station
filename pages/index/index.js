const client = require('../../utils/request')
Page({
  data: { currentIndex: 0, tabs: ['广场', '论坛', '科普'], swiperList: [1, 2, 3].map(id => ({ image: `/images/animals/dog${id}.jpg` })),
    petList: [], posts: [], page: 1, hasMore: true, isLoading: false, error: '' },
  onShow() {
    if (this.getTabBar && this.getTabBar()) this.getTabBar().setData({ active: 0 })
    this.refresh()
  },
  refresh() {
    if (this.data.isLoading) return
    this.setData({ petList: [], page: 1, hasMore: true, error: '' })
    this.loadData()
    client.call('getpost', { pageSize: 20 }).then(result => this.setData({ posts: result.data })).catch(error => this.setData({ error: error.message }))
  },
  async loadData() {
    if (!this.data.hasMore || this.data.isLoading) return
    this.setData({ isLoading: true })
    try {
      const result = await client.call('getPetList', { page: this.data.page, pageSize: 10 })
      this.setData({ petList: [...this.data.petList, ...result.data], page: this.data.page + 1, hasMore: result.data.length === 10, error: '' })
    } catch (error) { this.setData({ error: error.message }) }
    finally { this.setData({ isLoading: false }); wx.stopPullDownRefresh() }
  },
  switchTab(e) { this.setData({ currentIndex: Number(e.currentTarget.dataset.index) }) },
  swiperChange(e) { this.setData({ currentIndex: e.detail.current }) },
  toPostDetail(e) { wx.navigateTo({ url: `/pages/publish/post-detail/index?id=${e.currentTarget.dataset.id}` }) },
  onsquare_pet() { wx.navigateTo({ url: '/pages/home/square/pet/pet' }) },
  onkepu() { wx.navigateTo({ url: '/pages/knowledge/index' }) },
  onjiu() { wx.navigateTo({ url: '/pages/knowledge/jiuzhu' }) },
  onling() { wx.navigateTo({ url: '/pages/knowledge/lingyang' }) },
  onPublishHelp() { wx.navigateTo({ url: '/pages/publish/help/index' }) },
  onReachBottom() { this.loadData() },
  onPullDownRefresh() { this.refresh() }
})
