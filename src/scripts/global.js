/*
 *  lineChart.js
 *  动态生成折线图
 *  author: csywweb
 *  link : https://github.com/csywweb/lineChart.js 
 *
 */

;(function(window, document, undefined){

  /*
   *  引用自 hidpi-canvas-polyfill
   *  https://github.com/jondavidjohn/hidpi-canvas-polyfill
   *  解决高清屏幕下canvas的模糊问题
   */
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // name has changed in Webkit
                                    window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
          var id = window.setTimeout(function() {
              callback(currTime + timeToCall);
          }, timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
  }
  if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
  }

  /*
   * 工具类
   * 
   *
   */
  utils = {
    getNum : function(string){
      var value = string.replace(/[^0-9]/ig,""); 
      return value;
    },
    getWinWidth : function(){
      var winWidth;
      // 获取窗口宽度
      if (window.innerWidth)
        winWidth = window.innerWidth;
      else if ((document.body) && (document.body.clientWidth))
        winWidth = document.body.clientWidth;

      return winWidth;
    },
    getWinHeight : function(){
      var winHeight;
      if (window.innerHeight)
        winHeight = window.innerHeight;
      else if ((document.body) && (document.body.clientHeight))
        winHeight = document.body.clientHeight;

      return winHeight;
    },
    getPixelRatio : function(context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
    
        return (window.devicePixelRatio || 1) / backingStore;
    }
  }
  var LineChart = {
    init : function(){
      return new CreateChart(arguments[0])
    }
  }
  function CreateChart(selector){
    this.target = document.getElementById(selector);
    
    var obj = this.target, style;
    if(window.getComputedStyle){
      style = window.getComputedStyle(obj, null);
    } else {
      style = obj.currentStyle;
    }

    //宽度高度， 带单位px
    this.width  = utils.getNum(style.width) - utils.getNum(style.paddingLeft) - utils.getNum(style.paddingRight) + "px";
    this.height = utils.getNum(style.height) - utils.getNum(style.paddingTop) - utils.getNum(style.paddingBottom) + "px";

    //宽度高度， 不带px
    this.width_num  = utils.getNum(this.width); 
    this.height_num = utils.getNum(this.height);

    //生成canvas对象
    var canvas  = document.createElement('canvas');
    this.canvas = canvas;
    this.ctx    = canvas.getContext("2d");

    //设备缩放比
    var radio           = utils.getPixelRatio(this.ctx);
    this.radio          = radio;
    //定义样式
    canvas.width        = this.width_num * radio;
    canvas.height       = this.height_num * radio;
    canvas.style.width  = this.width;
    canvas.style.height = this.height;
  }
  /*
  *   options
  *   
  *
  *
  */
  CreateChart.prototype.setOption = function(options){
    this.options      = options;
    this.xAxis_data   = options.xAxis.data;
    this.yAxis_data   = options.yAxis.data;
    this.yLength      = this.yAxis_data.length;
    this.xLength      = this.xAxis_data.length;     //x轴数据的长度
    var points        = this.xLength + 1;
    this.xAxisUnit    = parseInt(this.width_num / points);  //y轴单位刻度
    
    if(this.xLength > this.yLength){
      this.xLength = this.yLength;
    } else if(this.xLength < this.yLength){
      this.yLength = this.xLength;
    }



    var canvas = this.canvas;
    this.target.appendChild(canvas);
    
    //坐标原点
    this.startX = 10;
    this.startY = this.height_num*this.radio - 30;

    this.setXAxis();      //设定x轴的下标
    this.lineXAxis();     //x轴对应下标的延长线
    this.drawXAxis();     //绘制x轴
    this.drawYAxix();     //绘制y轴
    this.drawLine();      //绘制折线
  }
  CreateChart.prototype.setXAxis = function(){
    var length = this.xLength;
    var unit   = this.xAxisUnit;
    
    this.ctx.fillStyle    = "#666";
    this.ctx.font         = 12*this.radio + "px" +" PingFang SC";
    this.ctx.textAlign    = "center";
    for(var i = 0; i < length; i++){
      var x = unit*(i+1)*this.radio;
      var y = this.height_num*this.radio - 5;
     
      this.ctx.fillText(this.xAxis_data[i], x, y);
     
    }
  }
  CreateChart.prototype.drawXAxis = function(){
    var ctx    = this.ctx;
    var startX = this.startX;
    var startY = this.startY;
    var endX   = this.width_num*this.radio;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, startY);
    ctx.lineTo(endX - 10, startY - 6);
    ctx.moveTo(endX, startY);
    ctx.lineTo(endX - 10, startY + 6);
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = "#333";
    ctx.stroke();
  }

  CreateChart.prototype.drawYAxix = function(){
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.startX, 0);
    ctx.lineTo(this.startX + 6, 10);
    ctx.moveTo(this.startX, 0);
    ctx.lineTo(this.startX - 6, 10);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = "#333";
    ctx.stroke();
  }

  CreateChart.prototype.lineXAxis = function(){
    var xAxis_data = this.options.xAxis.data;
    var length     = this.xAxis_data.length;
    var unit       = this.xAxisUnit;

    for(var i = 0; i < length; i++){
      var x = unit*(i+1)*this.radio;
      var y = this.height_num*this.radio - 5;
     
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.startY);
      this.ctx.lineTo(x, 0);
      this.ctx.lineJoin    = 'round';
      this.ctx.strokeStyle = "#DDD";
      this.ctx.stroke();
    }
  }
  CreateChart.prototype.drawLine = function(){
    var ydata = this.yAxis_data;
    


  }
  

  window.LineChart = LineChart;
})(window, document, undefined)





