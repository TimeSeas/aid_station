const client = require('../../utils/request')
Page({
  data: { conversations: [], error: '' },
  onShow() { this.load() },
  async load() {
    if (!getApp().requireLogin()) return
    try { const result = await client.call('chatConversations'); this.setData({ conversations: result.data, error: '' }) }
    catch (error) { this.setData({ error: error.message }) }
  },
  openChat(e) { wx.navigateTo({ url: `/pages/home/square/chat/chat?masterid=${e.currentTarget.dataset.id}` }) }
})
