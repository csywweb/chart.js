;(function(window, document, undefined){
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
  var Chart = {
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

  }
  /*
  *   options
  *   
  *
  *
  */
  CreateChart.prototype.setOption = function(options){
    this.options = options;

   
    var canvas = document.createElement('canvas');
   
    this.target.appendChild(canvas);
    this.ctx = canvas.getContext("2d");

    var radio  = utils.getPixelRatio(this.ctx);
    this.radio = radio;
    
    canvas.width        = this.width_num * radio;
    canvas.height       = this.height_num * radio;
    canvas.style.width  = this.width;
    canvas.style.height = this.height;

    //极点坐标
    this.startX = 10;
    this.startY = this.height_num*this.radio - 30;

    this.setXAxis()
  }
  CreateChart.prototype.setXAxis = function(){
    var xAxis_data = this.options.xAxis.data;

    var length = xAxis_data.length;
    var points = length + 1;
    var unit   = parseInt(this.width_num / points);
    this.unit  = unit;
    
    this.ctx.fillStyle    = "#666";
    this.ctx.font         = 12*this.radio + "px" +" PingFang SC";
    this.ctx.textAlign    = "center";
    for(var i = 0; i < length; i++){
      var x = unit*(i+1)*this.radio;
      var y = this.height_num*this.radio - 5;
     
      this.ctx.fillText(xAxis_data[i], x, y);
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.startY);
      this.ctx.lineTo(x, 0);
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle="#DDD";
      this.ctx.stroke();
    }

    this.drawXAxis();
    this.drawYAxix();
  }
  CreateChart.prototype.drawXAxis = function(){
    var ctx = this.ctx;
    var startX = this.startX;
    var startY = this.startY;
    var endX   = this.width_num*this.radio;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, startY);
    ctx.lineTo(endX - 10, startY - 6);
    ctx.moveTo(endX, startY);
    ctx.lineTo(endX - 10, startY + 6);
    ctx.lineJoin = 'round';
    ctx.strokeStyle="#333";
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
    ctx.strokeStyle="#333";
    ctx.stroke();
  }

  

  window.Chart = Chart;
})(window, document, undefined)