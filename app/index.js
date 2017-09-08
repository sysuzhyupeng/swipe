require('../resources/index.less');

//链接地址 https://github.com/thebird/Swipe
function Swipe(container, options){
	"use strict";

	var noop = function(){};
	var offloadFn = function(fn){
		setTimeout(fn || noop, 0);
	}
	/*
		将addEventListener检测、ontouchstart检测、transitions属性检测挂载在browser对象中
	*/
	var browser = {
		addEventListener: !!window.addEventListener,
		touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
		transitions: (function(temp){
			var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
			for ( var i in props){
				//检测传入的dom对象是否含有transition属性
				if (temp.style[props[i]] !== undefined) return true;
			}
      		return false;
		})(document.getElementById('swipe'))
	}
	//当没有传入容器时return
	if(!container) return;
	var element = container.children[0];
	var slides, slidePos, width, length;
	options = options || {};
	//将传入的startSlide转化成十进制数
	var index = parseInt(options.startSlide, 10) || 0;
	var speed = options.speed || 300;
	//当传入的continuous有定义的时候，使用options.continuous
	options.continuous = options.continuous !== undefined ? options.continuous : true;

	//开始函数
	function setup(){
		//container下的第二层子节点
		slides = element.children;
		length = slides.length;
		//如果只有一个slide把continuous设置为false
		if(slides.length < 2) options.continuous = false;
		//当只有两个slide的特殊情况
		if(browser.transitions && options.continuous && slides.length < 3){
			element.appendChild(slides[0].cloneNode(true));
			//0 1 0 1
			element.appendChild(element.children[1].cloneNode(true));
			//element增加了子节点之后，重新定义slides
			slides = element.children;
		}
		//创建一个新数组存储每个slide的当前位置
		slidePos = new Array(slides.length);
		//获取容器宽度
		width = container.getBoundingClientRect().width || container.offsetWidth;
		element.style.width = (slides.length * width) + 'px';
		var pos = slides.length;
		//循环所有slide，设置index和width以及left
		while(pos--){
			var slide = slides[pos];
			slide.style.width = width + 'px';
			slide.setAttribute('data-index', pos);
			if(browser.transitions){
				//这里的数组索引pos和width都是数字，可以直接相乘
				slide.style.left = (pos * -width) + 'px';
				move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
			}
		}
		//如果continuous为true，即最后一张滑动之后到第一张
		if(options.continuous && browser.transitions){
			move(circle(index - 1), -width, 0);
     		move(circle(index + 1), width, 0);
		}
		if(!browser.transitions) element.style.left = (index * -width) + 'px';
		//设置可见
		container.style.visibility = 'visible';
	}
	function prev(){
		/*
			当设置continuous为true，即最后一张滑动之后是第一张的时候(可以不断滑动)，slide(index - 1),
			否则，只有index大于0，slide(index - 1)
		*/
		if(options.continuous) slide(index - 1);
		else if(index) slide(index - 1);
	}
	function next(){
		if(options.continuous) slide(index + 1);
		else if(index < slides.length - 1) slide(index + 1);
	}
	function circle(index){
		//获得传入index除length的模
		return (slides.length + (index % slides.length)) % slides.length;
	}
	//滑动核心函数
	function slide(to, slideSpeed){
		//当index和to相等的时候不做任何处理
		if(index === to) return;
		//当浏览器支持transitions
		if(browser.transitions){
			/*
				Math.abs()方法返回数的绝对值
				1: backward, -1: forward
			*/
			var direction = Math.abs(index - to) / (index - to);
			// 获得slide的实际运动方向
			if(options.continuous){
				var natual_direction = direction;
				//从记录位置的slidePos数组中，获取to的pos
				direction = -slidePos[circle[to]] / width;
				// if going forward but to < index, to = slides.length + to
        		// if going backward but to > index, to = -slides.length + to
        		if (direction !== natural_direction){
        			to =  -direction * slides.length + to;
        		}
			}
			//把超过1次的先进行diff处理
			var diff = Math.abs(index - to) - 1;
			//循环diff次
			while(diff--){
				move(circle((to > index ? to : index) - diff - 1), width * direction, 0);
			}
			to = circle(to);
			move(index, width * direction, slideSpeed || speed);
			move(to, 0, slideSpeed || speed);
      		if (options.continuous) move(circle(to - direction), -(width * direction), 0);
		} else {
			to = circle(to);
			animate(index * -width, to * -width, slideSpeed || speed);
		}
		//操作完成之后将当前index修改为to
		index = to;
		/*
			这里做了一点改进，当callback为函数的时候，
			执行callback，并将callback执行结果作为offloadFn的参数
		*/
		offloadFn( typeof options.callback === 'function' && options.callback(index, slides[index]));
	}
	/*
		dist这里指代距离
	*/
	function move(index, dist, speed){
		translate(index, dist, speed);
		slidePos[index] = dist;
	}
	//最后操作css属性的滑动
	function translate(index, dist, speed){
		//slide为
		var slide = slides[index];
		var style = slide && slide.style;
		if(!style) return;
		//speed为传入的动画时间，通过传入的距离改变translate属性
		style.webkitTransitionDuration =
	    style.MozTransitionDuration =
	    style.msTransitionDuration =
	    style.OTransitionDuration =
	    style.transitionDuration = speed + 'ms';

	    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
	    style.msTransform =
	    style.MozTransform =
	    style.OTransform = 'translateX(' + dist + 'px)';
	}
	function animate(from, to, speed) {
	    // if not an animation, just reposition
	    if (!speed) {
	        element.style.left = to + 'px';
	        return;
	    }
	    var start = +new Date;
	    var timer = setInterval(function() {
	    var timeElap = +new Date - start;
	        if(timeElap > speed) {
	        element.style.left = to + 'px';
	        if (delay) begin();
	        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
	        clearInterval(timer);
	        return;
	      }
	        element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
	    }, 4);
	}
	var delay = options.auto || 0;
	var interval;

	function begin(){
		//delay之后调用next函数
		interval = setTimeout(next, delay);
	}
	//消除当前滑动执行进程
	function stop(){
		delay = 0;
		clearTimeout(interval);
	}
	var start = {},
		delta = {},
		isScrolling;

	/*
		addEventListener的参数listener必须是一个实现了EventListener接口的对象，或者是一个函数。
		这里使用的就是一个实现了EventListener接口的对象，
		当EventListener 所注册的事件发生的时候，handleEvent方法会被调用。
	*/
	var events = {
		handleEvent: function(event){
			//event参数自动获取到当前的事件对象
			switch(event.type){
				//根据不同的事件调用不同的逻辑
				//调用这个方法时，this指向event对象
				case 'touchstart': this.start(event); break;
		        case 'touchmove': this.move(event); break;
		        case 'touchend': offloadFn(this.end(event)); break;
		        case 'webkitTransitionEnd':
		        case 'msTransitionEnd':
		        case 'oTransitionEnd':
		        case 'otransitionend':
		        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
		        case 'resize': offloadFn(setup); break;
			}
			if(options.stopPropagation) event.stopPropagation();
		},
		start: function(event){
			var touches = event.touches[0];
			start = {
				//获得一开始的触摸坐标以及时间戳
				x: touches.pageX,
				y: touches.pageY,
				time: +new Date
			};
			isScrolling = undefined;
			delta = {};
			//绑定touchmove和touchend
			element.addEventListener('touchmove', this, false);
			element.addEventListener('touchend', this, false);
		},
		move: function(event){
			//保证只有一指活动并且没有
			if(event.touches.length > 1 || event.scale && event.scale !== 1){
				return;
			}
			if(options.disableScroll) event.preventDefault();
			var touches = event.touches[0];
			delta = {
				x: touches.pageX - start.x,
				y: touches.pageY - start.y
			}

			if(typeof isScrolling === 'undefined'){
				isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
			}
			//未实现完
		}
	}
	//触发setup
  	setup();
  	//开始自动轮播
  	if(delay) begin();
  	if(browser.addEventListener){
  		//如果支持touch事件
  		if (browser.touch) element.addEventListener('touchstart', events, false);
  		if (browser.transitions) {
	        element.addEventListener('webkitTransitionEnd', events, false);
	        element.addEventListener('msTransitionEnd', events, false);
	        element.addEventListener('oTransitionEnd', events, false);
	        element.addEventListener('otransitionend', events, false);
	        element.addEventListener('transitionend', events, false);
	    }
	    window.addEventListener('resize', events, false);
  	} else {
  		window.onresize = function(){
  			setup();
  		}
  	}
  	//将内部函数暴露给外面调用
  	return {
  		setup: function(){
  			//将setup等函数暴露出去
  			setup();
  		},
  		slide: function(to, speed){
  			stop();
  			slide(to, speed);
  		},
  		prev: function(){
  			//取消目前滑动
  			stop();
  			prev();
  		},
  		next: function(){
  			stop();
  			next();
  		},
  		stop: function(){
  			stop();
  		},
  		getPos: function(){
  			//返回当前index position
  			return index;
  		},
  		getNumSlides: function(){
  			//获取滑动组件的个数
  			return length;
  		},
  		kill: function(){
  			stop();
  			//把所有元素的width和left都置空
  			element.style.width = '';
  			element.style.left = '';
  			var pos = slides.length;
  			while(pos--){
  				var slide = slides[pos];
  				element.style.width = '';
  				element.style.left = '';
  				if(browser.transitions) translate(pos, 0, 0);
  			}
  			//移除所有事件监听
  			if(browser.addEventListener){
  				element.removeEventListener('touchstart', events, false);
		        element.removeEventListener('webkitTransitionEnd', events, false);
		        element.removeEventListener('msTransitionEnd', events, false);
		        element.removeEventListener('oTransitionEnd', events, false);
		        element.removeEventListener('otransitionend', events, false);
		        element.removeEventListener('transitionend', events, false);
		        window.removeEventListener('resize', events, false);
  			} else {
  				window.onresize = null;
  			}
  		}
  	}
}

if(window.jQuery || window.Zepto){
	(function($){
		$.fn.Swipe = function(params){
			return this.each(function(){
				$(this).data('Swipe', new Swipe($(this)[0], params));
			});
		}
	}(window.jQuery || window.Zepto)
}