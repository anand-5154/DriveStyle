/*
 * jquery.fullscreen v0.6.0
 * https://github.com/private-face/jquery.fullscreen
 *
 * Copyright (c) 2012–2016 Vladimir Zhuravlev
 * Released under the MIT license
 * https://github.com/private-face/jquery.fullscreen/blob/master/LICENSE
 *
 * Date: 2016-08-25
 **/
(function(global, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], function (jQuery) {
			return factory(jQuery);
		});
	} else if (typeof exports === 'object') {
		// CommonJS/Browserify
		factory(require('jquery'));
	} else {
		// Global
		factory(global.jQuery);
	}
}(this, function($) {

function defined(a){return"undefined"!=typeof a}function extend(a,b,c){var d=function(){};d.prototype=b.prototype,a.prototype=new d,a.prototype.constructor=a,b.prototype.constructor=b,a._super=b.prototype,c&&$.extend(a.prototype,c)}function native(a,b){var c;"string"==typeof a&&(b=a,a=document);for(var d=0;d<SUBST.length;++d){b=b.replace(SUBST[d][0],SUBST[d][1]);for(var e=0;e<VENDOR_PREFIXES.length;++e)if(c=VENDOR_PREFIXES[e],c+=0===e?b:b.charAt(0).toUpperCase()+b.substr(1),defined(a[c]))return a[c]}}var SUBST=[["",""],["exit","cancel"],["screen","Screen"]],VENDOR_PREFIXES=["","o","ms","moz","webkit","webkitCurrent"],ua=navigator.userAgent,fsEnabled=native("fullscreenEnabled"),parsedChromeUA=ua.match(/Android.*Chrome\/(\d+)\./),IS_ANDROID_CHROME=!!parsedChromeUA,CHROME_VERSION,ANDROID_CHROME_VERSION;IS_ANDROID_CHROME&&(ANDROID_CHROME_VERSION=parseInt(parsedChromeUA[1]));var IS_NATIVELY_SUPPORTED=(!IS_ANDROID_CHROME||ANDROID_CHROME_VERSION>37)&&defined(native("fullscreenElement"))&&(!defined(fsEnabled)||fsEnabled===!0),version=$.fn.jquery.split("."),JQ_LT_17=parseInt(version[0])<2&&parseInt(version[1])<7,FullScreenAbstract=function(){this.__options=null,this._fullScreenElement=null,this.__savedStyles={}};FullScreenAbstract.prototype={native:native,_DEFAULT_OPTIONS:{styles:{boxSizing:"border-box",MozBoxSizing:"border-box",WebkitBoxSizing:"border-box"},toggleClass:null},__documentOverflow:"",__htmlOverflow:"",_preventDocumentScroll:function(){this.__documentOverflow=document.body.style.overflow,this.__htmlOverflow=document.documentElement.style.overflow,$(this._fullScreenElement).is("body, html")||$("body, html").css("overflow","hidden")},_allowDocumentScroll:function(){document.body.style.overflow=this.__documentOverflow,document.documentElement.style.overflow=this.__htmlOverflow},_fullScreenChange:function(){this.__options&&(this.isFullScreen()?(this._preventDocumentScroll(),this._triggerEvents()):(this._allowDocumentScroll(),this._revertStyles(),this._triggerEvents(),this._fullScreenElement=null))},_fullScreenError:function(a){this.__options&&(this._revertStyles(),this._fullScreenElement=null,a&&$(document).trigger("fscreenerror",[a]))},_triggerEvents:function(){$(this._fullScreenElement).trigger(this.isFullScreen()?"fscreenopen":"fscreenclose"),$(document).trigger("fscreenchange",[this.isFullScreen(),this._fullScreenElement])},_saveAndApplyStyles:function(){var a=$(this._fullScreenElement);this.__savedStyles={};for(var b in this.__options.styles)this.__savedStyles[b]=this._fullScreenElement.style[b],this._fullScreenElement.style[b]=this.__options.styles[b];a.is("body")&&(document.documentElement.style.overflow=this.__options.styles.overflow),this.__options.toggleClass&&a.addClass(this.__options.toggleClass)},_revertStyles:function(){var a=$(this._fullScreenElement);for(var b in this.__options.styles)this._fullScreenElement.style[b]=this.__savedStyles[b];a.is("body")&&(document.documentElement.style.overflow=this.__savedStyles.overflow),this.__options.toggleClass&&a.removeClass(this.__options.toggleClass)},open:function(a,b){a!==this._fullScreenElement&&(this.isFullScreen()&&this.exit(),this._fullScreenElement=a,this.__options=$.extend(!0,{},this._DEFAULT_OPTIONS,b),this._saveAndApplyStyles())},exit:null,isFullScreen:null,isNativelySupported:function(){return IS_NATIVELY_SUPPORTED}};var FullScreenNative=function(){FullScreenNative._super.constructor.apply(this,arguments),this.exit=$.proxy(native("exitFullscreen"),document),this._DEFAULT_OPTIONS=$.extend(!0,{},this._DEFAULT_OPTIONS,{styles:{width:"100%",height:"100%"}}),$(document).bind(this._prefixedString("fullscreenchange")+" MSFullscreenChange",$.proxy(this._fullScreenChange,this)).bind(this._prefixedString("fullscreenerror")+" MSFullscreenError",$.proxy(this._fullScreenError,this))};extend(FullScreenNative,FullScreenAbstract,{VENDOR_PREFIXES:["","o","moz","webkit"],_prefixedString:function(a){return $.map(this.VENDOR_PREFIXES,function(b){return b+a}).join(" ")},open:function(a,b){FullScreenNative._super.open.apply(this,arguments);var c=native(a,"requestFullscreen");c.call(a)},exit:$.noop,isFullScreen:function(){return null!==native("fullscreenElement")},element:function(){return native("fullscreenElement")}});var FullScreenFallback=function(){FullScreenFallback._super.constructor.apply(this,arguments),this._DEFAULT_OPTIONS=$.extend({},this._DEFAULT_OPTIONS,{styles:{position:"fixed",zIndex:"2147483647",left:0,top:0,bottom:0,right:0}}),this.__delegateKeydownHandler()};extend(FullScreenFallback,FullScreenAbstract,{__isFullScreen:!1,__delegateKeydownHandler:function(){var a=$(document);a.delegate("*","keydown.fullscreen",$.proxy(this.__keydownHandler,this));var b=JQ_LT_17?a.data("events"):$._data(document).events,c=b.keydown;JQ_LT_17?b.live.unshift(b.live.pop()):c.splice(0,0,c.splice(c.delegateCount-1,1)[0])},__keydownHandler:function(a){return!this.isFullScreen()||27!==a.which||(this.exit(),!1)},_revertStyles:function(){FullScreenFallback._super._revertStyles.apply(this,arguments),this._fullScreenElement.offsetHeight},open:function(a){FullScreenFallback._super.open.apply(this,arguments),this.__isFullScreen=!0,this._fullScreenChange()},exit:function(){this.__isFullScreen&&(this.__isFullScreen=!1,this._fullScreenChange())},isFullScreen:function(){return this.__isFullScreen},element:function(){return this.__isFullScreen?this._fullScreenElement:null}}),$.fullscreen=IS_NATIVELY_SUPPORTED?new FullScreenNative:new FullScreenFallback,$.fn.fullscreen=function(a){var b=this[0];return a=$.extend({toggleClass:null,overflow:"hidden"},a),a.styles={overflow:a.overflow},delete a.overflow,b&&$.fullscreen.open(b,a),this};
//# sourceMappingURL=jquery.fullscreen.min.js.mapreturn $.fullscreen;
}));

//Fullscreen
$(function() {
	// open in fullscreen
	$('body .requestfullscreen').on('click', function() {
		$('body').fullscreen();
		return false;
	});
	// exit fullscreen
	$('body .exitfullscreen').on('click', function() {
		$.fullscreen.exit();
		return false;
	});
	// document's event
	$(document).bind('fscreenchange', function(e, state, elem) {
		// if we currently in fullscreen mode
		if ($.fullscreen.isFullScreen()) {
			$('body .requestfullscreen').hide();
			$('body .exitfullscreen').show();
		} else {
			$('body .requestfullscreen').show();
			$('body .exitfullscreen').hide();
		}
		$('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
	});
});
