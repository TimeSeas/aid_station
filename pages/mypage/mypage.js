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


  
   onRefresh() {
    this.setData({
      refreshState: true,
    })
    console.log("topic onRefresh")
    setTimeout(() => {
      if (this.data.refreshState) {
        console.log("topic refreshing")
        this.data.list = []
        canLoading = true
        loadPages = 1
        // let data = this._getDemoData()
        // this._loadList(data)
      }
    }, 1000)
  },
  /**
   * 刷新停止处理
   */
  abortRefresh() {
    console.log("topic abortRefresh")
    if (this.data.refreshState) {
      this.setData({
        refreshState: false,
      })
    }
  },
  /**
   * 加载更多处理
   */
  onLoadMore() {
    console.log("topic loadmore")
    if (canLoading) {
      this.setData({
        loadState: "loading",
      })
      setTimeout(() => {
        // let data = this._getDemoData()
        loadPages++
        // this._loadList(data)
      }, 1000)
    }
  },
  _loadList(data) {
    console.log("topic loadlist")
    if (loadPages > 3 || data.length == 0) {
      console.log("topic finishloading")
      canLoading = false
    }
    this.setData({
      list: this.data.list.concat(data),refreshState: false,
      loadState: "finish"
    })
  },
})