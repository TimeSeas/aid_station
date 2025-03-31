Page({
  data: {
    rescueList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    currentUser: null,
    isLoading: false
  },

  onLoad() {
    this.getCurrentUser();
    this.loadData();
  },

  getCurrentUser() {
    const authData = wx.getStorageSync('authData');
    this.setData({ currentUser: authData?.user_id });
  },

  loadData() {
    if (!this.data.hasMore || this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    const { page, pageSize } = this.data;
    const url = `http://118.178.92.183/api.php?action=getRescueList&page=${page}&pageSize=${pageSize}`;

    wx.showNavigationBarLoading();
    wx.request({
      url: url,
      method: 'GET',
      success: res => {
        if (res.data.code === 0) {
          const newList = res.data.data || [];
          this.setData({
            rescueList: [...this.data.rescueList, ...newList],
            hasMore: newList.length >= pageSize
          });
        }
      },
      complete: () => {
        this.setData({ isLoading: false });
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },

  toggleStatus(e) {
    const rescueId = e.currentTarget.dataset.id;
    const item = this.data.rescueList.find(v => v.rescue_id === rescueId);
    if (!item) return;

    const newStatus = item.status ? 0 : 1;
    wx.showLoading({ title: '处理中' });
    
    wx.request({
      url: 'http://118.178.92.183/api.php?action=updateRescueStatus',
      method: 'POST',
      data: {
        rescue_id: rescueId,
        status: newStatus,
        user_id: this.data.currentUser
      },
      success: res => {
        if (res.data.code === 0) {
          const list = this.data.rescueList.map(v => {
            if (v.rescue_id === rescueId) v.status = newStatus;
            return v;
          });
          this.setData({ rescueList: list });
        }
      },
      complete: wx.hideLoading
    });
  },

  goToPublish() {
    wx.navigateTo({ url: '/pages/rescue/publish/publish' });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, this.loadData);
    }
  },

  onPullDownRefresh() {
    this.setData({ rescueList: [], page: 1, hasMore: true }, this.loadData);
  }
});