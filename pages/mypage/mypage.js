const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({
  data: {
    hasUserInfo: false,
    myPets: [], // 我的宠物列表
    swiperCurrent: 0,
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    stats: {
      followers: 0,
      posts: 0,
      following: 0
    },
    userId:null
  },
    // 页面显示处理
    onShow() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ active: 2 })
      }
      
      // 每次页面显示时刷新数据
      if (getApp().globalData.userId) {
        
        this.loadUserData(true) // 添加强制刷新参数
        console.log('强制刷新成功')
        this.setData({
          userId:getApp().globalData.userId
        })
      }

    },
  onLoad() {
    const authData = wx.getStorageSync('authData');
  if (authData && this.checkAuthValid(authData)) {
    // 自动登录流程
    this.autoLogin(authData);
  }
  },
  bindViewTap() {
    wx.navigateTo({
      url: '/pages/myhome/login/login'
    })
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
        this.setData({
           avatarUrl:authData.avatarUrl,
           nickName:authData.nickName
           });
        // 静默更新用户数据
        console.log('加载用户数据缓存成功')
        await this.loadUserData();
    } catch (e) {
      console.error('自动登录失败', e);
    }
  },
  handleLogin() {
    this.processLogin()
  },
  // 处理登录流程
  async processLogin() {
    try {
      
      const { code } = await wx.login();
      // 将请求包装成Promise
      const loginResult = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://118.178.92.183/api.php?action=wechatLogin',
          method: 'POST',
          data: { code, nickname:'你好守护者，点击完善个人信息', avatarUrl:defaultAvatarUrl },
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

  // 加载用户数据
  loadUserData: async function() {
    try {
        wx.request({
          url: 'http://118.178.92.183/api.php?action=getUsers',
          method: 'GET',
          data: {id: getApp().globalData.userId},
          success: (res) => {
            console.log('从数据库读取完整数据成功【1/2】')
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
          },
          fail: (err) => {
            console.error('getUsers网络请求失败:', err);
            wx.showToast({ title: '网络异常，请重试', icon: 'none' });
          }
        }),
        wx.request({
          url: 'http://118.178.92.183/api.php?action=getUserStats',
          method: 'GET',
          data: {
            user_id: getApp().globalData.userId // 参数名需与后端接口定义一致
          },
          header: {
            'Content-Type': 'application/json',
          },
          success: (res) => {
            if (res.statusCode === 200) {
              console.log('从数据库读取完整数据成功【2/2】')
              this.setData({       
                stats: {
                followers: res.data.followers,
                posts: res.data.post_count,
                following: res.data.following,
              }
             });
            } else {
              console.error('接口异常:', res.data);
              wx.showToast({ title: '数据加载失败【2】', icon: 'none' });
            }
          },
          fail: (err) => {
            console.error('getUserStats网络请求失败:', err);
            wx.showToast({ title: '网络异常，请重试', icon: 'none' });
          }
        })
    } catch (error) {
      console.error('数据加载失败', error)
    }
    this.loadMyPets();
  },
    // 加载我的宠物
    loadMyPets() {
      const userId = getApp().globalData.userId;
      wx.showLoading({ title: '加载宠物信息中' });
      
      wx.request({
        url: 'http://118.178.92.183/api.php?action=getUserPets',
        data: {
          user_id: userId,
          page: 1
        },
        success: res => {
          if (res.data.code === 0) {
            this.setData({
              myPets: res.data.data.map(pet => ({
                ...pet,
                cover: pet.cover || '/images/default-pet.png'
              }))
            });
          }
        },
        complete: () => wx.hideLoading()
      });
    },
  
    // 轮播图切换
    swiperChange(e) {
      this.setData({
        swiperCurrent: e.detail.current
      });
    },
  // 跳转收藏
  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/index' })
  }
})