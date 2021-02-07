/**
 * Global Library v0.0.1
 * Author: Link
 * Date: 2015-07-06 14:36
 */
;(function( window ) {
	var G = {
		refreshCaptcha : function( url ) {
			this.src = url + "?" + new Date().valueOf();
		},
        loading: function(){
            if(typeof(layer) != "undefined"){
                layer.open({type:2, shadeClose:false});
            }
        },
        newpop: function(msg, type, callback) {
            $('.newpopmsg').remove();
            if(typeof(type) == 'undefined') {
                var type = 1;
            }
            type += 2;
            var html = '<div class="modal normal bg-trans-black newpopmsg">'+
                '<div class="modal-content  bg-white">'+
                    '<img class="smile-sm" src="/static/C07M2/_default/__static/__images/popup/icon'+type+'.png">'+
                    '<p>'+msg+'</p>'+
                    '<div class="btn-cont">'+
                        '<a id="btn-ok1" class="btn-ok btn-oknewpopmsg" href="javascript:;">OK</a>'+
                    '</div></div></div>';
            $(html).appendTo('body');
            $(".newpopmsg").show();
            $(".btn-oknewpopmsg").click(function(){
                $(".newpopmsg").hide();
            });
            $("#btn-ok1").click(function(){
                if(typeof(callback) !== "undefined"){
                    callback();
                }
            });
        },
        newpopTitle: function(title, content, callback) {
          $('.newpopmsg').remove();
          var html = '<div class="modal normal bg-trans-black newpopmsg">'+
              '<div class="modal-content  bg-white">'+
                  '<h1>' + title + '</h1>'+
                  '<p style="color: red;">'+content+'</p>'+
                  '<div class="btn-cont">'+
                      '<a id="btn-ok1" class="btn-ok btn-oknewpopmsg" href="javascript:;">OK</a>'+
                  '</div></div></div>';
          $(html).appendTo('body');
          $(".newpopmsg").show();
          $(".btn-oknewpopmsg").click(function(){
              $(".newpopmsg").hide();
          });
          $("#btn-ok1").click(function(){
              if(typeof(callback) !== "undefined"){
                  callback();
              }
          });
        },
        toast: function(msg, type, time) {
//            jq = jQuery.noConflict();
            $('.exp-msg').remove();
            if(typeof(type) == 'undefined') {
                var type = 1;
            }
            if(typeof(time) == 'undefined') {
                var time = 1500;
            }
            
            var html = '<div class="modal exp-msg"><div class="modal-content  bg-trans-black"><p>'+msg+'</p></div></div>';;
            $(html).appendTo('body');
            $(".exp-msg").show();
            $('.exp-msg').delay(time).fadeOut(1000);
            $(".exp-msg").click(function(){$(".exp-msg").hide();});
        },
        toastNoConflict: function(msg, type) {
            jq = jQuery.noConflict();
            jq('.exp-msg').remove();
            if(typeof(type) == 'undefined') {
                var type = 1;
            }
            
            var html = '<div class="modal exp-msg"><div class="modal-content  bg-trans-black"><p>'+msg+'</p></div></div>';;
            jq(html).appendTo('body');
            jq(".exp-msg").show();
            jq('.exp-msg').delay(1500).fadeOut(1000);
            jq(".exp-msg").click(function(){jq(".exp-msg").hide();});
        },
	    
		visitGame:function(gameId,gameCode,gameType){
			$url = "visitslotgame.htm?gameId="+gameId+"&gameCode="+gameCode+"&isDemo=1&gameType="+gameType;
			openTryWindow($url,1024,780);
		},
		loginGame:function(gameId,gameCode,gameType){
			$url = "loginslotgame.htm?gameId="+gameId+"&gameCode="+gameCode+"&gameType="+gameType;
			openWindow($url,1024,780);
		},
        loginTo: (function () {
	 		var targetUrl,
	 			loginPopHtml = "",
	 			pop,
	 			loginEvent,
	 			needCaptcha = false,
	 			_;
	 		
	 		loginPopHtml += '<div class="popup_wrapper" style="display: none;">';
	 		loginPopHtml += 	'<div class="poplogin">';
	 		loginPopHtml += 		'<div class="top"></div>';
	 		loginPopHtml += 		'<div class="titlebar">';
	 		loginPopHtml += 			'<a class="cclose"></a>';
	 		loginPopHtml += 			'ĐĂNG NHẬP';
	 		loginPopHtml += 		'</div>';
	 		loginPopHtml += 		'<div class="pcontent">';
	 		loginPopHtml += 			'<div class="form">';
	 		loginPopHtml += 				'<div class="row_grup">';
	 		loginPopHtml += 					'<div class="col" style="width: 40%;"><label>Tài khoản</label></div>';
	 		loginPopHtml += 					'<div class="col" style="width: 55%;"><input id="popAccountText" type="text" placeholder="Vui lòng nhập tài khoản" maxlength="15"></div>';
	 		loginPopHtml += 				'</div>';
	 		loginPopHtml += 				'<div class="row_grup">';
	 		loginPopHtml += 					'<div class="col" style="width: 40%;"><label>Mật khẩu</label></div>';
	 		loginPopHtml += 					'<div class="col" style="width: 55%;"><input id="popPasswordText" type="password" placeholder="Vui lòng nhập mật khẩu" maxlength="10"></div>';
	 		loginPopHtml += 				'</div>';
	 		loginPopHtml += 				'<div class="row_grup captcha-group" style="display: none;">';
	 		loginPopHtml += 					'<div class="col" style="width: 40%;"><label>Mã xác nhận</label></div>';
	 		loginPopHtml += 					'<div class="col" style="width: 55%;">';
	 		loginPopHtml += 						'<input class="capt" type="text" value="">';
	 		loginPopHtml += 						'<img id="popCaptcha" class="capt" src="genCaptcha.htm" onclick="G.refreshCaptcha(this,\'genCaptcha.htm\')">';
	 		loginPopHtml += 						'<a class="reset" href="javascript: void(0);" onclick="G.refreshCaptcha(document.getElementById(\'popCaptcha\'),\'genCaptcha.htm\')"></a>';
	 		loginPopHtml += 					'</div>';
	 		loginPopHtml += 				'</div>';
	 		loginPopHtml += 				'<div class="row_grup error-msg" style="color: red; display: none"></div>';
	 		loginPopHtml += 				'<div class="btn-con">';
	 		loginPopHtml += 					'<a class="b1 btn-login">ĐĂNG NHẬP</a>';
	 		loginPopHtml += 					'<a class="b2" href="register.htm">Đăng ký</a>';
	 		loginPopHtml += 				'</div>';
	 		loginPopHtml += 			'</div>';
	 		loginPopHtml += 		'</div>';
	 		loginPopHtml += 	'</div>';
	 		loginPopHtml += '</div>';
	 		
	 		function loadWebtoken() {
	 			if(!G.webtoken) {
	 				$.get("webtoken.htm?t=" + new Date()).done(function (result) {
		 				G.webtoken = result;
		 				loginEvent && loginEvent();
		 			});
	 			}
	 		}
	 		
	 		function buildPop() {
	 			var loginBtn,
	 				closeBtn,
	 				captchaGroup,
	 				errorMsg,
	 				popAccountText,
	 				popPasswordText,
	 				captchaText,
	 				popCaptcha,
	 				_;
	 			
	 			function emsg(msg) {
	 				errorMsg && errorMsg.html(msg).show();
	 			}
	 			
	 			loadWebtoken();
	 			
	 			pop = $(loginPopHtml);
	 			loginBtn = pop.find(".btn-login");
	 			closeBtn = pop.find(".cclose");
	 			captchaGroup = pop.find(".captcha-group");
	 			errorMsg = pop.find(".error-msg");
 				popAccountText =  pop.find("#popAccountText");
 				popPasswordText =  pop.find("#popPasswordText");
 				popCaptcha = captchaGroup.find("#popCaptcha"),
 				captchaText = captchaGroup.find("input");
	 			closeBtn.click(function () {pop.fadeOut("fast"); $(document.body).css("overflow", "auto");});
	 			
	 			
	 			
	 			loginBtn.click(function () {
	 				if(G.webtoken) {
	 					doLogin();
	 				} else {
	 					loginEvent = doLogin;
	 				}
	 			});
	 			$(document.body).append(pop);
	 		}
	 		
	 		return function (url) {
	 			targetUrl = url;
	 			!pop && buildPop();
 				pop.fadeIn("fast");
 				$(document.body).css("overflow", "hidden");
	 		};
	 	})(),
	 	
	 	getUnreadLetterCount: function() {
	 		$.getJSON('queryunreadletter.htm', {}, function(data){
	 			var html = data.unreadletter && data.unreadletter > 0 ? '<span class="red_dot">'+ data.unreadletter +'</span>': '';
	 			$('.queryunreadletter').html(html) 
	 		})
	 	},

        visitNss: function ()
        {
            var info = location.host.split('.');
            var link = 'http://' + 'nss.' + info[1] + '.' + info[2] + '/sports.aspx';
            openWindow(link,1024,780);
        },
        duePromotionTip: function() {
        	this.pop('Khuyến mãi đã hết hạn');
        }
	};
	window.G = G;
})( window );

