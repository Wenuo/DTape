import * as echarts from '../../ec-canvas/echarts';
var WxNotificationCenter = require('../../notification/WxNotificationCenter.js')
let chart =[];

function setOption(chart, xdata, ydata) {
  const option = {
      title: {
          text: 'CHART',
         left:'center',
          textStyle: {
              fontSize: 14,
              color: '#696969'
          },
      },
      backgroundColor: "#fff",
      color: ["#006EFF", "#67E0E3", "#9FE6B8"],
      animation: true,
      grid: {
          containLabel: true
      },
      dataZoom:{
                  type: 'slider',
                  xAxisIndex: 0, 
                  start: 10, 	
                  end: 60,
                
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        }
      },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xdata,      //x轴上的数据是动态的，所以我作为参数传进来
          
         
                 //x轴间隔多少显示刻度
              /*formatter: function (value) {   //显示时间
                  var date = new Date(value * 1000);
                  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
                  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
                  return h + m
              },*/
              
          
      },
      yAxis: {
          x: 'center',
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          //show:true
          /*axisLabel: {
              formatter: function (value) {
              var val = value / 1000000000 + 'G';
                  return val
              }
          }*/
      },
      series: [{
          type: 'line',
          data: ydata,    //y轴上的数据也是动态的，也作为参数传进来
         smooth:true,
      }]
  };
  chart.setOption(option)
}
Page({
  data: {
      ec: {
          lazyLoad: true
      },  
      iamgeName:'D',
      value1:'',
      value2:'',
      value3:'',
      showChart:true,
      chartSwitchchecked:false,
      shifouxianshi:'',
  },
  onShow(){
       chart = [];
       const self = this
       let userName = wx.getStorageSync('userName')
       let userSex = wx.getStorageSync('userSex')

       let DataTime = wx.getStorageSync('MeasuredataTime');
       let Measuredata = wx.getStorageSync('Measuredata');

       var str ='';
       var shouzi = '';
     
           if(userName && userName.length!=0){
                   self.data.value1 = userName
                   str = JSON.stringify(userName);
                   shouzi = str.charAt(1)
                    console.log("shouzimu"+shouzi+"str"+str+"userName"+userName)
                    if(Measuredata&&Measuredata.length!=0){
                      self.setData({
                        shifouxianshi:true
                       })
                    }else{
                      self.setData({
                        shifouxianshi:false
                       })
                    }
                   
            }
              else{
                      self.data.clearMessage = false
                      shouzi='D'
                      self.setData({
                        shifouxianshi:false
                       })
             }
             if(userSex){
                  self.data.value2 = userSex
              }
            self.setData({
                    value1:userName,
                    value2:userSex,
                    iamgeName:shouzi,
             })
  },

  userInput(e){
      var self =this
      const value = e.detail.value
      if(value&&value.length!=0){
          wx.setStorageSync('userName', value)
          this.setData({
            iamgeName:e.detail.value.charAt(0),
        })
    }
  },
  clearnews:function(e){
    var value = [];
    wx.setStorageSync('userSex', value);
    wx.setStorageSync('userName', value);
    wx.setStorageSync('MeasuredataTime', value);
    wx.setStorageSync('Measuredata', value);
    this.onShow();
  },
  
  sexInput:function(e){
    var self =this
      const values = e.detail.value
          wx.setStorageSync('userSex', values)
  },
  SetShadow:function(e){
    var that = this;
    this.setData({
        showChart:e.detail.value,
    })
    if(e.detail.value == true){
      if(that.data.shifouxianshi==false){
        wx.showModal({
          title: '提示',
          content: '没有数据，请先输入用户和性别\n并进行测量',
          showCancel:false,
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')

             that.setData({
               chartSwitchchecked:false
             })
            } 
          }
        })
      }else{
        this.oneComponent = this.selectComponent('#mychart-dom-line'); 
        this.getOneOption();
      }
      console.log("true")
    }else{
      console.log("false")
    }
  },
  onLoad: function (options) {
      var _this = this;
      chart = [];
  },
  onReady: function () {               
  },
  onUnload: function () {

  },
  init_one: function (xdata, ydata) {           
      this.oneComponent.init((canvas, width, height,dpr) => {
           chart = echarts.init(canvas, null, {
              width: width,
              height: height,
              devicePixelRatio: dpr
          });
          setOption(chart, xdata, ydata)
          this.chart = chart;
          return chart;
      });
  },
  getOneOption: function () {        
      var _this = this;
      var xdata =[];
      var ydata =[];
      try {
        xdata = wx.getStorageSync('MeasuredataTime');
        console.log(xdata)
      }catch(e){
      }
      try{
        ydata = wx.getStorageSync('Measuredata');
        console.log(ydata)
      }catch(e){
      }
              _this.init_one(xdata,ydata)
  },
})