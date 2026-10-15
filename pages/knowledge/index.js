// pages/knowledge/index.js
Page({
  data: {
    // 分类数据源
    // categories: [
      
    //   { id: 1, name: '生存现状' }
    // ],
    // activeCategory: 1,// 当前选中分类ID
    articles: [// 原始文章数据（示例）
      {
        id: 1,
        title: '流浪狗的生存挑战',
        summary: '全球约2亿只流浪狗面临哪些生存威胁...',
        coverImage: '/images/animals/dog1.jpg',
        category: 1
      },
    
      // {
      //   id: 2,
      //   title: '科学救助五步法',
      //   summary: '遇到流浪狗应该如何正确处理...',
      //   coverImage: '/images/animals/dog2.jpg',
      //   category: 2
      // },
      // {
      //   id: 3,
      //   title: '从选择品种到迎接新家',
      //   summary: '详细介绍领养狗狗的全流程，从品种选择到新家布置...',
      //   coverImage: '/images/animals/dog3.jpg',
      //   category: 3
      // },
      {
        id: 4,
        title: '被遗弃的流浪狗',
        summary: '流浪狗数量增长的原因...',
        coverImage: '/images/animals/dog1.jpg',
        category: 1
      },
      // {
      //   id: 5,
      //   title: '救狗秘籍：三招搞定',
      //   summary: '介绍快速救助流浪狗的三个实用技巧...',
      //   coverImage: '/images/animals/dog2.jpg',
      //   category: 2
      // },
      // {
      //   id: 6,
      //   title: '领养秘籍：新手必读',
      //   summary: '为初次领养的小伙伴提供实用的领养知识...',
      //   coverImage: '/images/animals/dog3.jpg',
      //   category: 3
      // },
      {
        id: 7,
        title: '流浪狗的社会影响',
        summary: '对公共安全和健康带来的潜在威胁...',
        coverImage: '/images/animals/dog1.jpg',
        category: 1
      }
      // {
      //   id: 8,
      //   title: '流浪狗救助宝典',
      //   summary: '提供全面的流浪狗救助知识，从捕捉到安置...',
      //   coverImage: '/images/animals/dog2.jpg',
      //   category: 2
      // },
      // {
      //   id: 9,
      //   title: '领养指南：一文读懂',
      //   summary: '全面介绍领养狗狗的要点...',
      //   coverImage: '/images/animals/dog3.jpg',
      //   category: 3
      // }
    ],
    filteredArticles: []
  },

  onLoad() {
    this.setData({ filteredArticles: this.data.articles });
  },
  changeCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ activeCategory: categoryId });
    const filtered = categoryId === 0 
      ? this.data.articles 
      : this.data.articles.filter(item => item.category === categoryId);
    this.setData({ filteredArticles: filtered });
  },
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/knowledge/detail?id=${id}` });
  },
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = this.data.articles.filter(item => 
      item.title.toLowerCase().includes(keyword)
    );
    this.setData({ filteredArticles: filtered });
  },
  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const article = this.data.articles.find(item => item.id == id);
    const isFavorite = !wx.getStorageSync(`fav_${id}`);
    if (isFavorite) {
      wx.setStorageSync(`fav_${id}`, article); // 保存完整文章信息
    } else {
      wx.removeStorageSync(`fav_${id}`); // 移除收藏
    }
    wx.showToast({ title: isFavorite ? '收藏成功' : '取消收藏' });
  }
});