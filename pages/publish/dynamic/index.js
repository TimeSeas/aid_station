Page({
  data: {
    newContent: '',
    currentUserId: 1, // 实际应从登录状态获取
    isInputEmpty: true
  },

  // 输入内容处理
  onContentInput(e) {
    const content = e.detail.value.trim()
    this.setData({
      newContent: e.detail.value,
      isInputEmpty: content.length === 0
    })
  },

  // 发布处理
  handlePublish() {
    if (this.data.isInputEmpty) return

    const { newContent, currentUserId } = this.data
    wx.showLoading({
      title: '发布中...',
      mask: true
    })

    wx.request({
      method: 'POST',
      url: 'http://10.225.71.177:3000/post',
      data: {
        content: newContent,
        user_id: currentUserId
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200) {
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 1500,
            complete: () => {
              wx.navigateBack()
            }
          })
        } else {
          this.showError('发布失败')
        }
      },
      fail: () => {
        wx.hideLoading()
        this.showError('网络错误')
      }
    })
  },

  showError(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  }
})