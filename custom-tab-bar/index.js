// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
     isAdmin: false,
    maskState: false,
    list: [
      {
      path: "/pages/index/index",
      icon: "home",
      selectedIcon: "home-fill",
    },
    //  {
    //   path: "/shop/index/index",
    //   icon: "pet",
    //   selectedIcon: "pet-fill",
    // },
    {
      icon: "plus",
      isPublishBtn: true
    },
    // {
    //   path: "/pages/cart/cart",
    //   icon: "shopping-cart",
    //   selectedIcon: "shopping-cart-fill",
    // },
    {
      path: "/pages/mypage/mypage",
      icon: "user",
      selectedIcon: "user-fill",
    }
    ]
  },
  lifetimes: {
    attached() {
      this.checkAdminStatus()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    async checkAdminStatus() {
      const userId = getApp().globalData.userId;

// 获取基础信息
if(userId)
wx.request({
    url: `http://118.178.92.183/api.php?action=getUsers&id=${userId}`,
    success: (res) => {
      this.setData({ isAdmin: res.data.role === 1 })
    }
});
    },

    // 新增上传事件
    onUploadPet() {
      this.closeMask();
      wx.navigateTo({
        url: "/pages/publish/pet-upload/index"
      });
    },


    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const el = this.data.list[index]
      const url = el.path
      if (el.isPublishBtn) {
        this.setData({
          maskState: true
        })
        this.setData({
          maskAnt: "show"
        })
      } else {
        wx.switchTab({url})
      }
    },
    onPublishDynamic() {
      this.closeMask();
      wx.navigateTo({
          url: "/pages/publish/dynamic/index"  // 请确认实际页面路径
      });
  },

  onPublishHelp() {
      this.closeMask();
      wx.navigateTo({
          url: "/pages/publish/help/index"  // 请确认实际页面路径
      });
  },

  closeMask() {
      // 保持原有逻辑不变
      this.setData({
          maskAnt: ""
      });
      setTimeout(() => {
          this.setData({
              maskState: false
          });
      }, 200);
  }
  }
})