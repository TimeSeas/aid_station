// pages/mypage/mypage.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
var canLoading = true
var loadPages = 1
Page({

  /**
   * 页面的初始数据
   */
  // pages/mypage/mypage.js
  goToFavorites() {
  wx.navigateTo({ url: '/pages/favorites/index' });
  },
  
  data: {
    isLogin: false,
    userInfo: {},
    avatarUrl: defaultAvatarUrl,
    username:'默认用户',
    userfollower:0,
    userfeed:0,
    userfollow:0,

    list: [],
    refreshState: false,
    loadState: "finish",
    active: 0,
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      isLogin: true,
      avatarUrl,
    })
  },
  onShow: function () {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({ active: 2 })
    }
  },
  changeNavTab(e) {
    let index
    if (e.detail.source == "touch") {
      index = e.detail.current;
    } else if (e.currentTarget.dataset.index != null) {
      index = e.currentTarget.dataset.index
    }
    if (index != null && index != this.data.active) {
      console.log("change navBar tab")
      this.setData({
        active: index,
        pos: this.data.list[index].pos,
      })
    }
  },
})