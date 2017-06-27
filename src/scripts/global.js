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
    isObject : function(obj){
      return obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype;
    },
    extend : function(target, obj){
      for(var k in obj) {
        var src = target[k];
        var copy = obj[k];
        if(src === copy) {
            continue;
        }
        if(this.isObject(copy)) {
            src = src || {};
            target[k] = this.extend(src, copy);
        } else {
            target[k] = copy;
        }
      }
      return target;
    },
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
    },
    getMaximin : function(arr,maximin) { 
      if(maximin=="max") { 
        return Math.max.apply(Math,arr); 
      } else if(maximin=="min") { 
        return Math.min.apply(Math, arr); 
      } 
    } 
  }
  var LineChart = {
    init : function(){
      return new CreateChart(arguments[0])
    }
  }
  function CreateChart(selector){
    this.target = document.getElementById(selector);
    // 默认配置项
    this.config = {
      color : {
        extendsLine : "#DDD",
        Axis : "#333",
        line : "#FF0000",
        fontColor : "#333"
      },
      isX : true,
      isY : true
    }

    //生成canvas对象
    var canvas  = document.createElement('canvas');
    this.canvas = canvas;
    this.ctx    = canvas.getContext("2d");
    //设备缩放比
    var radio           = utils.getPixelRatio(this.ctx);
    this.radio          = radio;

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
  */
  CreateChart.prototype.setOption = function(options){
    this.options  = utils.extend(this.config, options);
    this.sets     = [];    //所有坐标集合

    this.initAxis();
    if(this.xSize > this.yLength){
      this.xSize = this.yLength;
    } else if(this.xSize < this.yLength){
      this.yLength = this.xSize;
    }

    var canvas = this.canvas;
    this.target.appendChild(canvas);

    this.setXAxis();      //设定x轴的下标
    this.lineXAxis();     //x轴对应下标的延长线
    this.drawXAxis();     //绘制x轴
    this.drawYAxix();     //绘制y轴
    this.drawLine();      //绘制折线
  }
  CreateChart.prototype.initAxis = function(){
    //坐标原点
    this.startX = 30
    this.startY = (this.height_num)*this.radio - 30;
    //x轴的最大坐标点
    this.x_max = (this.width_num)*this.radio - 30;
    //x轴长度
    this.x_length = this.x_max - this.startX;

    this.xAxis_data   = this.options.xAxis.data;
    this.yAxis_data   = this.options.yAxis.data;
    this.yLength      = this.yAxis_data.length;                         //y轴数据的个数
    this.xSize        = this.xAxis_data.length;                         //x轴数据的个数
    this.xAxisUnit    = parseInt(this.x_length / (this.xSize - 1));     //x轴单位刻度
   
  }
  CreateChart.prototype.setXAxis = function(){
    var length = this.xSize;
    var unit   = this.xAxisUnit;
    
    this.ctx.fillStyle    = this.options.color.fontColor;
    this.ctx.font         = 12*this.radio + "px" +" PingFang SC";
    this.ctx.textAlign    = "center";
    for(var i = 0; i < length; i++){
      var x = this.startX + unit*(i);
      var y = this.height_num*this.radio - 5;
     
      this.ctx.fillText(this.xAxis_data[i], x, y);
      
      //每个点的X坐标存入数组
      this.sets[i] = [];
      this.sets[i][0] = x;
    }
  }
  CreateChart.prototype.lineXAxis = function(){
    var xAxis_data = this.options.xAxis.data;
    var length     = this.xAxis_data.length;
    var unit       = this.xAxisUnit;

    for(var i = 0; i < length; i++){
      var x = this.startX + unit*(i);
      var y = this.height_num*this.radio - 5;
     
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.startY);
      this.ctx.lineTo(x, 0);
      this.ctx.lineJoin    = 'round';
      this.ctx.strokeStyle = this.config.color.extendsLine;
      this.ctx.stroke();
    }
  }
  CreateChart.prototype.drawXAxis = function(){
    var ctx    = this.ctx;
    var startX = this.startX;
    var startY = this.startY;
    var endX   = this.x_max;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, startY);
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = this.config.color.Axis;
    ctx.stroke();
  }

  CreateChart.prototype.drawYAxix = function(){
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.startX, 0);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.config.color.Axis;
    ctx.stroke();
  }

  
  CreateChart.prototype.drawLine = function(){
    var ydata = this.yAxis_data;
    //找出y轴数据最大点。
    var maxData = utils.getMaximin(ydata, 'max');
    console.log(maxData);
    //根据Y粥长度算出1个坐标单位代表的数值
    var yUnit = maxData / this.startY;

    //将每个点的y轴坐标存进数组
    for(var i = 0; i < ydata.length; i++){
       this.sets[i][1] = ydata[i]/yUnit;
    }
    
    //画线
     this.ctx.beginPath();
     this.ctx.moveTo(this.sets[0][0], this.sets[0][1]);

     for(var j = 1; j < this.sets.length; j++ ){
        this.ctx.lineTo(this.sets[j][0], this.sets[j][1]);
     }
     this.ctx.lineJoin = 'round';
     this.ctx.strokeStyle = this.config.color.line;
     this.ctx.stroke();

     this.intiEvent();
  }
  
  CreateChart.prototype.intiEvent = function(){
    var canvas = this.canvas;
    console.log("xx")
    canvas.onmousemove = function(event){
      var event = event ? event : window.event;
      var x = event.pageX - canvas.getBoundingClientRect().left;
      var y = event.pageY - canvas.getBoundingClientRect().top;

      console.log("x:", x);
      console.log("y:", y);
    }
  }

  window.LineChart = LineChart;
})(window, document, undefined)





