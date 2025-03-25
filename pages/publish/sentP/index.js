Page({
  data: {
    title: '',        // 帖子标题
    content: ''       // 帖子内容
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  // 输入内容
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  // 提交帖子
  async submitPost() {
    const { title, content } = this.data
    if (!title.trim() || !content.trim()) {
      wx.showToast({ title: '内容不能为空', icon: 'none' })
      return
    }

    try {
      // 获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于发帖身份标识'
      })

      // 调用云函数创建帖子
      await wx.cloud.callFunction({
        name: 'createPost',
        data: {
          title,
          content,
          author: userInfo.openId,
          avatar: userInfo.avatarUrl,
          nickname: userInfo.nickName
        }
      })

      wx.showToast({ title: '发布成功' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      console.error(err)
      wx.showToast({ title: '发布失败', icon: 'none' })
    }
  }
})