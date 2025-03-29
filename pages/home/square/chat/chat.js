Page({
  data: {
    messages: [], // 聊天消息列表
    inputValue: '', // 输入框的值
    username: 'kelly境外代购' // 示例用户名
  },
onshow(){
  wx.request({
    url: 'http://118.178.92.183/api.php?action=getUsers',
    method: 'GET',
    data: {id: getApp().globalData.userId},
    success: (res) => {
      console.log('从数据库读取完整数据成功【1/2】')
      this.setData({
        hasUserInfo:true,
        userInfo: {
          avatarUrl: res.data.avatar,
          nickname: res.data.nickname
        },
      })
      if(res.data.user_type === 1){
        getApp().globalData.isAdmin=true;//更新管理员身份
      }
    },
    fail: (err) => {
      console.error('getUsers网络请求失败:', err);
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  })
},
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  sendMessage() {
    const { inputValue, messages } = this.data;
    if (!inputValue.trim()) {
      wx.showToast({ title: '请输入消息', icon: 'none' });
      return;
    }
    this.setData({
      messages: [...messages, { content: inputValue, isUser: true }],
      inputValue: ''
    });
    this.scrollToBottom();
  },

  scrollToBottom() {
    wx.createSelectorQuery().select('.chat-messages').boundingClientRect(rect => {
      if (rect) {
        wx.pageScrollTo({
          scrollTop: rect.height,
          duration: 300
        });
      }
    }).exec();
  }
});