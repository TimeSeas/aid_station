Page({
  data: {
    posts: [],
    newContent: '',
    currentUserId: 1 // 实际应从登录状态获取
  },
  onLoad() {
    //我们写一个调用数据库函数，使得本页面加载时调用此函数，查找 youqi.data 里的所有条目。
        wx.request({
            method: 'GET',//这里要和 server.js 定义的 post or get 一致！！！
            url: 'http://10.225.71.177:3000/getUser',//这里的 ip 地址不是数据库的地址，而是你的电脑本地的地址，因为这一步的操作是要找到本地 nodejs 服务器。getUser 要和 server.js 中定义的方法名一致。
            data: {
              //这里面是传入参数。比如我们要 select * from data where openid= 给定的 openid，就可以从这里传入
            },
            success: (res) => {//成功获取到值，返回一个 res 对象。如果不知道 res 对象里面包含什么，可以先输出 res 对象看一下其中都包含什么
              if (res.statusCode === 200) {
                this.setData({ posts: res.data });
              }
              console.log(res.data);
            },
            fail: function () {//没有获取到值，说明这中间出问题了。
              console.log("获取失败");
            }
          })
    },

}

);