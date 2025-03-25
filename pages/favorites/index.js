/* 页面数据容器 */
// pages/favorites/index.js
Page({
  data: {
    favorites: [] ,// 收藏列表数据源
    searchKeyword: '' // 搜索关键字
  },
  onLoad() {
    const favorites = [];
    for (let i = 1; i <= 10; i++) {
      const article = wx.getStorageSync(`fav_${i}`);
      if (article) {
        favorites.push({
          ...article,
          isFavorite: true // 动态绑定收藏状态
        });
      }
    }
    this.setData({ favorites }); // 初始化列表数据
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id; // 获取文章ID
    wx.navigateTo({ url: `/pages/knowledge/detail?id=${id}` }); // 跳转详情页
  },
  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id; // 获取文章ID
    const index = this.data.favorites.findIndex(item => item.id == id);
    const updatedFavorites = [...this.data.favorites];
    const isFavorite = !updatedFavorites[index].isFavorite;

    if (isFavorite) {
      wx.setStorageSync(`fav_${id}`, updatedFavorites[index]); // 保存完整文章信息
    } else {
      wx.removeStorageSync(`fav_${id}`); // 移除收藏
    }

    updatedFavorites[index].isFavorite = isFavorite;
    this.setData({ favorites: updatedFavorites });

    wx.showToast({ title: isFavorite ? '收藏成功' : '取消收藏' });
  },
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase(); // 获取输入的关键字并转换为小写
    this.setData({ searchKeyword: keyword }); // 更新搜索关键字

    // 过滤收藏列表
    const filteredFavorites = this.data.favorites.filter(item => 
      item.title.toLowerCase().includes(keyword) || 
      item.summary.toLowerCase().includes(keyword)
    );
    this.setData({ favorites: filteredFavorites });
  }
});