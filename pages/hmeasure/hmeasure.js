// pages/hmeasure/hmeasure.js
var WxNotificationCenter = require('../../notification/WxNotificationCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    BLEvisible:false,
    height_num:"-",
    chast_num:"-",
    waist_num:"-",
    butt_num:"-",
    heightState: false,
    chastState : false,
    waistState : false,
    buttState : false,
    Name:"-",
    deviceID:[],
  },
  drawLine:function(x0,y0,x1,y1,x2,y2){
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.moveTo(x0,y0)
    ctx.lineTo(x1,y1)
    ctx.lineTo(x2,y2)
    ctx.stroke()
    ctx.draw()
},
//弹出提示框
openBLE:function(){
wx.showModal({
  title: '提示',
  content: '请确定已经开启蓝牙及GPS服务！',
  showCancel:false,
  success (res) {
    if (res.confirm) {
      console.log('用户点击确定')
      wx.navigateTo({
        url: '/pages/bluetooth/bluetooth',
      })
    } 
  }
})
},
//提示框函数
handleClose:function () {
    this.setData({
        BLEvisible: false
    });
    wx.navigateTo({
      url: '/pages/bluetooth/bluetooth',
    })
},
handleClose1:function () {
  this.setData({
      BLEvisible: false
  });
},
  //展示身高
  showheight:function(){
      console.log('测量身高')
      this.setData({
        heightState: true
      })
 
   
     // this.drawLine(80,340,50,200,50,100)
  },
  //展示胸围
  showchast:function(){
    console.log('测量胸围')
    this.setData({
    chastState : true
    })
  },
  //展示腰围
  showwaist:function(){
    console.log('测量腰围')
    this.setData({
      waistState : true
    })
  },
  //展示臀围
  showbutt:function(){
    console.log('测量臀围')
    this.setData({
    buttState : true
    })
  },
  turntoMine:function(){
    wx.navigateTo({
      url: '/pages/chart/chart',
    })
  },
  turnoffble:function(){
    wx.showModal({
      content: '是否断开蓝牙连接?',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } 
      }
    })
  },
  //绘制线条
  didNotification:function(info){
        this.setData({
          height_num:info,
          chast_num : info,
          waist_num :info,
          butt_num :info ,
        })
  },
  /*resUserName:function(info){
    this.setData({
      Name:info
    })
  },*/
  /**
   * 生命周期函数--监听页面加载
   */
  BLEDeviceID:function(info){
      this.setData({
        deviceID:info
      })
  },
  onLoad: function (options) {
    var that = this 
 
    WxNotificationCenter.addNotification('NotificationName', that.didNotification, that)
  
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    let userName = wx.getStorageSync('userName')
    var str = '-'
           if(userName && userName.length!=0){
           that.setData({
             Name:userName
           })
        }else{
          that.setData({
            Name:str
          })
          wx.showModal({
            title: '提示',
            content: '请完成个人信息',
            showCancel:false,
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateTo({
                  url: '/pages/chart/chart',
                })
              } 
            }
          })
        }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this
    WxNotificationCenter.removeNotification('NotificationName', that)

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})