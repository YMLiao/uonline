// JavaScript Document//========================================================
// world.yam.com v2.5 @ 2013/03/15
//========================================================

var $body = $('body'),
	$index = $('#index'), 
	$post = $('#post'), 
	$my = $('#my'), 
	$pixList = $("#pixList"), 
	$overlay = $('#overlay'),
	$tagsBoxSearch = $("#tagsBoxSearch").find('ul'),
	$mainNav = $('#mainNav').find('.innerBox');

$(function(){
/* 設置版面尺寸
-------------------------------------------------------------*/
$(window).on("resize", function(e){
	waitForFinalEvent(function(){
		$pixList.masonry( 'destroy' );
		resizeMidWrap();
		mainNavScrollbar();
		if(!$overlay.is(':hidden'))
			$overlay.css({width: getWidth() + 100});
	}, 500);
});

//分類列表捲軸
$('#tagsBoxCover').find('ul').mCustomScrollbar({mouseWheelPixels:20, scrollInertia:20});
//主選單捲軸
$mainNav.css({height:getHeight()-230}).mCustomScrollbar({mouseWheelPixels:20, scrollInertia:20});

/* 主選單
-------------------------------------------------------------*/
//主選單開關設定
if(!$.cookie('worldYam_setting')){
	$.cookie('worldYam_setting', 'wideType', { expires: 680 });
	//歡迎＆說明
	$('html, body').scrollTop(0);
	instructionsCtrl();
}

//進入文章 自動收起選單
if($post.length){
	resizeTopContainer();
	$('#figureNav').attr('href', "#"+$post.find('.imgBox').eq(0).attr("id"));
}else{

	if($.cookie('worldYam_setting') == "wideType"){
		$body.addClass("wideType");
		mainNavScrollbar();
		resizeMidWrap();
	}else{
		resizeMidWrap();
	}
}


//主選單開關
$('#menuSwitch').click(function(e){
	e.stopPropagation();
	e.preventDefault();
	$body.toggleClass('wideType');
	if($body.hasClass('wideType')){
		$.cookie('worldYam_setting', 'wideType');
		$mainNav.css({height:getHeight()-230}).mCustomScrollbar({mouseWheelPixels:20, scrollInertia:20});
	}else{
		$.cookie('worldYam_setting', 'noType');
		$mainNav.mCustomScrollbar("destroy");
		}
	$pixList.masonry( 'destroy' );
	resizeMidWrap();
});



/* FIX IE背景圖片閃爍現象
-------------------------------------------------------------*/
try {
  document.execCommand("BackgroundImageCache", false, true);
} catch(err) {}

//防右鍵
$('img').attr({oncontextmenu:"return false"});


/* tips
-------------------------------------------------------------*/
$('#header').find('a').tipsy({gravity: 'w'});
$('#licensedForBg').find('a').tipsy({gravity: 's'});
$('.imgFuncBar').find('a').tipsy({gravity: 's'});
$('.tips').find('a').tipsy({gravity: 's'});
$('.tipn').find('a, span').tipsy({gravity: 'n'});
$('.tipe').find('a').tipsy({gravity: 'e'});


/* __post
-------------------------------------------------------------*/
//看下一張圖
$post.find('.imgBox').waypoint(function(top) {
	var figureNav = $(this).next().attr('id');
	//console.log(figureNav);
	if(figureNav)
		$('#figureNav').attr('href', '#'+figureNav);
	else
		$('#figureNav').attr('href', '#otherPost');
}, { offset: 60 });
$post.waypoint(function(top) {
	$('#figureNav').attr('href', "#"+$post.find('.imgBox').eq(0).attr("id"));
	//console.log("#"+$post.find('.imgBox').eq(0).attr("id"));
}, { offset: -60 });


//本圖畫面可能引起不適，請斟酌點閱。
$post.find('.blackCover').on('click', function(e){
	e.stopPropagation();
	e.preventDefault();
	$(this).empty().remove();
});


//comment Scrollbar
$post.find(".commentList").mCustomScrollbar({mouseWheelPixels:20, scrollInertia:20}, "update");
	
//show imgFunc
//$post.find('.imgFuncWrap').animate({opacity:0}, 0);
$post.find(".mainBox").find('.imgWrap').hover(function(){ 
	var pid=$(this).attr('data-pid');
	var coid=$(this).attr('data-coid');
	preLoadComment(pid,coid);

	$(this).find('.imgFuncWrap').stop(true, true).animate({opacity:1}, 350)
		.find('.commentBox').stop().animate({ left:0 }, {duration:550, easing:'easeInOutCubic'}).end()
		.find('.imgFuncBar').stop().animate({ right:0 }, {duration:550, easing:'easeInOutCubic'});
},function(){
	$(this).find('.imgFuncWrap').stop(true, true).animate({opacity:0}, 350)
		.find('.commentBox').stop().animate({ left:-495 }, {duration:550, easing:'easeInOutCubic'}).end()
		.find('.imgFuncBar').stop().animate({ right:-495 }, {duration:550, easing:'easeInOutCubic'});
});


//留言區隱藏
$post.find('.closeComment').on('click', function(e){
	e.stopPropagation();
	e.preventDefault();
	$post.find('.commentBox').addClass("hide").end()
		.find('.imgFuncWrap').addClass("bgtsp").end()
		.find('.closeComment').hide().end()
		.find('.openComment').show();
});
//留言區顯示
$post.find('.openComment').on('click', function(e){
	e.stopPropagation();
	e.preventDefault();
	$post.find('.commentBox').removeClass("hide").end()
		.find('.imgFuncWrap').removeClass("bgtsp").end()
		.find('.closeComment').show().end()
		.find('.openComment').hide();
});


//收藏 in post
$body.find('.loveIt').on('click', function(e){
	e.stopPropagation();
	e.preventDefault();
	var adding = $('<i class="icon-heart adding"></i>'), 
		removing = $('<i class="icon-heart removing"></i>'),
		marked = $('<em class="post_sign marked">MARKED</em>'), 
		$this = $(this), 
		$innerContent = $this.parents('.imgWrap').find('.innerContent'),
		postID = $this.attr('data-postid'), 
		type = !$this.hasClass('done') ? 'add' : 'del';	
	
	if(!$.cookie('co_member')){
		$mainNav.find('.login').trigger("click");
		return false;
	}
	
	$.ajax({
		url:'userfavor.php',
		dataType:'json',
		data:{
			"id": postID,
			"type": type
			}
		})
		.fail(function(){ alert('糟糕～失去與伺服器的資料連結了～!\n請重新嘗試之前的操作，或聯絡我們為您服務'); })
		.done(function(res){
			// 寫入成功
			if(res.status){
				// 新增
				if(type == 'add'){
					if($post.length){
						$this.append(adding).find(adding).stop(true, true).fadeIn(150)
							.animate({top:"5px", left:"-350px", fontSize:"100px", opacity:"0.1"}, {duration: 1200, complete:function(){
								$(this).remove();
								}
							});
						$post.find('.loveIt').addClass('done').attr('title', '取消收藏');
					}else{//收藏 in #pixList
						$this.addClass('done').attr('title', '取消收藏');
						$innerContent.append(marked);
					}
				}else{// 刪除
					if($post.length){
						$this.append(removing).find(removing).fadeIn(250)
							.animate({top:"5px", left:"100px", fontSize:"20px", opacity:"0.1"}, {duration: 500, complete: function(){
								$(this).remove();
								}
							});
						$post.find('.loveIt').removeClass('done').attr('title', '加入收藏');
					}else{//刪除 in #pixList
						$this.removeClass('done').attr('title', '加入收藏');
						$innerContent.find('.marked').remove();
					}
				}
			}else{// 寫入失敗
				//alert(res.msg);
				alert("寫入失敗");
				}
			});
		
});


/* 捲動頁面至指定錨點
-------------------------------------------------------------*/
$body.on('click', "a.target", function(e){
	e.stopPropagation();
	e.preventDefault();
	var tag = $(this).attr('href');
	$body.stop(true, true).scrollTo(tag, 750, {easing:'easeInOutSine'});
});

/* __index 首頁導覽
-------------------------------------------------------------*/
$('#indexNav').find('a').animate({ top:20 }, {duration:1200, easing:'easeOutBounce'}).hover(function(){ 
		$(this).stop().animate({ top:0 }, {duration:500, easing:'easeOutElastic'});
	},function(){ 
		$(this).stop().animate({ top:20 }, {duration:500, easing:'easeOutElastic'})
	});


if( !$.browser.msie ){
	//if( eval(parseInt($.browser.version)) >= 10 )
	
	$('#indexNav').find('a:first').grumble({
			text:"Welcome Aboard！", 
			angle:-20, 
			distance: 100, 
			showAfter: 500,
			hideAfter: 2000
		});
	
    $index.find('#mailToUs').grumble({
		text:"對我們有任何意見嗎？", 
		angle:45, 
		distance:50, 
		showAfter: 500,
		hideAfter: false,
		hasHideButton: true,
		buttonHideText: '不再顯示', 
		});
}


var $indexNav_goNext = $('#indexNav').find('.goNext');
$index.find('#toperContainer').find('.imgWrap').waypoint(function(top) {
	var figureNav = $(this).next().attr('id');
	//console.log($(this).attr("id"));
	if(figureNav)
		$indexNav_goNext.attr('href', '#'+figureNav).show();
	else
		$indexNav_goNext.hide();
}, { offset: -5 });


$index.find("#fsPixList").find("h3").macho();

/* __overlay
-------------------------------------------------------------*/
//以熱鍵關閉
$body.bind('keyup', 'Esc', function(){
	$('#overlay, .overlayBox').fadeOut();
	overlayClose();
});
//登入
$body.find('.login').on('click', function(e) {
	if(!$(this).hasClass("done")){
		e.stopPropagation();
		e.preventDefault();
		$('html, body').scrollTop(0);
		$('#loginBox').overlay();
		}
});
//登入 error
/*
$('#loginBox').find('button').click(function(e){
	$('#loginBox ul').shake(3, 20, 500);
	return false;
});
*/

//搜尋
$body.on('click', '.search', function(e) {
	e.stopPropagation();
	e.preventDefault();
	$('html, body').scrollTop(0);
	$('#searchBox').overlay();
	$tagsBoxSearch.mCustomScrollbar({mouseWheelPixels:20, scrollInertia:20});
});

//關閉
$('.overlayBox').on('click', '.closeIt', function(e){
	e.stopPropagation();
	e.preventDefault();
	overlayClose();
});

//
$("#instructions").on("click", function(e){
	e.stopPropagation();
	e.preventDefault();
	instructionsCtrl();
});

/* tabs
-------------------------------------------------------------*/
$body.find('.tabsNav').find('a').on("click", function(e){
	e.preventDefault();
	var $tabsWrap = $(this).parents('.tabsWrap'), 
		target = +$(this).index();
	
	$tabsWrap.find('.curr').removeClass('curr').end().find('.tabsBox').eq(target).addClass('curr');
	$(this).addClass('curr');
});


});/*------------------------------ fin -------------------------------*/


