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
        coverImage: 'https://ts1.tc.mm.bing.net/th/id/R-C.3596ee937c0af4dccc4b5812ba2af24d?rik=gKNxx6RbbfsfvQ&riu=http%3a%2f%2f5b0988e595225.cdn.sohucs.com%2fimages%2f20191225%2ff4213d0a4b8e4d3cbb658b2d3d3e0133.jpeg&ehk=FgpSDhk%2fMmG3hkJoVYOXKivHDrnBSA2dcRe0FmhpZ8Y%3d&risl=&pid=ImgRaw&r=0',
        category: 1
      },
    
      // {
      //   id: 2,
      //   title: '科学救助五步法',
      //   summary: '遇到流浪狗应该如何正确处理...',
      //   coverImage: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.9Q0s9V3ahtEena31HkNJygHaFj?rs=1&pid=ImgDetMain',
      //   category: 2
      // },
      // {
      //   id: 3,
      //   title: '从选择品种到迎接新家',
      //   summary: '详细介绍领养狗狗的全流程，从品种选择到新家布置...',
      //   coverImage: 'https://n.sinaimg.cn/sinakd10109/217/w640h377/20220610/3802-597843381edffa1507b21138861338c1.png',
      //   category: 3
      // },
      {
        id: 4,
        title: '被遗弃的流浪狗',
        summary: '流浪狗数量增长的原因...',
        coverImage: 'https://img95.699pic.com/photo/60046/7415.jpg_wh860.jpg',
        category: 1
      },
      // {
      //   id: 5,
      //   title: '救狗秘籍：三招搞定',
      //   summary: '介绍快速救助流浪狗的三个实用技巧...',
      //   coverImage: 'https://ts1.tc.mm.bing.net/th/id/R-C.b0a2a63d01c729048fac87312391569a?rik=7XwL43QTpKj3Pw&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd10100%2f217%2fw640h377%2f20210119%2f21fc-khxeamv3267553.png&ehk=ibx1%2b8TINWazuEKThbvAAOy9YK3KvgQS2vHZDGXFctc%3d&risl=&pid=ImgRaw&r=0',
      //   category: 2
      // },
      // {
      //   id: 6,
      //   title: '领养秘籍：新手必读',
      //   summary: '为初次领养的小伙伴提供实用的领养知识...',
      //   coverImage: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.9u158YWlGO6geegZLLnzcAHaE8?rs=1&pid=ImgDetMain',
      //   category: 3
      // },
      {
        id: 7,
        title: '流浪狗的社会影响',
        summary: '对公共安全和健康带来的潜在威胁...',
        coverImage: 'https://k.sinaimg.cn/n/sinakd10109/217/w640h377/20220610/2208-044f13098f8830399f75a02bfaa2e4f8.png/w700d1q75cms.jpg?by=cms_fixed_width',
        category: 1
      }
      // {
      //   id: 8,
      //   title: '流浪狗救助宝典',
      //   summary: '提供全面的流浪狗救助知识，从捕捉到安置...',
      //   coverImage: 'https://img95.699pic.com/photo/60037/5780.jpg_wh300.jpg!/fh/300/quality/90',
      //   category: 2
      // },
      // {
      //   id: 9,
      //   title: '领养指南：一文读懂',
      //   summary: '全面介绍领养狗狗的要点...',
      //   coverImage: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.6nlIqdeHR3gdaj6-NvHTdAHaE7?w=278&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7',
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