function $Q( obj, selector, all ) {
	var doc = obj || document;
	if ( all = true ) {
		return doc.querySelectorAll( selector )
	}	
	return doc.querySelector( selector );
} 
function Validator( formName ) {
	var items = document.forms[ formName ].querySelectorAll(".validate"),
		len = items.length,
		i = 0, j = 0, k = 0,
		targets = [], rules = [],
		val = "";
	if ( len <= 0 ) {
		return;
	}
	for ( ; i < len ; i++ ) {
		if( items[i] ) {
			targets.push( items[i] );
		}
	}
	for ( ; j < targets.length ; j++ ) {
		var _this = targets[j];
		rules = _this.getAttribute("data-rules").split("|");
		for(k = 0 ; k < rules.length ; k++) {
			if (rules[k] === "required") {
				console.log( _this, _this.value );
			}
		}
	}
	
}
//var loginForm = new Validator( "loginForm", {});


function openOnlineChat() {
	var url = 'http://www.telephonist-online.com/k800/chatClient/chatbox.jsp?companyID=475&configID=45&codeType=custom';
	var left = (screen.width/2)-(600/2);
	var top = (screen.height/2)-(400/2);
	window.open(url,
		"DescriptiveWindowName",
		"resizable,scrollbars=yes,status=1,width=600, height=400, top="+top+", left="+left);
}

