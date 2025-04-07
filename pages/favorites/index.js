/* 页面数据容器 */
// pages/favorites/index.js
Page({
  data: {
    favorites: [] ,// 收藏列表数据源
    filteredFavorites: [], // 过滤后的收藏列表
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
    this.setData({ 
      favorites, 
      filteredFavorites: favorites 
    });// 初始化列表数据
  },
  goToDetail(e) {
    const id = e.currentTarget.dataset.id; // 获取文章ID
    wx.navigateTo({ url: `/pages/knowledge/detail?id=${id}` }); // 跳转详情页
  },
  onInput(e) {
    const keyword = e.detail.value.toLowerCase();
    this.setData({ searchKeyword: keyword });
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
  onSearchIconTap() {
    const { searchKeyword, favorites } = this.data;
    if (!searchKeyword) {
      this.setData({ filteredFavorites: favorites }); // 如果关键字为空，显示所有收藏
      return;
    }
    // 根据关键字过滤收藏列表
    const filtered = favorites.filter(item =>
      item.title.toLowerCase().includes(searchKeyword) ||
      item.summary.toLowerCase().includes(searchKeyword)
    );
    this.setData({ filteredFavorites: filtered }); // 更新过滤后的列表
  }
  

});