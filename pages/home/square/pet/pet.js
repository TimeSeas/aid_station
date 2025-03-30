// 基于网页1的分页逻辑增强
Page({
  data: {
    petList: [],
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    if (!this.data.hasMore) return;

    const { page, pageSize } = this.data;
    wx.showNavigationBarLoading();
    
    wx.request({
      url: 'http://118.178.92.183/api.php?action=getPetList',
      method: 'GET',
      data: {
        action: 'getPetList',
        page,
        pageSize
      },
      success: res => {
        if (res.data.code === 0) {
          const newList = res.data.data || [];
          this.setData({
            petList: [...this.data.petList, ...newList],
            hasMore: newList.length >= pageSize
          });
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' });
      },
      complete: () => {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadData();
      });
    }
  },

  onPullDownRefresh() {
    this.setData({ petList: [], page: 1, hasMore: true }, () => {
      this.loadData();
    });
  }
})