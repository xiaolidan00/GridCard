
/**
id  元素id String 必填
op 设置选项Object 可置空
**/
var GridCard = function(id, op) {
  if (!op) {
    op = {};
  }
  var that = this;

  this.elmt = document.getElementById(id);
  this.elmt.style.position = 'absolute';
  this.elmt.style.overflowX = 'auto';
  this.elmt.style.overflowY = 'auto';

  this.cardList = []; //存储网格卡片中的所有卡片
//单张卡片最大最小宽高
  this.minWidth = op.minWidth ? op.minWidth : 1;
  this.minHeight = op.minHeight ? op.minHeight : 1;
  this.maxWidth = op.maxWidth ? op.maxWidth : 10;
  this.maxHeight = op.maxHeight ? op.maxHeight : 10;
//网格最多有多少行列
  this.maxRow = op.maxRow ? op.maxRow : 10;
  this.maxCol = op.maxCol ? op.maxCol : 10;
  //设置卡片大小单位宽高
  op.unitW=op.unitW?op.unitW:10;
  op.unitH=op.unitH?op.unitH:10;
  //设置卡片大小单位类型可以是 % 或 px
  op.unit = op.unit ? op.unit : '%'; 
  //滚动条宽度高度 单位px
  op.scrollBarW=18;
  op.scrollBarH=18;

//是否自动生成样式
  op.isGridStyle=  op.isGridStyle?  op.isGridStyle:true;

  
  //移动和改变大小时卡片阴影颜色
  var cardActionColor = op.actionColor ? op.actionColor : 'red';
  //移动和改变大小时class
  var cardActionClass=op.actionClass?op.actionClass:'';


/**
 * 将GridCard内的html转化未对应的卡片
 */
this.initGridHtml=function(){
  var children= this.elmt.children;
  if(children.length>0){
    var removeList=[];
    for(var i=0;i<children.length;i++){
      var child=children[i];
      if(child.dataset.row||child.dataset.col||child.dataset.sizex||child.dataset.sizey){
      child.dataset.sizex =child.dataset.sizex?(parseInt(child.dataset.sizex )>=this.minWidth? child.dataset.sizex : this.minWidth):this.minWidth;
        child.dataset.sizey =child.dataset.sizey? (parseInt(child.dataset.sizey)>=this.minHeight ? child.dataset.sizey : this.minHeight):this.minWidth;
        child.dataset.col =child.dataset.col? (parseInt(child.dataset.col)>0 ? child.dataset.col : 1):1;
        child.dataset.row =child.dataset.row? (parseInt(child.dataset.row)>0 ? child.dataset.row : 1):1;
        //判断是否有调整大小三角 若没有则添加
      if(child.innerHTML.length>0){
        if(child.innerHTML.indexOf('<span class="grid-card-resize-icon"></span>')==-1){
          child.innerHTML=child.innerHTML+'<span class="grid-card-resize-icon"></span>';
        }
      }else{
        child.innerHTML='<span class="grid-card-resize-icon"></span>';
      }
        this.cardList.push(child);        
        this.doCardAction(child);    
      }else{//没有 row col sizex sizey 的子元素去除
        removeList.push(child);
      }

    }//children.length
    for(var i=0;i<removeList.length;i++){
      this.elmt.removeChild(removeList[i]);
    }
    this.adjustCard();
  }
  this.addMovePage();  
 };
/**设置移动蒙板 */
  this.addMovePage=function(){
 this.movePage = document.createElement('div');
 this.movePage.style.position = 'relative';
 this.movePage.style.minHeight = '100%';
 this.movePage.style.height = '100%';
 this.movePage.style.width = '100%';
 this.movePage.style.left = 0;
 this.movePage.style.top = 0;
 this.movePage.style.zIndex = 888;
 this.movePage.style.display = 'none';
 
if(this.elmt.children.length==0){
  this.elmt.appendChild(this.movePage);
 }else{
  this.elmt.insertBefore(this.movePage,this.elmt.children[0]);
 } 
  }


  //生成对应的卡片大小位置样式
this.createGridStyle=function(){

  var gridStyle = '';

    for (var i = 1; i <= this.maxWidth; i++) {
      gridStyle +="#"+id+" [data-sizex='" + i + "'] { width:calc(" +( i * op.unitW)+ op.unit + ' - 8px);}';
    }

    for (var i = 1; i <= this.maxHeight; i++) {
      gridStyle +="#"+id+" [data-sizey='" + i + "'] { height:calc(" + (i * op.unitH)+ op.unit + ' - 8px);}';
    }

    for (var i = 1; i <= this.maxRow; i++) {
      gridStyle +="#"+id+ " [data-col='" + i + "'] { left:calc(" + ((i - 1) * op.unitH)+ op.unit + ' + 4px);}';
    }
    for (var i = 1; i <= this.maxCol; i++) {
      gridStyle += "#"+id+ "  [data-row='" + i + "'] { top:calc(" + ((i - 1) *op.unitW)+ op.unit + ' + 4px);}';
    }
    gridStyle +=
    "#"+id+' span.grid-card-resize-icon{cursor: se-resize;position: absolute;box-shadow: 4px 4px 4px rgba(255,255,255,0.5);right: 0;bottom: 0;display: inline-block;height: 0;width: 0;border: solid 10px transparent;';
    gridStyle +=
      'border-bottom:solid 10px ' +
      cardActionColor +
      ';border-right:solid 10px ' +
      cardActionColor +
      ';}';
  this.gridCardstyle = document.getElementById('grid_card_style_' + id);
  if (!this.gridCardstyle) {
    
    this.gridCardstyle = document.createElement('style');
    this.gridCardstyle.id = 'grid_card_style_' + id;
    this.gridCardstyle.type = 'text/css';
    this.gridCardstyle.innerHTML = gridStyle;
    document.querySelector('head').appendChild(this.gridCardstyle);
  }else{
    this.gridCardstyle.innerHTML = gridStyle;
  }
};

  //调整网格大小
  this.resizeGrid = function() {
    this.elmt.style.height = this.elmt.parentElement.offsetHeight + 'px';
    this.elmt.style.width = this.elmt.parentElement.offsetWidth + 'px';
    this.width = this.elmt.offsetWidth;
    this.height = this.elmt.offsetHeight;
   
    if(op.unit=='%'){
      this.mWidth = this.elmt.offsetWidth * (op.unitW/100);
      this.mHeight = this.elmt.offsetHeight *(op.unitH/100);
    }else{
      this.mWidth=op.unitW;
      this.mHeight=op.unitH;
    }
  };
  //延时操作，保证界面大小稳定
  setTimeout(function() {
    that.initGridHtml();
    that.resizeGrid();
    if(op.isGridStyle){
      that.createGridStyle();
    }
    
  }, 200);

  /**
   * 添加可调整大小和位置的卡片
   * html 卡片内部的html 
   * pos 卡片位置和大小
   */
  this.addCard = function(html, pos) {
    var card = document.createElement('div');
    card.style.position = 'absolute';
    card.innerHTML = html + '<span class="grid-card-resize-icon"></span>';
    card.dataset.sizex = parseInt(pos.sizex )>=this.minWidth? pos.sizex : this.minWidth;
    card.dataset.sizey = parseInt(pos.sizey)>=this.minHeight ? pos.sizey : this.minHeight;
    card.dataset.col = parseInt(pos.col)>0 ? pos.col : 1;
    card.dataset.row = parseInt(pos.row)>0 ? pos.row : 1;
    
    this.elmt.appendChild(card);
    this.cardList.push(card);

    this.adjustCard(card);
    this.doCardAction(card);
    return card;
  };



  /**
   * 添加固定大小和位置的卡片
   * html 卡片内部的html 
   * pos 卡片位置和大小
   */
  this.addFixedCard = function(html, pos) {
    var card = document.createElement('div');
    card.style.position = 'absolute';
    card.innerHTML = html;
    card.dataset.sizex = parseInt(pos.sizex )>=this.minWidth? pos.sizex : this.minWidth;
    card.dataset.sizey = parseInt(pos.sizey)>=this.minHeight ? pos.sizey : this.minHeight;
    card.dataset.col = parseInt(pos.col)>0 ? pos.col : 1;
    card.dataset.row = parseInt(pos.row)>0 ? pos.row : 1;
    this.elmt.appendChild(card);
    this.cardList.push(card);
    return card;
  };
  /**
   * 执行移动卡片操作
   * @param {点击卡片的event} e
   * @param {选择的卡片} card
   */
  this.doMoveCard=function(e, card) {
    //显示移动蒙板
    that.movePage.style.cursor = 'move';
    that.movePage.style.display = 'block';
    card.style.boxShadow = '0 0 4px ' + cardActionColor;
    card.className=cardActionClass;
    var down = true,
      startX = 0,
      startY = 0;
    //起始点击的移动点
    startX = e.pageX + that.elmt.scrollLeft - card.offsetLeft-that.elmt.parentElement.offsetLeft ;
    startY = e.pageY + that.elmt.scrollTop - card.offsetTop-that.elmt.parentElement.offsetTop ;

    that.movePage.onmousedown = function(e) {
      down = true;
    };

    that.movePage.onmousemove = function(e) {
      //设置蒙板大小跟网格大小相同
      that.movePage.style.height = that.elmt.scrollHeight + 'px';
      that.movePage.style.width = that.elmt.scrollWidth + 'px';
      //移动的卡片位置
      if (down) {
        card.style.left = e.pageX + that.elmt.scrollLeft - startX-that.elmt.parentElement.offsetLeft  + 'px';
        card.style.top = e.pageY + that.elmt.scrollTop - startY-that.elmt.parentElement.offsetTop  + 'px';
      }
    };
    //结束移动
    that.movePage.onmouseup = function(e) {
      down = false;
      that.movePage.style.display = 'none';
      card.style.boxShadow = '';
      card.className='';
      //处理位置
      that.moveCard(card);
    };
  };

  /**
   * 执行调整大小操作
   * @param {选择的卡片} card
   */
  this.doResizeCard=function(card) {
    //显示移动蒙板
    that.movePage.style.cursor = 'se-resize';
    that.movePage.style.display = 'block';
    card.style.boxShadow = '0 0 4px ' + cardActionColor;
    card.className=cardActionClass;
    var down = true;

    that.movePage.onmousedown = function(e) {
      down = true;
    };

    that.movePage.onmousemove = function(e) {
      //设置蒙板大小跟网格大小相同
      that.movePage.style.height = that.elmt.scrollHeight + 'px';
      that.movePage.style.width = that.elmt.scrollWidth + 'px';
      //设置调整的卡片大小
      if (down) {
        card.style.width = e.pageX + that.elmt.scrollLeft - card.offsetLeft-that.elmt.parentElement.offsetLeft + 'px';
        card.style.height = e.pageY + that.elmt.scrollTop - card.offsetTop-that.elmt.parentElement.offsetTop + 'px';
      }
    };
    //结束操作
    that.movePage.onmouseup = function(e) {
      down = false;
      that.movePage.style.display = 'none';
      card.style.boxShadow = '';
      card.className='';
      //处理大小
      that.resizeCard(card);
    };
  };

  /**
   * 给卡片添加动作 *
   *  */
  this.doCardAction = function(card) {
    card.onmousedown = function(e) {
      if (e.target.className == 'grid-card-resize-icon'&&e.target.tagName.toLowerCase()=='span') {
        //调整大小
        that.doResizeCard(card);
      } else if (!op.actionCallback || (op.actionCallback && !op.actionCallback(e, card))) {
        //移动
        that.doMoveCard(e, card);
      } else {
        //其他操作
        //非调整和移动的动作，函数判断卡片内部的event.target对象，对应对象需要返回true，否在会执行移动
        if (op.actionCallback) {
          op.actionCallback(e, card);
        }
      }
    };
  };

  /**
   * 设置卡片位置和大小
   * pos参数有row,col,sizex,sizey
   * card 要设置的卡片
   */
  this.setCardPos=function(card,pos){
    card.dataset.sizex = parseInt(pos.sizex )>=this.minWidth? pos.sizex : this.minWidth;
    card.dataset.sizey = parseInt(pos.sizey)>=this.minHeight ? pos.sizey : this.minHeight;
    card.dataset.col = parseInt(pos.col)>0 ? pos.col : 1;
    card.dataset.row = parseInt(pos.row)>0 ? pos.row : 1;
    this.adjustCard(card);
  }

  /**
   * 遍历网格范围，找到卡片可移动位置 如果遍历全部也没有合适的界面适合卡片的位置会保持原位置不动
   * 本人尝试过重叠其他很多方法，效果很差，影响其他卡片较大，排版大乱，该方法虽然笨，但至少实现了最少重叠情况
   * card 需要移动的卡片
   *  */
  this.findCardPos = function(card) {
    if (this.cardList.length >= 2) {
      var col = 1,
        row = 1;
      while (row <= this.maxRow) {
        var element = document.querySelectorAll("[data-col='" + col + "'][data-row='" + row + "']");
        //当前位置不存在卡片
        if (element.length == 0) {
          var pos = JSON.parse(JSON.stringify(card.dataset));
          for (var key in pos) {
            pos[key] = parseInt(pos[key]);
          }
          pos.col = col;
          pos.row = row;
          var tag = true;
          //遍历已存在的卡片，该位置是否与其中卡片重叠
          for (var i = 0; i < this.cardList.length; i++) {
            if (card != this.cardList[i] && this.isOverlay1(pos, this.cardList[i].dataset)) {
              //存在与其他卡片重叠，该位置不合适
              tag = false;
            }
          }
          //不存在与其他卡片重叠，判断是否在最大行列内，若在范围内，就设置该卡片位置
          if (
            tag &&
            pos.row + pos.sizey - 1 <= this.maxRow &&
            pos.col + pos.sizex - 1 <= this.maxCol
          ) {
            card.dataset.col = col;
            card.dataset.row = row;
            break;
          } // if(tag&&pos.row+pos.sizey-1<=this.maxRow&&pos.col+pos.sizex-1<=this.maxCol)
        } //if(element.length==0){
        col++;
        if (col > this.maxCol) {
          col = 1;
          row++;
        } //if(col>this.maxCol){
      } // while(row<=this.maxRow){
    } //if(this.cardList.length>=2)
  };

  /**
   * 调整卡片位置防止重叠
   * card 参考卡片
   *  */
  this.adjustCard = function(card) {
    if (this.cardList.length >= 2 && !card) {
      //遍历移动重叠卡片
      for (var i = 0; i < this.cardList.length - 1; i++) {
        //判断是否重叠
        if (this.isOverlay(this.cardList[i], this.cardList[i + 1])) {
          this.findCardPos(this.cardList[i]);
        }
      }
    } else if (this.cardList.length >= 2 && card) {
      //跟指定卡片对比，是否重叠，若重叠就移动卡片
      for (var i = 0; i < this.cardList.length; i++) {
        var item = this.cardList[i];
        //判断是否重叠
        if (item != card && this.isOverlay(item, card)) {
          this.findCardPos(item);
        }
      }      
    }
  };
  //点是否在矩形内
  function isPointIn(x1, y1, x2, y2, xa, ya) {
    if (xa >= x1 && xa <= x2 && ya >= y1 && ya <= y2) {
      //点a在矩形
      return true;
    } else {
      return false;
    }
  }
  //是否重叠，重叠就调整位置
  this.isOverlay = function(card1, card2) {
    return this.isOverlay1(card1.dataset, card2.dataset);
  };

  /**是否重叠，重叠就调整位置
   * pos1 pos2 两个位置和大小
   *  */
  this.isOverlay1 = function(pos1, pos2) {
    pos1 = JSON.parse(JSON.stringify(pos1));
    pos2 = JSON.parse(JSON.stringify(pos2));

    for (var key in pos1) {
      pos1[key] = parseInt(pos1[key]);
      pos2[key] = parseInt(pos2[key]);
    }
    var x1 = pos1.col,
      y1 = pos1.row,
      x2 = pos1.col + pos1.sizex,
      y2 = pos1.row + pos1.sizey;
    var xa = pos2.col,
      ya = pos2.row,
      xb = pos2.col + pos2.sizex,
      yb = pos2.row + pos2.sizey;
    if (x1 == xb || y1 == yb || x2 == xa || y2 == ya) {
      //边界相接不算重叠
      return false;
    } else if (
      isPointIn(x1, y1, x2, y2, xa, ya) ||
      isPointIn(x1, y1, x2, y2, xb, yb) ||
      isPointIn(x1, y1, x2, y2, xa, yb) ||
      isPointIn(x1, y1, x2, y2, xb, ya) ||
      isPointIn(xa, ya, xb, yb, x1, y1) ||
      isPointIn(xa, ya, xb, yb, x1, y2) ||
      isPointIn(xa, ya, xb, yb, x2, y1) ||
      isPointIn(xa, ya, xb, yb, x2, y2)
    ) {
      //card2端点在card1内必重叠

      return true;
    } else if (
      isPointIn(x1, y1, x2, y2, (xa + xb) / 2, (y1 + y2) / 2) &&
      isPointIn(xa, ya, xb, yb, (x1 + x2) / 2, (ya + yb) / 2) &&
      isPointIn(x1, y1, x2, y2, (x1 + x2) / 2, (ya + yb) / 2) &&
      isPointIn(xa, ya, xb, yb, (xa + xb) / 2, (y1 + y2) / 2)
    ) {
      //card1与card2交点的中点在card1或card2内存在重叠
      return true;
    }
    return false;
  };

  /**调整卡片大小后处理
   * card 调整大小的卡片
   *  */
  this.resizeCard = function(card) {
    //卡片大小取整
    var w = Math.round((card.offsetWidth+op.scrollBarW) / this.mWidth);
    var h = Math.round((card.offsetHeight+op.scrollBarH) / this.mHeight);
    //保证大小必须大于最小值，小于最大值
    w = w < this.minWidth ? this.minWidth : w > this.maxWidth ? this.maxWidth : w;
    h = h < this.minHeight ? this.minHeight : h > this.maxHeight ? this.maxHeight : h;
    //保证位置加上大小在网格最大范围内
    card.dataset.sizex =
      w + parseInt(card.dataset.col) - 1 > this.maxCol
        ? this.maxCol - parseInt(card.dataset.col) + 1
        : w;
    card.dataset.sizey =
      h + parseInt(card.dataset.row) - 1 > this.maxRow
        ? this.maxRow - parseInt(card.dataset.row) + 1
        : h;
    //还原大小设置
    card.style.width = '';
    card.style.height = '';
    //调整其他卡片位置
    this.adjustCard(card);
    //调整大小后调用函数
    if (op.resizeCallback) {
      op.resizeCallback(card);
    }
  };
  /*移动卡片后处理卡片位置
   *card 移动的卡片
   **/
  this.moveCard = function(card) {
    //位置取整
    var l = Math.ceil((card.offsetLeft + this.elmt.offsetLeft+op.scrollBarW) / this.mWidth);
    var t = Math.ceil((card.offsetTop + this.elmt.scrollTop+op.scrollBarH) / this.mHeight);
    //不可小于1
    l = l < 1 ? 1 : l;
    t = t < 1 ? 1 : t;
    //保证位置加上大小在网格最大范围内
    card.dataset.col =
      l + parseInt(card.dataset.sizex) - 1 > this.maxCol
        ? this.maxCol - parseInt(card.dataset.sizex) + 1
        : l;
    card.dataset.row =
      t + parseInt(card.dataset.sizey) - 1 > this.maxRow
        ? this.maxRow - parseInt(card.dataset.sizey) + 1
        : t;
    //还原位置设置
    card.style.left = '';
    card.style.top = '';
    //调整其他卡片位置
    this.adjustCard(card);

    //移动后调用函数
    if (op.moveCallback) {
      op.moveCallback(card);
    }
  };
  /**
   * 删除卡片
   * card 卡片对象
   */
  this.removeCard = function(card) {
    for (var i = 0; i < this.cardList.length; i++) {
      if (card == this.cardList[i]) {
        this.removeCardByIdx(i);
        break;
      }
    }
  };
  /**
   * 根据索引删除卡片
   * idx 卡片所在索引
   */
  this.removeCardByIdx = function(idx) {
    this.elmt.removeChild(this.cardList[idx]);
    this.cardList.splice(idx, 1);
  };
  /**
   * 移除所有的卡片
   */
  this.removeAllCard = function() {
    for (var i = 0; i < this.cardList.length; i++) {
      this.elmt.removeChild(this.cardList[i]);
    }
    this.cardList = [];
  };
 this.exportStyle = function() {
    return this.gridCardstyle.outerHTML;
  };
    /**
     * 导出GridCard对象的是html
     *  */
this.exportHtml = function() {
      var html = this.elmt.cloneNode(true);
      html.style.height = '';
      html.style.width = '';
      html.removeChild(html.children[0]); //移除蒙板
      var str = html.outerHTML;
      str = str.replace(/<span class="grid-card-resize-icon"><\/span>/g, ''); //移除调整大小三角形
      return str;
    };
  return this;
};

//export default GridCard;
