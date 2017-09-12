// var Swipe = require('./swipe');
// require('../resources/less/index.less');


// var elem = document.getElementById('mySwipe');
// window.mySwipe = Swipe(elem, {
//   // startSlide: 4,
//   // auto: 3000,
//   // continuous: true,
//   // disableScroll: true,
//   // stopPropagation: true,
//   // callback: function(index, element) {},
//   // transitionEnd: function(index, element) {}
// });

var mobileSwiper = require('./simple-swipe')
require('../resources/less/simple-swipe.less');

new mobileSwiper("#selector");