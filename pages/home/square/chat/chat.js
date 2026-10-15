const client = require('../../../../utils/request')
Page({
  data: { messages: [], inputValue: '', userInfo: {}, recipientInfo: {}, sending: false },
  onLoad(options) { this.setData({ currentUserId: getApp().globalData.userId, recipientId: Number(options.masterid) }); this.loadUsers() },
  onShow() {
    if (!getApp().requireLogin()) return
    this.loadHistory()
    this.timer = setInterval(() => this.loadHistory(), 3000)
  },
  onHide() { clearInterval(this.timer) },
  onUnload() { clearInterval(this.timer) },
  loadUsers() {
    for (const [id, field] of [[this.data.currentUserId, 'userInfo'], [this.data.recipientId, 'recipientInfo']]) {
      client.request({ url: '/api.php?action=getUsers', data: { id }, success: res => {
        if (res.statusCode === 200) this.setData({ [field]: { avatarUrl: res.data.avatar, nickname: res.data.nickname } })
      } })
    }
  },
  async loadHistory() {
    if (this.loading || !this.data.recipientId) return
    this.loading = true
    try {
      const result = await client.call('chatHistory', { receiver_id: this.data.recipientId })
      this.setData({ messages: result.data.map(item => ({ ...item, isUser: item.sender_id === this.data.currentUserId,
        avatarUrl: item.sender_id === this.data.currentUserId ? this.data.userInfo.avatarUrl : this.data.recipientInfo.avatarUrl })), scrollTarget: `msg-${result.data.length - 1}` })
      await client.call('chatRead', { partner_id: this.data.recipientId }, 'POST')
    } catch (error) { if (!this.shownError) wx.showToast({ title: error.message, icon: 'none' }); this.shownError = true }
    finally { this.loading = false }
  },
  onInput(e) { this.setData({ inputValue: e.detail.value }) },
  async SendMessage() {
    if (this.data.sending || !getApp().requireLogin()) return
    if (!this.data.inputValue.trim()) return
    this.setData({ sending: true })
    try {
      await client.call('chatSend', { receiver_id: this.data.recipientId, content: this.data.inputValue }, 'POST')
      this.setData({ inputValue: '' }); await this.loadHistory()
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }) }
    finally { this.setData({ sending: false }) }
  }
})
