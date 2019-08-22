# 纯JS拖拽移动卡片网格

[TOC]

## 1.使用GridsterJS拖拽卡片问题
在阿里云quickBI上发现它的拖拽板面是自己改编过的GridsterJS

**GridsterJS存在问题**（GridsterJS:http://dsmorse.github.io/gridster.js/#demos）

1.由于gridster在移动和调整大小过程中就一直在检测与其他卡片是否重叠,并且有一个预览卡片显示效果,这虽然很直观,但是真的很费操作成本。如果卡片内的内容时canvas时,在卡片移动和调整大小操作较频繁时直接就崩了。

2.如果卡片较多且不规则时,往往排版很稀疏,若未设置最大列,在移动和调整大小时会无端端让卡片移动到看不见的列,没有最大行设置。手动移动的位置会自动向上靠拢,但是卡片自动调整的位置会出现悬空,并不会将卡片向左上方调整。

3.发现gridster防重叠算法：未设置最大列,重叠的卡片大多进行右移和下移；设置了最大列后,重叠的卡片大多进行下移,无最大行设置,保证了卡片为了不重叠,可以不断地下移,这导致你的板面实际上大小不可确定,板面无法充分利用空间。位置调整算法点模棱两可：（情况1）A卡片移动到B卡片中,A卡片会被拒绝返回原来位置或者移动B卡片旁边。（情况2）A卡片移动到B卡片中,A卡片代替B卡片中位置,B卡片移动到A卡片旁边。还有很好玩的,卡片自动调整后的位置即便与其他卡片重叠也熟视无睹。

4.自己添加方法在移动和调整大小后再对卡片进行一次重新排序,防重叠操作,发现由于GridsterJS的防重叠操作动作太大,即便自己怎样调整,卡片排版效果很不理想,很难无法保证想要的卡片在想要的位置和其他重叠卡片以最小的调整实现不重叠。

5.虽然可以设置固定位置点击才进行移动,但这样很不方便,如果设置卡片内有相关点击操作,该操作会被忽略掉,只能采用右击来代替。



##2.拖拽卡片网格GridCard功能设计

因为用GridsterJs看源码修改,有些烦,所以还是借鉴一下,自己写一个吧。还有些原因,现在都用vue了,JQuery这个依赖一般不引入,为了用GridsterJs引入有点大题小作。

- 添加/删除卡片,容器内已有html,GridCard实例化自动转为卡片对象
- 调整卡片大小,原则：A卡片调整大小后大小确定,其他卡片移动位置来配合A卡片
- 移动卡片,原则：A卡片移动后位置确定,其他卡片移动位置来配合A卡片
- 防重叠算法：遍历网格,重叠需移动的卡片查找合适的位置,使得整体排版尽量保持,减少重叠,卡片向左上方靠拢,如果没有合适的位置,保持原位,即便和其他卡片重叠。
- 点击操作不被卡片调整大小和移动操作覆盖
- 可设置卡片大小单位可以是百分比和像素,可设置最大最小的卡片大小,必须设置卡片最大行和列
- 自动生成样式,并在实例化后及时更新样式,一个界面可用多个GridCard,每个实例的卡片大小行列之类的参数可根据需求更改。

## 3.GridCard使用说明

具体的示例演示在http://www.xiaolidan00.top/grid_card/gridCardTest.html

GitHub下载地址：https://github.com/xiaolidan00/GridCard.git

