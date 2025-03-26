const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({
  data: {
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    userInfo: {
    },
    stats: {
      followers: 0,
      posts: 0,
      following: 0
    }
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    const authData = wx.getStorageSync('authData');
    
  if (authData && this.checkAuthValid(authData)) {
    // 自动登录流程
    this.autoLogin(authData);
  }
  },
  
  // 验证缓存有效性（示例）
  checkAuthValid(authData) {
    return Date.now() - authData.lastLogin < 7 * 86400 * 1000;
  },
  async autoLogin(authData) {
    try {
      // 检查微信会话是否有效      
        // 更新全局状态
        getApp().globalData.userId = authData.userId;
        this.setData({ hasUserInfo: true });
        // 静默更新用户数据
        console.log('准备进入自动更新用户数据')
        await this.loadUserData();
    } catch (e) {
      console.error('自动登录失败', e);
    }
  },
  handleLogin() {
    this.getWechatUserInfo()
      .then(userInfo => this.processLogin(userInfo))
      .catch(err => console.error('登录失败', err))
  },

  // 获取用户信息（必须由点击直接触发）
  getWechatUserInfo() {
    
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: ({ userInfo }) => resolve(userInfo),
        
        fail: reject
      })
     
    })
  },

  // 处理登录流程
  async processLogin(userInfo) {
    try {
      
      const { code } = await wx.login();
      
      // 将请求包装成Promise
      const loginResult = await new Promise((resolve, reject) => {

        console.log('+++++++',userInfo)
        wx.request({
          url: 'http://118.178.92.183/api.php?action=wechatLogin',
          method: 'POST',
          data: { code, nickname: userInfo.nickName, avatarUrl: userInfo.avatarUrl },
          success: (res) => res.statusCode === 200 ? resolve(res) : reject(res),
          fail: reject
        });
      });
  
      // 同步更新全局状态
      getApp().globalData.userId = loginResult.data.userId;
      
      // 保存数据到缓存
      wx.setStorageSync('authData', {
        userId: loginResult.data.userId,
        lastLogin: Date.now()
      });
  
      // 等待数据加载
      await this.loadUserData();
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  // 更新用户资料
  updateUserProfile: function(userInfo) {
    this.setData({
      hasUserInfo: true,
      userInfo: {
        ...this.data.userInfo,
        avatarUrl: userInfo.avatarUrl,
        nickname: userInfo.nickName
      }
    })
  },

  // 加载用户数据
  loadUserData: async function() {
    try {
      console.log('正在加载用户数据')
      const userId = getApp().globalData.userId;
      if (!userId) throw new Error('未获取用户ID');
        wx.request({
          url: 'http://118.178.92.183/api.php?action=getUsers',
          method: 'GET',
          data: {id: getApp().globalData.userId},
          success: (res) => {
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
            console.log('用户数据请求成功1')
          }
        }),
        wx.request({
          url: 'http://118.178.92.183/api.php?action=getUserStats',
          method: 'GET',
          data: {
            user_id: userId // 参数名需与后端接口定义一致
          },
          header: {
            'Content-Type': 'application/json',
          },
          success: (res) => {
            if (res.statusCode === 200) {
              this.setData({       
                stats: {
                followers: res.data.followers,
                posts: res.data.post_count,
                following: res.data.following,
              }
             });
              console.log('用户数据请求成功2')
            } else {
              console.error('接口异常:', res.data);
              wx.showToast({ title: '数据加载失败', icon: 'none' });
            }
          },
          fail: (err) => {
            console.error('网络请求失败:', err);
            wx.showToast({ title: '网络异常，请重试', icon: 'none' });
          }
        })
      

    } catch (error) {
      console.error('数据加载失败', error)
    }
  },

  // 头像上传
  onChooseAvatar: async function(e) {
    const userId = getApp().globalData.userId;
    if (!userId) return;
    
    wx.uploadFile({
      url: 'http://118.178.92.183/api.php?action=uploadAvatar',
      filePath: e.detail.avatarUrl,
      name: 'avatar',
      formData: {userId},
      success: (res) => {
        const data = JSON.parse(res.data);
        this.setData({'userInfo.avatarUrl': data.url});
        // 更新服务器记录
        wx.request({
          url: 'http://118.178.92.183/api.php?action=updateAvatar',
          method: 'POST',
          data: {userId, avatarUrl: data.url}
        });
      }
    });
  },

  // 页面显示处理
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 2 })
    }
    this.checkLoginStatus()
    if (this.data.isLogin) this.loadUserData()
  },

  // 检查登录状态
  checkLoginStatus() {
    const hasLogin = !!getApp().globalData.userId
    this.setData({ hasUserInfo: hasLogin })
    if (!hasLogin) {
      this.setData({
        userInfo: {
          avatarUrl: DEFAULT_AVATAR,
          nickname: '未登录',
        },
        stats: { followers: 0, posts: 0, following: 0 }
      })
    }
  },

  // 跳转收藏
  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/index' })
  }
})