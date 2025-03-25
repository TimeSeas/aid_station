Page({
  data:{
    users:''
  },
  onLoad() {
    wx.request({
      url: 'http://118.178.92.183/api.php?action=getpost',
      method: 'GET',
      success: (res) => {
        console.log('获取动态信息成功',res); // 控制台打印数据
        this.setData({ users: res.data });
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    })
  }
})