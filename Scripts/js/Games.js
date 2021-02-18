/*

		Games JS
		For use with 4LeafLotto.
		Encapsulates usage in an easy-to-use interface.

		Requires jQuery 1.9 or later.

		It is recommended that this file is not edited. Rather, as this handles more than one type of game , other javascript files can interface from this
		directly since each lottery type can have wildly different recommended user interfaces. In other words, while the base 
		functionality is a "one-size-fits-all", the user interface should be specialized for the type of lottery being used.

		To load:
		var game = gameInit(baseUrl, jQuery, initialToken, key);
		• baseUrl: path to the 4LL games domain (usually something like https://games.something.com) - leave off end forwward-slash
		• jQuery: literally pass in the jQuery object (or $, your call)
		• initialToken: A ONE TIME USE token used to identify a customer. The token must be invalidated after.
		• key: Franchise key given to you that matches the customer's franchise.

		Methods Available:
        •	list(byCategory, byVendor, showHiddenGames, showImages, desiredImageWidth, desiredImageHeight, pageSize, currentPage) – Retreives a list of games to launch
        •	play(freeplay,gameKey,testingSandbox,isMobile) – returns a url to launch the game



		Events Raised:
        •	listCalled(ev, resp)
        •	playCalled(ev, resp)

	*/

var gamesInit = (function (baseUrl, _$, key, currencyCulture, languageCulture) {
    "use strict";

    // Private vars
    var baseURI = baseUrl + "api/PlayerPortalAPI"; //"/api/games/v2";
    var fkey = key; // franchise key
    var $ = _$;
    var cculture = currencyCulture || "en-US";
    var lculture = languageCulture || currencyCulture;
    var that = this;
    // Events raised (no magic strings lol)
    var EVENT_ERROR_OCCURRED = "errorOccurred";
    var EVENT_INTERNET_BUSY = "internetCallBusy";
    var EVENT_INTERNET_NOT_BUSY = "internetCallNotBusy";
    var EVENT_LIST_CALLED = "listCalled";
    var EVENT_PLAY_CALLED = "playCalled";

    // Internal general functions ///////////////////////////////////////////////////////////////////////////////
    function isNumber(o) {
        return !isNaN(o - 0) && o !== null && o !== "" && o !== false;
    }
    function guid() {
        // http://stackoverflow.com/a/8809472/607117
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    function jsround(num) {
        return Math.round((num * 100) + 0.00001) / 100;
    }
    // helper methods ////////////this might be obsolete////////////////////////////////////////////////////////

    // Internal op-specific methods ////////////////////////////////////////////////////////////////////////////

    //// PUBLIC PROPERTIES AND METHODS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //// Sent in with the order, used to detect if the same order was attempted to be submitted more than once.
    this.uniqueID = guid();
    // Times from server - populated on first call to server
    var serverTimeUTC = null;
    var serverTimeLocal = null;

    //// Returns the last-retrieved server time, both local and UTC
    this.getServerTime = function () {
        return {
            local: serverTimeLocal,
            utc: serverTimeUTC
        };
    }

    this.list = function (byCategory, byVendor, showHiddenGames, showImages, desiredImageWidth, desiredImageHeight, pageSize, currentPage) {
        var $m = $(that);
        var url = baseURI + "/list";
        var data = {
            Key: fkey,
            Culture: lculture,
            Token: wallet.token,
            ByCategory: byCategory,
            ByVendor: byVendor,
            ShowHiddenGames: showHiddenGames,
            ShowImages: showImages,
            DesiredImageWidth: desiredImageWidth,
            DesiredImageHeight: desiredImageHeight,
            PageSize: pageSize,
            CurrentPage: currentPage
        }
        try {
            $.post(url, data, function (resp) {
                if (resp == null) {
                    $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
                }
                else {
                    serverTimeLocal = resp.serverTimeLocal;
                    serverTimeUTC = resp.serverTimeUTC;
                    //drawings = resp.drawings;
                    wallet.token = resp.token;
                    $m.trigger(EVENT_LIST_CALLED, [resp]);
                }
            }).fail(function (response) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            });
        } catch (err) { throw err; }
    }

    this.play = function (freeplay, gameKey, testingSandbox, isMobile) {

        var PlayerID = $.jStorage.get("PlayerID");
        if (PlayerID == null) {
            // window.location.href = $("#lobby").val();
            window.location.href = "/home/index";
        }
        else {
            var OTP = $.jStorage.get("OTP");
            var Player = $.jStorage.get("Player");
            var Account = $.jStorage.get("Account");
            var Currency = Account.Currency;
            var CardNumber = $.jStorage.get("CardNumber");
            var UserName = Player.Name;

            var $m = $(that);
            var url = baseURI + "/LaunchGame";
            var data = {
                Key: fkey,
                OTP: OTP,
                CardNumber: CardNumber,
                Currency: Currency,
                UserName: UserName

            };

            $.post(url, data, function (resp) {
                if (resp == null) {

                    $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
                }
                else {
                    serverTimeLocal = resp.serverTimeLocal;
                    serverTimeUTC = resp.serverTimeUTC;
                    //$m.trigger(EVENT_SERVER_TIME_UPDATED);
                    wallet.token = resp.token;
                    if (resp.wasSuccessful == false) {
                        $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                    }
                    else {
                        $.jStorage.set("OTP", resp.OTP);
                        $.jStorage.set("VigDns", resp.VigDNS);
                        wallet.VIGDNS = $.jStorage.set("VigDns", resp.VigDNS);
                        window.location.href = "/home/lobby";

                    }
                    //  $m.trigger(EVENT_PLAY_CALLED, [resp]);
                }
            });
        }
    }

    return this;
});