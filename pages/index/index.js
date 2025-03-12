// index.js
Page({
  data: {
    currentIndex: 0,
    tabs: ['广场', '动态', '科普'],
    swiperList: [
      { image: '/images/animals/dog1.jpg' },
      { image: '/images/animals/dog2.jpg' },
      { image: '/images/animals/dog3.jpg' }
    ]
  },

  // 切换选项卡
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentIndex: index })
  },

  // 滑动切换
  swiperChange(e) {
    const current = e.detail.current
    this.setData({ currentIndex: current })
  },

  // 点击跳转
  onpost(){
    wx.navigateTo({
      url: "/pages/home/post/post"  // 请确认实际页面路径
  });
  }
})