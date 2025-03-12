// pages/favorites/index.js
/* 页面数据容器 */
Page({
  data: {
    favorites: []// 收藏列表数据源
  },
/* 页面加载生命周期 */
  onLoad() {
    const favorites = [];
    // 从本地存储获取收藏数据
    for(let i = 1; i <= 10; i++) {
      if(wx.getStorageSync(`fav_${i}`)) {
        favorites.push({
          id: i,
          title: `文章${i}`// 默认标题（建议存储完整文章信息）
        });
      }
    }
    this.setData({ favorites });// 初始化列表数据
  },
/* 跳转详情页处理器 */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;// 获取文章ID
    wx.navigateTo({ url: `/pages/knowledge/detail?id=${id}` });// 跳转详情页
  }
});