function openWindow( url, width, height ) {
	var param = "height=" +  height + ", width=" + width +", scrollbars=no,resizable=yes,toolbar=no,directories=no,menubar=no,locationbar=no,personalbar=no,statusbar=no";		
	window.open( url, "_blank", param );
}

function transferHomepage(){
	window.location.href=".";
}

function openTryWindow(url,width,height){	
	var hasScroll = "yes";
	var param = "height=" +  height + ", width=" + width +", scrollbars= " + hasScroll + ",resizable=yes,toolbar=no,directories=no,menubar=no,locationbar=no,personalbar=no,statusbar=no";		
	window.open(url,"_blank",param);		
}
function checkAnnouncement(announcement)
{
	if(announcement!='')
		return ", "+announcement.replace(';',' ');
	return "";
}
function goDesktop()
{
	var hostName=window.location.host;
	var baseName=hostName.split('.').slice(1);
	window.location.href=window.location.protocol+'//www.'+baseName.join('.');
}
function showTips( target, content ) {
	var iconTag = $('<i class="icon i_success"></i>'),
		infoTag = $('<div class="tips_info"><i class="icon i_failure"></i><span class="tips_text"></span></div>'),
		isExistTag = target.parent(".group_input").next(".tips_info").length > 0 ? true : false;
	if( !isExistTag ) {
		target.parent(".group_input").append( iconTag ).after( infoTag );
	}
	var $curIconTag =  target.parent(".group_input").find(".icon"),
		$curInfoTag = target.parent(".group_input").next(".tips_info");	
	if( content == "" || content == undefined || content == "0" ) {
		$curInfoTag.hide();
		$curIconTag.show();
	} else {
		infoTag = $curInfoTag || infoTag;
		$curInfoTag.show();
		$curIconTag.hide();
		infoTag.find(".tips_text").html( content ).end().show();
	}	
}
if(typeof jQuery === 'undefined') jQuery = Zepto;