**创建GridCard**
```js
var gridCard1 = new GridCard('gridContainer1'//Element 的id String 必填
	,{//设置选项 可选填		
	unit:'%',//可以用px 或 %作为卡片大小的单位,默认是%
	unitW:5,//单位网格宽度,默认是10 ,即默认单位宽度10%,%单位横向满屏最多是 （100/unitW）个单位宽,px单位横向满屏最多是（父容器宽/unitW）个单位宽
	unitH:5,//单位网格高度,默认是10,即默认单位宽度10%,%单位纵向满屏最多是 （100/unitW）个单位高,px单位纵向满屏最多是（父容器宽/unitH）个单位高

	maxRow:60,//网格最大行数,默认是10,即默认10个单位行
	maxCol:20,//网格最大列数,默认是10,即默认10个单位列

	minWidth:2,//卡片最小宽度,默认1,即默认1个单位宽
	minHeight:2,//卡片最小高度,默认1,即默认1个单位高
	maxWidth:20,//卡片最大宽度,默认10,即默认10个单位宽
	maxHeight:20,//卡片最大高度,默认10,即默认10个单位高

	scrollBarW:8,//网格滚动条的宽度,竖直滚动条,默认是18,即18px
	scrollBarH:8,//网格滚动条的高度,横向滚动条,默认是18,即18px
	isGridStyle:true,//是否自动生成网格样式,最好开启,默认true
		actionColor: 'orange',//移动和调整大小时卡片的颜色，默认red 可是是rgb,rgba,Hex,浏览器颜色值
    	actionClass:'',//移动和调整大小时卡片的class，默认''
		actionCallback: function (e, card) {//点击时移动或调整大小操作之外的动作 e为点击mouseEvent, card选中的卡片
			if (e.target.title == "del") {
				gridCard.removeCard(card);//删除卡片
				return true;//返回true为非移动和调整大小操作
			}
			return false;//返回false 为调整大小和移动操作
		},
		resizeCallback:function(card){//调整大小完后的调用函数,
			console.log('resize Ok');
		},
		moveCallback:function(card){//移动完后大调用函数
			console.log('move Ok');
		}

	});
```

**对GridCard执行操作**

```js
/*添加卡片 参数：html=>String ,pos=>Object 
*在同一个位置添加卡片,后添加者会在占据该位置,之前添加的卡片,会移动到空的位置,防止重叠
*该方法添加的卡片“可以”执行actionCallback,resizeCallback,moveCallback和移动调整大小操作
*/
var normalCard=gridCard1.addCard('<div class="my-card"><button class="circle-btn red" style="position:absolute;right:0;top:0;" title="del">删除</button>First</div>'//html字符串
                  ,{row:1,//卡片在第1个单位行位置
                    col:2,//卡片在第2个单位列位置 
                    sizex:3,//卡片3个单位宽大小 
                    sizey:4//卡片4个单位高大小
                   });
/*添加固定位置卡片 参数：html=>String ,pos=>Object 
*在同一个位置添加卡片,不进行防重叠调整
*该方法添加的卡片“不可以”执行actionCallback,resizeCallback,moveCallback和移动调整大小操作
*/
var fixedCard=gridCard1.addFixedCard('<div class="my-card"><button class="circle-btn red" style="position:absolute;right:0;top:0;" title="del">删除</button>Fixed</div>'//html字符串
                  ,{row:3,//卡片在第3个单位行位置
                    col:3,//卡片在第3个单位列位置 
                    sizex:3,//卡片3个单位宽大小 
                    sizey:3//卡片3个单位高大小
				   });
//调整板面,减少重叠卡片
gridCard1.adjustCard();
//以normalCard为参考调整板面,移动其他卡片,减少重叠卡片
gridCard1.adjustCard(normalCard);

//删除指定卡片
gridCard1.removeCard(normalCard);

//通过卡片的索引删除指定卡片
gridCard1.removeCardByIdx(1);

//设置指定卡片位置和大小,设置后会执行防重叠操作
gridCard1.setCardPos(normalCard,
                     {row:3,//卡片在第3个单位行位置
                    col:3,//卡片在第3个单位列位置 
                    sizex:3,//卡片3个单位宽大小 
                    sizey:3//卡片3个单位高大小
				   });
//当浏览器大小发生变化时调整网格大小
document.querySelector('body').onresize=function(){
    //调整网格大小
gridCard1.resizeGrid();
}
gridCard1.exportStyle()//导出GridCard样式
gridCard1.exportHtml()//导出GridCard的HTML
```

**防重叠算法说明**

当A卡片与B卡片发生重叠时，通过网格遍历，查找合适位置，使得A卡片与不其他卡片重叠，如果在空的网格中，找不到其他位置使得它与其他卡片不重叠，那么，就不移动A卡片（防止调整后与其他卡片发生重叠，其他卡片也要进行防重叠操作，容易发生内存溢出），这样不移动保持重叠还是为了保证排版不因为其中的一两张卡片变动而排版大乱。例如:A卡片特别大，在网格范围内只能容得下一张A卡片大小，另外还有BCD三张小卡片在旁边，当A卡片移动到BCD卡片的位置，小卡片会将A卡片位置为参考，在旁边自动寻找合适的位置移动，避免重叠，如果板面内刚好找不到合适的位置给小卡片，那么小卡片就会停留在A卡片中，保持原来位置。





