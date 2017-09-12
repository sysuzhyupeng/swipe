var mobileSwiper = function(selector){
	var x0,
		y0,
		hasMoved = false,
		lock = false;
	var touchStartHandle = function(e){
		var touch = e.targetTouches[0],
			x = touch.pageX,
			y = touch.pageY;
		x0 = x;
		y0 = y;
		hasMoved = false;
		lock = false;
	},
	touchMoveHandle = function(e){
		if(lock) return;
		var touch = e.targetTouches[0],
			x = touch.pageX,
			y = touch.pageY,
		   offsetX = x0 - x,
		   offsetY = y0 - y;
		// 阻止滚动
		hasMoved || (hasMoved = true, Math.abs(offsetX) > Math.abs(offsetY) && e.preventDefault());
		if(offsetX <= -50){
			console.log('向右');
			//头节点插入尾节点元素
			this.queue.unshift(this.queue.pop());
			lock = true;
			swap('right');
		} else if (offsetX >= 50){
			console.log("向左");
			//尾节点插入头节点元素(整个数组/链表进行移动)
			this.queue.push(this.queue.shift());
			lock = true;
			swap('left');
		}
	}.bind(this),
	swap = function(orientation){
		//queue是this.queue的一个拷贝，使用concat之后不会影响this.queue
		var queue = [].concat(this.queue),
			// item 总数
			total = this.virtual.length,
			// 最后一个索引
			last = total - 1, 
			// css计数
			collect = 0,
			virtual = new Array(total), 
			odd = true;
		/*
			当count > 5或者count < 5的时候，我们把其他元素都集中在中间，隐藏节点（display: none/visibility: hidden），
			只提取前三个元素与后三个元素，
			即
			渲染节点（0, 1, 2, n-1, n）
			回收节点（3, 4， 5, …, n-2）
		*/
		while(collect < 5 && queue.length > 0) { 
			/*
				queue [0, 1, 2, ..., len - 1],
				只取（0, 1, 2, len-2, len - 1）
				odd为真，先取0，接下来取len - 1，再接下取2,最后取3
			*/
			var index = odd ? queue.shift() : queue.pop();
			/*
				当collect == last且odd为false且方向向右时，condition为真
				在slide item的数量小于5的时候(此时slide item的数量为2或4)
				当计数达到最后一个索引，调整方向，效果更美观
			*/
			var condition = collect == last && !odd && "right" == orientation;
			if(condition){
				virtual[index] = css[collect + 1];
			} else {
				//将css样式按照collect计数赋给virtual
				virtual[index] = css[collect];
			}
			collect++;
			// virtual[index] = css[condition ? ++collect : collect++]; 
			odd = !odd; 
		} 
		//对比一下数组 
		for(var i = 0; i < total; ++i) { 
			/*
				当新的虚拟节点和原来的虚拟节点不同的时候，
				更新this.virtual[i]
				并将slide item的样式改变(如果无样式则隐藏该item)
			*/
			if(virtual[i] != this.virtual[i]){
				this.virtual[i] = virtual[i];
				//cssText返回目前css的内容（可读写）
				this.item[i].style.cssText = this.virtual[i] || "visibility: hidden";
			}
			// virtual[i] != this.virtual[i] && (this.virtual[i] = virtual[i], this.item[i].style.cssText = this.virtual[i] || "visibility: hidden"); 
		}
	}.bind(this),
	//将px转化成rem
	rem = function(px){
		return px / 40 + "rem"; 
	},
	//css数组保存5个元素的css样式
	css = [
		/*
			translate3d将元素在3d空间中移动，
			3个参数分别代表x, y, z,
			这里五个元素的z值分别是10px、6px、2px（距离平面距离）
			五个元素的x值分别是-240rem、-148rem、0、148rem、240rem,即从左到右排布

			scale3d修改元素在3d空间中的大小
			五个元素的x, y分别是1、0.8和0.667
		*/
		"-webkit-transition: -webkit-transform .3s ease; z-index: 3; -webkit-transform: translate3d(0, 0, 10px) scale3d(1, 1, 1); visibility: visible;", 
		"-webkit-transition: -webkit-transform .3s ease; z-index: 2; -webkit-transform: translate3d(" + rem(-148) + ", 0, 6px) scale3d(.8, .8, 1); visibility: visible;", 
		"-webkit-transition: -webkit-transform .3s ease; z-index: 2; -webkit-transform: translate3d(" + rem(148) + ", 0, 6px) scale3d(.8, .8, 1); visibility: visible;", 
		"-webkit-transition: -webkit-transform .3s ease; z-index: 1; -webkit-transform: translate3d(" + rem(-240) + ", 0, 2px) scale3d(.667, .667, 1); visibility: visible;", 
		"-webkit-transition: -webkit-transform .3s ease; z-index: 1; -webkit-transform: translate3d(" + rem(240) + ", 0, 2px) scale3d(.667, .667, 1); visibility: visible;"
	]; 
	//初始化入口
	this.init = function(list) {
		this.container = list; 
		/*
			transform-style属性确定元素的子元素是否位于3D空间中,
			给容器设置transform-style属性
		*/
		this.container.style["-webkit-transform-style"] = "preserve-3d"; 
		//获取所有slide item
		this.item = list.getElementsByTagName("li"); 
		//slide item数量
		var len = this.item.length;
		//先把所有slide item隐藏
		for(var i = 0; i < len; ++i) {
			this.item[i].style.visibility = "hidden";
		}
		this.queue = function(len) {
		    // 索引列表，用于处理切换的序号队列 
			// 一个对应 item 的数组，记录 DOM 信息
			var arr = []; 
			// this.queue = [0, 1, 2, ..., len - 1]
			for(var i = 0; i < len; ++i) arr[i] = i; 
			return arr; 
		}(len); 
		// 与slide item对应的虚拟DOM数组，数组中存放css样式
		this.virtual = new Array(len); 
		swap(); // 初始排版

		if(len > 1){
			this.container.addEventListener("touchstart", touchStartHandle); 
			this.container.addEventListener("touchmove", touchMoveHandle); 
		}  
	}
	this.destory = function() {
		//移除事件绑定
		this.container.removeEventListener("touchstart", touchStartHandle); 
		this.container.removeEventListener("touchmove", touchMoveHandle); 
	}
	//如果list元素存在，则初始化组件
	var list = document.querySelector(selector); 
	list ? this.init(list) : console.log(selector + " undefined"); 
}
module.exports = mobileSwiper;