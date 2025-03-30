// index.js
Page({
  data: {
    currentIndex: 0,
    tabs: ['广场', '论坛', '科普'],
    swiperList: [
      { image: '/images/animals/dog1.jpg' },
      { image: '/images/animals/dog2.jpg' },
      { image: '/images/animals/dog3.jpg' }
    ],
    posts: [],          // 帖子列表数据
  },

  onLoad() {
    wx.request({
      url: 'http://118.178.92.183/api.php?action=getpost',
      method: 'GET',
      success: (res) => {
        console.log('获取动态信息成功',res.data.data); // 控制台打印数据
        this.setData({ posts: res.data });
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    })
  },

// 跳转到详情页
toPostDetail(e) {
  const postId = e.currentTarget.dataset.id; // 确保这里能获取到id
  if (!postId) {
    wx.showToast({ title: '数据加载中...', icon: 'none' });
    return;
  }
  console.log('跳转postID:', postId); 
  wx.navigateTo({
    url: `/pages/publish/post-detail/index?id=${postId}`  // 注意使用反引号
  });
},
// // 点赞处理
// handleLike(e) {
//   this.updateInteraction(e, 'like');
// },

// // 差评处理
// handleDislike(e) {
//   this.updateInteraction(e, 'dislike');
// },

// 通用交互更新方法
// updateInteraction(e, type) {
//   const { id, type: targetType } = e.currentTarget.dataset;
//   wx.request({
//     url: 'http://118.178.92.183/api.php',
//     method: 'POST',
//     data: {
//       action: type,
//       targetId: id,
//       targetType: targetType // 可以是post或comment
//     },
//     success: (res) => {
//       const posts = this.data.posts.map(post => {
//         if (post._id === id) {
//           return { ...post, [type+'s']: res.data.newCount };
//         }
//         return post;
//       });
//       this.setData({ posts });
//     }
//   })
// },
  // 切换选项卡
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentIndex: index })
  },

  // 滑动切换
  swiperChange(e) {
    const current = e.detail.current
    this.setData({ currentIndex: current })
  },

  // 点击跳转
  onpost(){
  //   wx.navigateTo({
  //     url: "/pages/home/post/post"  // 请确认实际页面路径
  // });
  sendMessage(1, 2, '你好，想领养这只猫咪');//发送者id，接受者id，聊天内容
  },
  onsquare_pet(){
    wx.navigateTo({
      url: "/pages/home/square/pet/pet"  // 请确认实际页面路径
  });
  },
  onkepu(){
    wx.navigateTo({
      url: "/pages/knowledge/index"  // 请确认实际页面路径
  });
  },
  onjiu(){
    wx.navigateTo({
      url: "/pages/knowledge/jiuzhu"  // 请确认实际页面路径
  });
},
  onling(){
    wx.navigateTo({
      url: "/pages/knowledge/lingyang"  // 请确认实际页面路径
  });
}
})

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