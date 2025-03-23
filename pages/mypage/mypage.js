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
        console.log('更新用户数据成功')
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
      console.log('[1/4] 开始登录流程')
    const { code } = await wx.login()
    console.log('[2/4] 获取 code 成功:', code) // 确保 code 存在
    console.log('[3/4] 调用登录接口: 发送 code 和用户信息')
    getApp().globalData._userIdPromise = new Promise(resolve => {
      wx.request({
      url: 'http://118.178.92.183/api.php?action=wechatLogin',
      method: 'POST',
      header: {'Content-Type': 'application/json'},
      data: {
        code: code, // 从wx.login获取
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      },
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('[4/4] 登录接口响应:', res) // 检查响应结构
              // 更新全局状态
      getApp().globalData.userId = res.data.userId;
      if(res.data.user_type === 1){
        getApp().globalData.isAdmin=true;//更新管理员身份
      }
      
      // console.log( res.data.userId)
      this.setData({
        hasUserInfo: true,
        userInfo: {
          avatarUrl: userInfo.avatarUrl,
          nickname: userInfo.nickName
        }
      }) 
      // 保存关键数据到缓存（有效期建议7天）
  wx.setStorageSync('authData', {
    userId: res.data.userId,
    lastLogin: Date.now(),
  });        
      // 保存用户基本信息到缓存
      wx.setStorageSync('userProfile', {
        avatarUrl: userInfo.avatarUrl,
        nickname: userInfo.nickName
      });
      console.log('缓存成功')
        } else {
          wx.showToast({title: '登录失败:' + res.data.msg});
        }
      },
      fail: (err) => console.error('网络错误:', err)
    })
  });
    // 加载用户数据
    await this.loadUserData();
    } catch (error) {
      console.error('完整错误信息:', error) // 输出完整错误对象
      wx.showToast({ title: '登录失败', icon: 'none' })
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
      console.log('进入加载用户数据')
      const userId = getApp().globalData.userId;
      if (!userId) throw new Error('未获取用户ID');
        wx.request({
          url: 'http://118.178.92.183/api.php?action=getUsers',
          method: 'GET',
          data: {id: getApp().globalData.userId},
          success: (res) => {
            this.setData({
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