function resizeMidWrap(){
	var mW = getWidth()-$('#header').width()+'px';
	$('#midWrap').css({width: mW});
	$pixList.imagesLoaded( function(){
		$pixList.css({width:mW}).masonry({	
			itemSelector: '.imgWrap',
			isAnimated: true
		});
	});
	
	//console.log(123);
	resizeTopContainer();
}
function resizeTopContainer(){
	$('#toperContainer').css({
		width: $('#midWrap').width()+'px'
	}).find('.imgWrap').css({
		height: getHeight()+'px'
	});
	//console.log(890);
	backstretchToperContainer();
}
function backstretchToperContainer(){
	var $toperContainer = $('#toperContainer').children('.imgWrap');
	for (var i = 0; i < $toperContainer.length; i++) {
	    $toperContainer.eq(i).backstretch($toperContainer.eq(i).attr('data-bg'));
		}
	if($post.length)
		$post.find(".backstretch").css({top:$("#toperContainer").find(".imgWrap").data("posy")});
}

function getHeight(){
	return(window.myHeight) ? window.myHeight : $(window).height();
}
function getWidth(){
	return(window.myWidth) ? window.myWidth : $(window).width();
}
//主選單飛梭列
function mainNavScrollbar(){
	$mainNav.mCustomScrollbar( 'destroy' );
	$mainNav.css({height:getHeight()-230}).mCustomScrollbar({mouseWheelPixels:20, scrollInertia:20});
}
//使用說明
function instructionsCtrl(){
	var $instructionsBox = $("#instructionsBox");
	$('html, body').scrollTop(0);
	$("#instructionsWrap").empty().append('<div class="innerBox tabsBox curr"><img src="../img/pix/instructions00.jpg" alt="歡迎" /></div><div class="innerBox tabsBox"><img src="../img/pix/instructions01.jpg" alt="首頁功能介紹" /></div><div class="innerBox tabsBox"><img src="../img/pix/instructions02.jpg" alt="列表功能介紹" /></div><div class="innerBox tabsBox"><img src="../img/pix/instructions03.jpg" alt="內文功能介紹" /></div>');
	// 開啟說明
	$instructionsBox.overlay();
	// 計時關閉
	$instructionsBox.oneTime(10000, function() {
		overlayClose();
	});
	// 取消計時
	$instructionsBox.on("click", ".tabsNav a", function() {
		$instructionsBox.stopTime();
	});
}
//關閉overlay
function overlayClose(){
	$('#overlay, .overlayBox').fadeOut();
	$body.removeClass('ov');
	$tagsBoxSearch.mCustomScrollbar("destroy");
}

/* 等待
-------------------------------------------------------------*/
var waitForFinalEvent = (function () {
	var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) {
			uniqueId = "Don't call this twice without a uniqueId";
			}
		if (timers[uniqueId]) {
			clearTimeout (timers[uniqueId]);
			}
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();
