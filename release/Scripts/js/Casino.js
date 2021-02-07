$(function () {
	games = new gamesInit(gamurl, jQuery, fkey);
	var $l = $(lottery);
	var $w = $(wallet);
	var $g  = $(games);

	var playerLoaded = false;

	$l.on("errorOccurred", function (ev, error, isFatal) {
		errorOccured(ev, error, isFatal);
	});
	$w.on("errorOccurred", function (ev, error, isFatal) {
		//errorOccured(ev, error, isFatal);
	});
	//$g.on("errorOccurred", function (ev, error, isFatal) {
	//	errorOccured(ev, error, isFatal);
	//});
	$w.on("loadPlayerCalled", function (ev, player) {
		if (player != null) {
			$.jStorage.set("player", player);
			if (wallet.token != null) {
				$.jStorage.set("token", wallet.token);
			}
			playerLoaded = true;
			$(".real-play").removeClass("disabled")
		}
	});
	$g.on("listCalled", function (ev, resp) {
		//$.jStorage.set("token", wallet.token);
		if (resp.wasSuccessful) {
			var games = resp.games;
			for (var i = 0; i < games.length; i++) {
				var game = games[i];

				var op = "<li class='list-group-item col-xs-2'><h3></h3>" + game.name + "<br />";
				if (game.imageBase64 != null && game.imageBase64 != "")
					op += "<img src='data:" + game.imageBase64 + "' alt='" + game.name + "' /><br/ >";
				if (game.hasFreePlay == true)
					op += "<a href='#' class='btn btn-sm btn-primary free-play' onclick='play(true,\"" + game.gameKey + "\",true,false);'>Free Play</a>";
				if (wallet.player != null)
					op += "<a href='#' class='btn btn-sm btn-primary real-play" + (playerLoaded ? "" : " disabled") + "' onclick='play(false,\"" + game.gameKey + "\",true,false);'>Play</a>";
				op += "</li>";

				$("#games-list").append(op);
			}
		}
		else {
			errorOccured(ev, resp.message);
		}
	});
	$g.on("playCalled", function (ev, resp) {
		$.jStorage.set("token", wallet.token);
		if (resp.wasSuccessful) {
			//var popup = window.open(resp.redirectURL, "_blank");
			//popupBlockerChecker.check(popup);
			//$.featherlight({iframe: resp.redirectURL, iframeWidth: 1100, iframeHeight: 800});
			window.location.href = resp.redirectURL;
		}
		else {
			errorOccured(ev, resp.message);
		}
	});
	//if ($.jStorage.get("player") != null) {
	//	wallet.player = $.jStorage.get("player");
	//	wallet.token = $.jStorage.get("token");
	//	getUserViaSession();
	//}
    list("Slots", "mr_slotty", true, true, 150, 150);  //commented on 09-jan-2019
});

function initPage() {

}

function getUserViaSession() {
	wallet.getPlayerViaSession();
}

function list(byCategory, byVendor, showHiddenGames, showImages, desiredImageWidth, desiredImageHeight, pageSize, currentPage) {
	//games.list(byCategory, byVendor, showHiddenGames, showImages, desiredImageWidth, desiredImageHeight, pageSize, currentPage); //Commented on 09-jan-2019
}

function play(freeplay, gameKey, testingSandbox, isMobile) {
	if ($.jStorage.get("player") != null) {
		wallet.player = $.jStorage.get("player");
		wallet.token = $.jStorage.get("token");
		//getUserViaSession();
	}
	layer.open({ type: 2, shadeClose: false });
	games.play(freeplay, gameKey, testingSandbox, isMobile);
}

function errorOccured(ev, error, isFatal) {
	var ferror = friendlyError(error);
	console.log("ERROR OCCURRED: " + error + " - " + ferror);
	if (isFatal)
		showErrorMessage(ferror);
	else
		window.alert(ferror);
}

var popupBlockerChecker = {
        check: function(popup_window){
            var _scope = this;
            if (popup_window) {
                if(/chrome/.test(navigator.userAgent.toLowerCase())){
                    setTimeout(function () {
                        _scope._is_popup_blocked(_scope, popup_window);
                     },200);
                }else{
                    popup_window.onload = function () {
                        _scope._is_popup_blocked(_scope, popup_window);
                    };
                }
            }else{
                _scope._displayError();
            }
        },
        _is_popup_blocked: function(scope, popup_window){
            if ((popup_window.innerHeight > 0)==false){ scope._displayError(); }
        },
        _displayError: function(){
            alert("Popup Blocker is enabled! Please add this site to your exception list.");
        }
    };
