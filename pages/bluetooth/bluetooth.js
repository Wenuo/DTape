// pages/bluetooth/bluetooth.js
var util = require('../../utils/util.js');
var WxNotificationCenter = require('../../notification/WxNotificationCenter.js')
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
      info:"",
      list:[],
      connectedDeviceId:"",
      deviceId:"",
      services:"",
      servicesUUID:"0000FFE0-0000-1000-8000-00805F9B34FB",
      serviceId:"",
      notifyCharacteristicsId:"",
      writeCharacteristicsId: "",
      sendmsg:"",

      arr:[],                       //将本地缓存数据拿出保存
      Datatime:[],
  },


  //搜索蓝牙设备
  findBLE:function(){
    var that = this;
         wx.getBluetoothAdapterState({
                  complete: (res) => {},
                  success:function(res){
                    console.log(res);
                    if(!res.available){
                      wx.showModal({
                        title:"请先打开蓝牙",
                        showCancel:false,
                        success (res){
                          console.log("用户点击确定");
                        }
                      })
                    }
                  },
                  fail:function(res){
                    console.log(res);
                    if(res.errCode==10001){
                      wx.onBluetoothAdapterStateChange(function (res) {
                        console.log('onBluetoothAdapterStateChange', res)
                        if (res.available) {
                          this.startBluetoothDevices();
                        }
                      })
                    }
                  }
                })
      console.log('搜索设备')

      this.startBluetoothDevices();
      
      //this.addBLEdevices();
  },
  //开始搜索
  startBluetoothDevices:function(){
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      services: [], //如果填写了此UUID，那么只会搜索出含有这个UUID的设备，建议一开始先不填写或者注释掉这一句
      success: function (res) {
        console.log('搜索设备返回' + JSON.stringify(res))
        wx.getBluetoothDevices({
          success: function (res) {
            that.setData({
              devices: res.devices
            })
            console.log('搜设备数目：' + res.devices.length)
            console.log('设备信息：\n' + JSON.stringify(res.devices)+"\n")
            wx.showLoading({
              title: '正在搜索...',
            })
            setTimeout(function(){
              wx.hideLoading()
            },5000)
          }
        })
      }
    })
  },


 
  //列表点击事件
  creatBLEconnect(e){
    var that = this;
    var myUUID = that.data.servicesUUID; //具有读写、通知属性的UUID
    var notifyServiceId = that.data.servicesUUID;  //具有写、通知属性的服务uuid
    var notifyCharacteristicsId = that.data.notifyCharacteristicsId;
    wx.showLoading({
      title: '正在连接',
    })
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function (res) {
        //wx.hideLoading();
        console.log('调试信息：' + res.errMsg);
        that.setData({
          connectedDeviceId: e.currentTarget.id,
         // info: "MAC地址：" + event.currentTarget.id  + '  调试信息：' + res.errMsg,        
        })
        wx.showToast({
          title: '连接成功',
          image: "/image/success.png",
          duration: 1000,
        })
       //this.WXgetServices()
       //获取蓝牙服务
       wx.getBLEDeviceServices({
        deviceId: that.data.connectedDeviceId,
          //deviceId: 'deviceId',
          success:function (res)  {
            console.log('device services:', JSON.stringify(res.services));
            for (var i = 0; i < res.services.length; i++) {
              console.log("第"+(i+1) + "个UUID:" + res.services[i].uuid+"\n")
                if(res.services[i].isPrimary){
                  //获取蓝牙的特征
                  wx.getBLEDeviceCharacteristics({
                        serviceId:myUUID,
                        deviceId: e.currentTarget.id,
                        success:function(res){
                          //console.log(res)
                          for(var i =0; i<res.characteristics.length;i++){
                            console.log('特征值:'+ res.characteristics[i].uuid)

                            if(res.characteristics[i].properties.notify){
                              console.log("notifyServiceId",myUUID);
                              console.log("notifyCharacteristicsId",res.characteristics[i].uuid);
                              that.setData({
                                notifyServiceId:myUUID,
                                notifyCharacteristicsId:"0000FFE1-0000-1000-8000-00805F9B34FB",  //直接写死

                              })
                            }
                            if(res.characteristics[i].properties.write){
                                 console.log("writeServicweId：", myUUID);
                                 console.log("writeCharacteristicsId：", res.characteristics[i].uuid);
                                 that.setData({
                                 writeServicweId: myUUID,
                                      //writeCharacteristicsId: res.characteristics[i].uuid,
                                writeCharacteristicsId: "0000FFE1-0000-1000-8000-00805F9B34FB",//手动设置writeCharacteristicsId为这个UUID，为了方便写死在这里
                                  })
                            }
                          }
                          console.log('device getBLEDeviceCharacteristics',res.characteristics);
                          //启用特征值变化通知
                          wx.notifyBLECharacteristicValueChange({
                            characteristicId: that.data.notifyCharacteristicsId,
                            deviceId: that.data.connectedDeviceId,
                            serviceId: notifyServiceId,
                            state: true,
                            success:function(res){
                              console.log('notifyBLECharacteristicValueChange success',res.errMsg)
                            },
                            fail:function(){
                              console.log('notifyBLECharacteristicValueChange fail',res.errMsg)
                            },
                            
                          })
                          
                          //接受蓝牙消息
                          wx.onBLECharacteristicValueChange(function(res){
                            console.log("characteristicId：" + res.characteristicId)
                            console.log("serviceId:" + res.serviceId)
                            console.log("deviceId" + res.deviceId)
                            console.log("Length:" + res.value.byteLength)
                            console.log(res.value)
                            console.log("hexvalue:" + ab2hex(res.value))
                            console.log("buf2string:" + buf2string(res.value))
                            //将获取的数据放置数组里
                            var time = util.formatTime(new Date());
                            var Mdata = buf2string(res.value);
                            that.data.arr.push(Mdata);
                            that.data.Datatime.push(time);
                            wx.setStorageSync('Measuredata', that.data.arr)
                            wx.getStorage({
                              key: 'Measuredata',
                              success:function(res){
                                console.log("bendihuancun:"+buf2string(res.value))
                              }
                            })
                            wx.setStorageSync('MeasuredataTime', that.data.Datatime)
                            wx.getStorage({
                              key: 'MeasuredataTime',
                              success:function(res){
                                //console.log("bendihuancun:"+buf2string(res.value))
                              }
                            })
                      
                            that.setData({
                              info: that.data.info + buf2string(res.value) 
                            })
                            WxNotificationCenter.postNotificationName('NotificationName',buf2string(res.value))
                          })
                        },
                        fail:function(){
                          console.log("fail");
                        }
                  })
                } 
            }
            that.setData({
                services:res.services,
            })
          },
         complete: (res) => {},
           fail: (res) => {},
          })
      },
      fail:function(){
        console.log("连接失败");
        //wx.hideLoading();
      },
      complete:function(e){
        console.log(e);
        wx.hideLoading();
        wx.stopBluetoothDevicesDiscovery({
          success:function(res){
          console.log(res.errMsg)
          }
        })
      }
    })
  },