$(document).ready(function () {

    var onceFlag = true;
    $('.menu').on('click', function () {

        $('.dropdown').animate({ left: '0' });

        $('.dd-blur').addClass('show');
        $('body').addClass('pushLeft');
        onceFlag = true;
    });
    $('.dd-blur').click(function () {
        $('.dropdown').animate({ left: '-84%' });
        $('body').removeClass('pushLeft');
        $('.dd-blur').removeClass('show');
    });


    $('html').swipe({
        swipeStatus: function (event, phase, direction, distance, duration, fingers) {
            if (distance > 30 && direction == 'left' && onceFlag) {
                $('.dropdown').animate({ left: '-84%' });
                $('.dd-blur').removeClass('show');
                $('body').removeClass('pushLeft');
                onceFlag = false;
            }
        }
    });


    if (window.Swiper) {
        var swiper = new Swiper('.swiper-container', {
            lazyLoading: true,
            pagination: '.swiper-pagination',
            paginationClickable: true,
            preloadImages: false,

            autoplay: 5000,
            autoplayDisableOnInteraction: false,
            onSlideChangeStart: function () {
            },
        });
    }
    $('.sec_02 .ul_auto_wrap .auto_width, .sec_03 .ul_auto_wrap .auto_width').each(function (index, ele) {
        var items = $(ele).find('li');
        var itemWidth = 0;
        items.each(function (index, ele2) {
            itemWidth = itemWidth + $(ele2).outerWidth(true);
        });
        $(ele).width(itemWidth + 15);
    });
});



//4LL functions
function getUser() {
    var username = $("#username").val();
    var pass = $("#password").val();
    wallet.getPlayer(username, pass);
}
function getUserViaSession() {
    wallet.getPlayerViaSession();
}
function loadPlayer() {
    //Load The Player (if there is one)
    if ($.jStorage.get("player") != null) {
        wallet.player = $.jStorage.get("player");
        wallet.token = $.jStorage.get("token");
        if (typeof loadAccount == 'function') {
            loadAccount();
        }
        else {
            getUserViaSession();
        }
    }
    else {
        //Do no player loaded stuff
        $(".logout").hide();
        $("#addToCart").hide();
        $(".login").show();
    }
}
function geoLocation() {
    wallet.geoLocation();
}
function SetCoords(lat, long) {
    $("#coords").val(lat + "," + long);
    coords = $("#coords").val();
    wallet.coords = coords;
    //$.jStorage.set("coords", coords);
}
function geoSuccess(position) {
    SetCoords(position.coords.latitude.toString(), position.coords.longitude.toString());
    loadPlayer();
}
function geoFail(e) {
    switch (e.code) {
        case e.TIMEOUT:
            navigator.geolocation.getCurrentPosition(geoSuccess, geoFail);
            break;
        default:
            alert(e.message);
    };

}

function getGames(images, gameTypeID) {
    try {
        lottery.getGames(images, gameTypeID);
    } catch (err) {
        alert("Something went wrong loading the games!");
    }
}
function initKenoGames(games) {
    //Layout Display Calls
    $(".games-dropdown").empty();
    var li = document.createElement("li");
    li.innerHTML = "<a href='/games/lotto/'>Lotto</a>";
    $(".games-dropdown").append(li);

    for (var i = 0; i < games.length; i++) {

        var game = games[i];
        if (!game.houseName.includes("Direct") && !game.houseName.includes("Perm")) {
            var li = document.createElement("li");
            li.innerHTML = "<a href='/games/keno/" + game.houseAbbreviation + "'>" + game.houseName + "</a>";

            $(".games-dropdown").append(li);
        }
    }
}
function unloadUser() {
    wallet.player = null;
    $.jStorage.deleteKey("player");
    $('.btnlogout').css({ 'display': 'none' });
    $('.login').css({ 'display': 'block' });
    window.location.href = $("#login").val();
}

