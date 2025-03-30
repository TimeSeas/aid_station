Page({
  data: {
    messages: [],
    inputValue: '',
    userInfo: { avatarUrl: '', nickname: '' },
    recipientInfo: { avatarUrl: '', nickname: '' },
    currentUserId: getApp().globalData.userId,
    recipientId: null,
    unreadCount: 0,
    pollingInterval: null // 新增：用于存储定时器的变量
  },

  onLoad(options) {
    console.log(options);
    const recipientId = options.masterid;

    this.setData({
      recipientId: recipientId
    });
    

    // 加载当前用户信息
    this.getUserInfo(this.data.currentUserId, 'userInfo');

    // 加载对方用户信息
    this.getUserInfo(recipientId, 'recipientInfo');

    // 加载历史消息
    this.loadHistory();

    // 新增：启动定时轮询，实时更新消息
    this.startPolling();
  },

  onUnload() {
    // 新增：页面卸载时清除定时器
    if (this.data.pollingInterval) {
      clearInterval(this.data.pollingInterval);
    }
  },

  getUserInfo(userId, targetField) {
    wx.request({
      url: 'http://118.178.92.183/api.php?action=getUsers',
      method: 'GET',
      data: { id: userId },
      success: (res) => {
        console.log('从数据库读取完整数据成功', targetField);
        const userData = {
          avatarUrl: res.data.avatar || '/images/default-avatar.png', // 默认头像路径
          nickname: res.data.nickname || '匿名用户'
        };
        
        // 动态更新目标字段
        this.setData({
          [targetField]: userData
        });
      },
      fail: (err) => {
        console.error('getUsers网络请求失败:', err);
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      }
    });
  },

  loadHistory() {
    const { currentUserId, recipientId } = this.data;
    wx.request({
      url: 'http://118.178.92.183/chat/chat_history.php',
      method: 'GET',
      data: {
        sender_id: currentUserId,
        receiver_id: recipientId
      },
      success: (res) => {
        if (res.data.code === 200) {
          const messages = res.data.data.map(item => ({
            content: item.content,
            isUser: item.sender_id == currentUserId,
            avatarUrl: item.sender_id == currentUserId ? this.data.userInfo.avatarUrl : this.data.recipientInfo.avatarUrl,
            status: item.status
          }));
          this.setData({ messages });
          this.scrollToBottom();
        } else {
          console.error('加载历史消息失败:', res.data.msg);
        }
      },
      fail: (err) => {
        console.error('网络错误:', err);
      }
    });
  },

  /**
   * 发送消息
   */
  SendMessage() {
    const { inputValue, currentUserId, recipientId, messages } = this.data;
    if (!inputValue.trim()) {
      wx.showToast({ title: '请输入消息', icon: 'none' });
      return;
    }
    sendMessage(currentUserId, recipientId, inputValue);//发送者id，接受者id，聊天内容
    const newMessage = {
      content: inputValue,
      isUser: true,
      avatarUrl: this.data.userInfo.avatarUrl,
      status: 'sending' // 标记为发送中
    };
    this.setData({
      messages: [...messages, newMessage], // 将新消息追加到消息列表
      inputValue: '' // 清空输入框
    });
    this.scrollToBottom();
  },

  

  /**
   * 标记消息已读
   */
  markMessagesRead() {
    const { currentUserId, recipientId } = this.data;
    wx.request({
      url: 'http://118.178.92.183/chat/chat_read.php',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        user_id: currentUserId,
        partner_id: recipientId
      },
      success: (res) => {
        if (res.data.code === 200) {
          console.log(`已读${res.data.read_count}条消息`);
          this.setData({ unreadCount: 0 });
        }
      },
      fail: (err) => {
        console.error('网络错误:', err);
      }
    });
  },

  /**
   * 输入框事件
   */
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    wx.createSelectorQuery()
      .select('.chat-messages')
      .boundingClientRect((rect) => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.height,
            duration: 300
          });
        }
      })
      .exec();
  },
  /**
   * 新增：启动定时轮询
   */
  startPolling() {
    const interval = setInterval(() => {
      this.loadHistory(); // 定时加载最新消息
    }, 3000); // 每3秒轮询一次
    this.setData({ pollingInterval: interval });
  }
});

function sendMessage(senderId, receiverId, content) {
  wx.request({
    url: 'http://118.178.92.183/chat/chat_send.php',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      msg_type: 1 // 文本类型
    },
    success(res) {
      if (res.data.code === 200) {
        console.log('消息发送成功，ID:', res.data.data.msg_id);
      } else {
        console.error('发送失败:', res.data.msg);
      }
    },
    fail(err) {
      console.error('网络错误:', err);
    }
  });
}