//停止搜索蓝牙设备
    stopBluetoothDevicesDiscovery(){
      wx.stopBluetoothDevicesDiscovery({
      })
    },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that =this;
      wx.getStorage({
        key: 'Measuredata',
        success:function(res){
          for(let i in res.data){
            that.data.arr.push(res.data[i])
          }
        }
      })
      wx.getStorage({
        key: 'MeasuredataTime',
        success:function(res){
          for(let i in res.data){
            that.data.Datatime.push(res.data[i])
          }
        }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.showToast({
            title: '初始化蓝牙成功',
            image: "/image/success.png",
            duration: 1000,
            mask: true
        })
          console.log("初始化蓝牙适配器");
          console.log(res);
          //that.getBluetoothAdapterState();
          },
          fail: function (err) {
          console.log(err);
          wx.showModal({
            title: '蓝牙初始化失败',
            content: '\n请打开蓝牙及GPS服务！\n并重新进入该页面！',
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateBack()
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          }
          });
        },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
      wx.getBluetoothAdapterState({
        complete: (res) => {},
        success (res){
          if(res.discovering){
            wx.stopBluetoothDevicesDiscovery({
              complete: (res) => {},
              success(res){
                console.log("页面被隐藏，所以取消搜索")
              }
            })
          }
        }
      })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
   /* var that = this
    WxNotificationCenter.removeNotification('NotificationName', that)*/
    wx.getBluetoothAdapterState({
      complete: (res) => {},
      success (res){
        if(res.discovering){
          wx.stopBluetoothDevicesDiscovery({
            complete: (res) => {},
            success(res){
              console.log("页面被卸载，所以取消搜索")
            }
          })
        }
      }
    })
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
// 微信官方给的ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
     //return ( bit.toString(16)).slice(-2)
     //return(bit-48)
    }
  )
  return hexArr.join('');
}
function buf2string(buffer){
  var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
  var str = ''
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i])
  }
  return str
}