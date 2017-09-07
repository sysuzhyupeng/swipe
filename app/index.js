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

	function prev(){
		/*
			当目前可以继续滑动的时候，slide(index - 1),
			当不能滑动的时候，如果index大于0，slide(index - 1)
		*/
		if(options.continuous) slide(index - 1);
		else if(index) slide(index - 1);
	}
	function next(){
		if(options.continuous) slide(index + 1);
		else if(index < slides.length - 1) slide(index + 1);
	}
	function circle(index){
		return (slides.length + (index % slides.length)) % slides.length;
	}
	//滑动核心函数
	function slide(to, slideSpeed){
		//当index和to相等的时候不做任何处理
		if(index === to) return;
		//当浏览器支持transitions
		if(browser.transitions){
			// 1: backward, -1: forward
			var direction = Math.abs(index - to) / (index - to);
			// 获得slide的实际方向
			if(options.continuous){
				var natual_direction = direction;
				direction = -slidePos[circle[to]] / width;
				// if going forward but to < index, use to = slides.length + to
        		// if going backward but to > index, use to = -slides.length + to
        		if (direction !== natural_direction) to =  -direction * slides.length + to;
			}
			//把超过1次的先进行diff处理
			var diff = Math.abs(index - to) - 1;
			//循环diff次
			while(diff--){
				move(circle((to > index ? to : index) - diff - 1), width * direction, 0);
			}
			to = circle(to);
			move(index, width * direction, slideSpeed || speed);
		}
	}
	//dist这里指代距离
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
	function begin(){
		//delay之后调用next函数
		interval = setTimeout(next, delay);
	}
	function stop(){
		delay = 0;
		clearTimeout(interval);
	}
	var start = {},
		delta = {},
		isScrolling = false;

	var events = {
		handleEvent: function(event){
			switch(event.type){
				//根据不同的事件调用不同的逻辑
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
			element.addEventListener('touchmove', this, false);
			element.addEventListener('touchend', this, false);
		},
		move: function(event){
			if(event.touches.length > 1)
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