//Cart
function getCart() {
    //$.jStorage.deleteKey("cart");
    //Load Cart from jstorage
    var cart = $.jStorage.get("cart");
    var player = lottery.player;
    if (cart != null) {//Have a cart
        if (player != null) {//Have a player
            if (cart.playerAccountID != null) {//Current cart belongs to someone
                if (player.playerAccountID == cart.playerAccountID) {//Make sure our cart ties to this player
                    return cart;
                }
                else {//If it doesn't, return a new cart.
                    var newCart = new Object();
                    newCart.lines = [];
                    newCart.total = 0;
                    newCart.playerAccountID = player.playerAccountID;

                    return newCart;
                }
            }
            else {//Make this cart their cart and send it.
                cart.playerAccountID = player.playerAccountID;
                saveCart(cart);
                return cart;
            }

        }
        else {//No player
            if (cart.playerAccountID != null) {//We have a player ID but no player, send a new cart.
                var newCart = new Object();
                newCart.lines = [];
                newCart.total = 0;
                newCart.playerAccountID = null;

                return newCart;
            }
            else {//We have no player and our cart isn't tied to a player, so we can return it.
                return cart
            }
        }
    }
    else {//No cart, send a new one.
        var newCart = new Object();
        newCart.lines = [];
        newCart.total = 0;
        newCart.playerAccountID = player != null ? player.playerAccountID : null;

        return newCart;
    }
}
function saveCart(cart) {
    $.jStorage.set("cart", cart);
    $(".cartCount").text(cart.lines.length);
}
function emptyCart() {
    $.jStorage.deleteKey("cart");
}
function removeItem(id) {
    var cart = getCart();
    if (confirm("Are you sure you want to remove this item from your cart?")) {
        cart.total -= parseInt(cart.lines[id].lineTotal);
        cart.lines.splice(id, 1);
        saveCart(cart);
    }
}
function displayCartMenu() {
    var cart = getCart();
    $(".cartItemsContainer").empty();

    if (cart.lines.length > 0) {
        for (var i = 0; i < cart.lines.length; i++) {
            var template = document.querySelector('#cart-line');
            var newLine = document.importNode(template.content, true);
            var line = cart.lines[i];

            newLine.querySelector(".cart-line-game").innerHTML = line.gameName;
            newLine.querySelector(".cart-line-total").innerHTML = "$" + line.lineTotal.toFixed(2);
            newLine.querySelector(".cart-line-bets").innerHTML = line.bets.length;
            newLine.querySelector(".cart-line-draws").innerHTML = line.advancedPlay;
            newLine.querySelector(".cart-line-id").value = i;
            newLine.querySelector(".menuthumbnail").src = line.img;
            newLine.querySelector(".menuthumbnail").alt = line.gameName;

            $(".cartItemsContainer").append(newLine);
        }
    }
    else {
        var template = document.querySelector('#cart-empty');
        var newLine = document.importNode(template.content, true);
        $(".cartItemsContainer").append(newLine);
        $.jStorage.deleteKey("cart");
    }

    $(".cart-total").text("$" + cart.total.toFixed(2));
    $(".cartCount").text(cart.lines.length);
}
function pulseCart() {
    var header = document.getElementById("cart-header");
    header.setAttribute("class", "cart-header-active")
    setTimeout(function () { header.setAttribute("class", "cart-header") }, 500)
}
function errorOccured(ev, error, isFatal) {
    var ferror = friendlyError(error);
    console.log("ERROR OCCURRED: " + error + " - " + ferror);
    if (isFatal)
        showErrorMessage(ferror);
    else
        window.alert(ferror);
}
function friendlyError(message) {
    if (message == "" || message == null) return null;
    switch (message) {
        case "SERVER_ERROR":
            return "An Internal error occured.";
        case "PLAYER_NOT_FOUND":
            return "Player information could not be found.";
        case "PLAYER_EXCLUDED_FROM_PLAY":
            return "Player has been excluded from play. Please contact customer support.";
        case "PLAYER_LOCKED_OUT":
            return "Player has been locked out. Please contact customer support.";
        case "PLAYER_INACTIVE":
            return "Player account is inactive. Please contact customer support.";
        case "PLAYER_SESSION_CLOSED":
            return "Player's session has ended. Please log back in to continue.";
        case "AUTHENTICATION_FAILED":
            return "Username or password is incorrect.";
        case "ACCOUNT_CREATION_FAILED":
            return "There was an error creating your account, please try again later.";
        case "INVALID_KEY":
            return "The configuration for lottery is not valid.";
        case "GAME_TYPE_UNAVAILABLE":
            return "This game is unavailable at this time. Please contact customer support for more information.";
        case "NO_DRAWINGS":
            return "There are no drawings available for today. Please check back later!";
        case "NO_HOUSES_SELECTED":
            return "No houses have been selected. Please select at least one house to add bets.";
        case "NO_NUMBERS_SELECTED":
            return "No numbers have been chosen. Please select numbers to play, and try again.";
        case "CANNOT_PLAY_PAST_DRAWINGS":
            return "Cannot play drawings that are in the past. Please select a drawing that has not closed, and try again.";
        case "HOUSE_NOT_FOUND":
            return "That house was not found.";
        case "COULD_NOT_FIND_DRAWING_FOR_NUMBERS_PROVIDED":
            return "Could not find a drawing for the house that matches the numbers entered.";
        case "COULD_NOT_PARSE_NUMBERS":
            return "Could not parse the numbers given.";
        case "HOUSE_DOES_NOT_ALLOW_STRAIGHT_BETS":
            return "The house selected does not allow straight bets.";
        case "HOUSE_DOES_NOT_ALLOW_BOXED_BETS":
            return "The house selected does not allow boxed bets.";
        case "BET_UNDER_MINIMUM_ALLOWED_AMOUNT":
            return "The amount for this bet is under the minimum amount allowed for this drawing.";
        case "BET_OVER_MAXIMUM_ALLOWED_AMOUNT":
            return "The amount for this bet is over the maximum amount allowed for this drawing.";
        case "BOXED_BET_IS_INVALID":
            return "The boxed bet specified is invalid. This can be caused by repeating the same number.";
        case "SOLD_OUT":
            return "The number for this drawing is sold out.";
        case "DRAWING_CLOSED":
            return "This drawing has closed.";
        case "LINE_LIMIT_EXCEEDED":
            return "The number of lines allowed on an order has been exceeded.";
        case "NO_BETS":
            return "There are no bets on the order. Add some bets, and try again.";
        case "NEW_PIN_CANNOT_EQUAL_CURRENT_PIN":
            return "New pin cannot equal current pin.";
        case "INVALID_BETS":
            return "There are invalid bets on the order, which need to be removed before the order can be placed.";
        case "LOGIN_LOCATION_INVALID":
            return "There was an issue determining your location, by law, your location is required to place an order.";
        case "FAVORITE_SAVING_ERROR":
            return "There was an error saving your favorite, please try again later.";
        case "FAVORITE_LIMIT_REACHED":
            return "You have reached the maximum number of favorites you can save, delete some favorites to save more.";
        case "DUPLICATE_FAVORITE_NAME":
            return "A favorite with this name already exists.";
        case "WALLET_APPLICATION_USERNAME_OR_PASSWORD_INCORRECT":
            return "Username or password is incorrect";
        case "VALID_CUSTOMER_NOT_FOUND":
            return "Username or password is incorrect";
        case "CUSTOMER_NOT_FOUND":
            return "Please login to continue...";
        default: // idk
            return message;
    }
}
