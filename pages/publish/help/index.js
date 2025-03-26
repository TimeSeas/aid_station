Page({
  data: {
    rescueList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    currentUser: null
  },

  onLoad() {
    this.getCurrentUser();
    this.loadData();
  },

  // 获取当前用户
  getCurrentUser() {
    const user = wx.getStorageSync('userInfo');
    this.setData({ currentUser: user?.user_id });
  },

  // 加载数据
  loadData() {
    if (!this.data.hasMore) return;

    const { page, pageSize } = this.data;
    wx.showLoading({ title: '加载中' });

    wx.request({
      url: 'http://118.178.92.183/api.php?action=getRescueList',
      method: 'GET',
      data: { page, pageSize },
      success: res => {
        if (res.data.code === 0) {
          const newList = res.data.data || [];
          this.setData({
            rescueList: [...this.data.rescueList, ...newList],
            hasMore: newList.length >= pageSize
          });
        }
      },
      complete: () => wx.hideLoading()
    });
  },

  // 切换状态
  toggleStatus(e) {
    const rescueId = e.currentTarget.dataset.id;
    const item = this.data.rescueList.find(v => v.rescue_id === rescueId);
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
      complete: () => wx.hideLoading()
    });
  },

  // 跳转发布页
  goToPublish() {
    wx.navigateTo({ url: '/pages/rescue/publish/publish' });
  },

  // 触底加载
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadData();
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ rescueList: [], page: 1, hasMore: true }, () => {
      this.loadData();
    });
  }
});