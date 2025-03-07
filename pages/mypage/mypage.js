// pages/mypage/mypage.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: {},
    avatarUrl: defaultAvatarUrl,
    assets: [
      { label: '积分', value: '0', icon: 'https://img.icons8.com/?size=512w&id=PXbwT44QxhV4&format=png' },
      { label: '优惠券', value: '2', icon: 'https://img.icons8.com/?size=512w&id=PXbwT44QxhV4&format=png' },
      { label: '余额', value: '¥0.00', icon: 'https://img.icons8.com/?size=512w&id=PXbwT44QxhV4&format=png' }
    ],
    functions: [
      { name: '我的快递', icon: 'https://s1.aigei.com/prevfiles/332a319c73994ee089eae0601884e13c.png?e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:LJVvvMu7tXqVL78gOMHGsnBYxxk=', url: '/pages/express/express'},
      { name: '地址簿', icon: 'https://img.icons8.com/?size=512w&id=PXbwT44QxhV4&format=png', url: '/pages/address/list' },
      { name: '客服中心', icon: 'https://img.icons8.com/?size=512w&id=47806&format=png', url: '/pages/service/index' }
    ],
    expressList: []
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      isLogin: true,
      avatarUrl,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})