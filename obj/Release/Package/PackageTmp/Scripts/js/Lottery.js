/*

		Lottery JS
		For use with 4LeafLotto.
		Encapsulates usage in an easy-to-use interface.

		Requires jQuery 1.9 or later.

		It is recommended that this file is not edited. Rather, as this handles more than one type of lottery (standard lottery, 
		keno, bigball, rafflelottery) and can potentially handle future lottery types, other javascript files can interface from this
		directly since each lottery type can have wildly different recommended user interfaces. In other words, while the base 
		functionality is a "one-size-fits-all", the user interface should be specialized for the type of lottery being used.

		To load:
		var lotto = lotteryInit(baseUrl, jQuery, initialToken, gameTypeID, key);
		• baseUrl: path to the 4LL lottery domain (usually something like https://lottery.something.com) - leave off end forwward-slash
		• jQuery: literally pass in the jQuery object (or $, your call)
		• initialToken: A ONE TIME USE token used to identify a customer. The token must be invalidated after.
		• gameTypeID: 1=Lotto, 2=Keno, 3=Bigball, 4=RaffleLottery
		• key: Franchise key given to you that matches the customer's franchise.

		Methods Available:
        •	getGames(getImages, gameType) – Retreives the games and their information for the specified gameType.
        •	placeBets(bets, gameTypeIDs, gameType) – Bets passed in will be validated and any errors will be returned.
        •	placeOrder(bets, gameType) – Places an order with the provided information, validation will happen here as well.
        •	transactionHistory(page_size, page) – Returns a collection of transactions for the player.
        •	orderDetails(orderID)  - Returns the details of the specified order.
        •	voidOrder(orderID) – Voids specified order. 
        •	getFavorites(gameType) - Returns an array of the player’s favorites bets for the specified gametype
        •	saveFavorite(favName, bets, gameType) – save the bets specified as a favorite.
        •	deleteFavorite(favID, gameType) – delete the specified bet
        •	addFavorite(favID, gameType) – validates the bets in the favorite and returns them as a collection. 
        •	getWinningResults() – Returns the winning numbers for all drawings of game type 3 (Bigball)


		Events Raised:
        •	getGamesCalled(ev, games, gameType)
        •	placedBetsCalled(ev, bets, valid, respBets)
        •	orderPlacedCalled(ev, wasSuccessful)
        •	getTransactionHistoryCalled(ev, transactionHistory)
        •	getOrderDetailsCalled(ev, orderDetails)
        •	voidOrderCalled(ev, wasSuccessful) 
        •	favoriteCollectionModified(ev, favorites) 
        •	winningNumbersLoaded(ev, results) 
	*/

var lotteryInit = (function (baseUrl, _$, key, currencyCulture, languageCulture) {
    "use strict";

    // Private vars
    var baseURI = baseUrl + "/api/lotteryapi"; //"/api/lottery/v2";
    var currentBets = [];
    var favorites = [];
    var winningNumberResult = [];
    var addBetCounter = 0;
    var token = null;
    var gameType = 3;
    var fkey = key; // franchise key
    var drawings = null;
    var advancedPlay = 1;
    var $ = _$;
    var cculture = currencyCulture || "en-US";
    var lculture = languageCulture || currencyCulture;
    var that = this;
    // Events raised (no magic strings lol)
    var EVENT_ERROR_OCCURRED = "errorOccurred";
    var EVENT_INTERNET_BUSY = "internetCallBusy";
    var EVENT_INTERNET_NOT_BUSY = "internetCallNotBusy";
    var EVENT_GET_GAMES_CALLED = "getGamesCalled";
    var EVENT_PLACE_BETS_CALLED = "placeBetsCalled";
    var EVENT_ORDER_PLACED = "orderPlacedCalled";
    var EVENT_PLAYER_LOADED = "loadPlayerCalled";
    var EVENT_SERVER_TIME_UPDATED = "serverTimeUpdated";
    var EVENT_WINNING_NUMBERS_LOADED = "winningNumbersLoaded";
    var EVENT_TRANSACTION_HISTORY_CALLED = "getTransactionHistoryCalled";
    var EVENT_ORDER_DETAILS_CALLED = "getOrderDetailsCalled";
    var EVENT_FAVORITE_COLLECTION_MODIFIED = "favoriteCollectionModified";

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
    function makeNumbersArray(bets, makeExtraNumbers) {
        makeExtraNumbers = typeof makeExtraNumbers !== 'undefined' ? makeExtraNumbers : false;

        var numbers = [];
        for (var i = 0; i < bets.length; i++) {
            var betNums = (makeExtraNumbers ? bets[i].extraBallNumbers : bets[i].numbers);
            numbers.push(betNums);
        }

        return numbers;
    }
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

    ////API Calls

    //Returns all games based on game type
    this.getGames = function (getImages, getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/getDrawings";
        var data = {
            Key: fkey,
            Culture: lculture,
            GameType: getGameType != null ? getGameType : gameType,//Used the passed in type or the one lotto was initilized with.
            IncludeImages: getImages
        }
        try {
            $.post(url, data, function (resp) {
                if (resp == null) {
                    $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
                }
                else {
                    serverTimeLocal = resp.serverTimeLocal;
                    serverTimeUTC = resp.serverTimeUTC;
                    drawings = resp.drawings;
                    $m.trigger(EVENT_GET_GAMES_CALLED, [drawings, getGameType != null ? getGameType : gameType]);
                }
            }).fail(function (response) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            });
        } catch (err) { throw err; }
    }

    //Parses and validates bets, then returns errors.
    this.placeBets = function (bets, gameTypeIDs, getGameType, sbet,bbet) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/parseBets";
        var data = {
            // BaseRequest Variables
            Key: fkey,
            Token: token,
            Culture: lculture,
            // ParseBetRequest Variables
            LotteryGameTypeIDs: gameTypeIDs != null ? gameTypeIDs : [gameID],
            Numbers: makeNumbersArray(bets),
            ExtraNumbers: makeNumbersArray(bets, true),
            StraightBet: sbet,//bets[0].isBoxed ? 0 : bets[0].amount,
            BoxedBet: bbet,//bets[0].isBoxed ? bets[0].amount : 0,
            CurrencyCulture: cculture,
            GameTypeID: getGameType != null ? getGameType : gameType,//Used the passed in type or the one lotto was initilized with.
            AdvancedPlay: bets[0].advancedPlay
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                $m.trigger(EVENT_SERVER_TIME_UPDATED);
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                $m.trigger(EVENT_PLACE_BETS_CALLED, [bets, resp.wasSuccessful, resp.bets, resp.message]);
            }
        });
    }

    //Places the order for bets. Returns Success or Fail
    this.placeOrder = function (bets, getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/placeOrder";
        var data = {
            Key: fkey,
            Culture: lculture,
            Bets: bets,
            UniqueID: this.uniqueID,
            Player: this.player,
            StaffID: null,
            GameType: getGameType != null ? getGameType : gameType,//Used the passed in type or the one lotto was initilized with.,,
            AdvancedPlay: advancedPlay,
            Token: lottery.token,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;

                lottery.token = resp.lotteryToken;
                //wallet.token = resp.token;
                $m.trigger(EVENT_SERVER_TIME_UPDATED);
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                $m.trigger(EVENT_ORDER_PLACED, [resp.wasSuccessful, resp.orderID]);
            }
        });
    }

    // Returns Transaction History
    this.transactionHistory = function (page_size, page) {
        var $m = $(that);
        var url = baseURI + "/transactionHistory";
        var data = {
            Key: fkey,
            Culture: lculture,
            Player: this.player,
            PageSize: page_size,
            Page: page,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                $m.trigger(EVENT_TRANSACTION_HISTORY_CALLED, [resp.transactionHistory]);
            }
        });
    }

    // Returns Order Details
    this.orderDetails = function (orderID) {
        var $m = $(that);
        var url = baseURI + "/orderDetails";
        var data = {
            Key: fkey,
            Culture: lculture,
            Player: this.player,
            OrderID: orderID,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                $m.trigger(EVENT_ORDER_DETAILS_CALLED, [resp.orderDetails]);
            }
        });
    }

    // Voids An Order	
    this.voidOrder = function (orderID) {
        var $m = $(that);
        var url = baseURI + "/voidOrder";
        var data = {
            Key: fkey,
            Culture: lculture,
            Player: this.player,
            OrderID: orderID,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                $m.trigger(EVENT_VOID_ORDER_CALLED, [resp.orderID]);
            }
        });
    }

    //Gets an array of the user's favorites
    this.getFavorites = function (getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/getFavorites";
        var data = {
            Key: fkey,
            Culture: lculture,
            Token: wallet.token,
            GameTypeID: getGameType,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                favorites = resp.favorites;
                $m.trigger(EVENT_FAVORITE_COLLECTION_MODIFIED, [favorites]);
            }
        });
    }

    //Saves a bet as a Favorite
    this.saveFavorite = function (favName, bets, getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/saveFavorite";
        var data = {
            Key: fkey,
            GameTypeID: getGameType,
            Culture: lculture,
            Token: wallet.token,
            FavName: favName,
            Bets: bets
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    favorites = resp.favorites;
                    $m.trigger(EVENT_FAVORITE_COLLECTION_MODIFIED, [favorites]);
                }
            }
        });
    }

    //Deletes the passed in favorite
    this.deleteFavorite = function (favID, getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/deleteFavorite";
        var data = {
            Key: fkey,
            Culture: lculture,
            favID: favID,
            Token: wallet.token,
            GameTypeID: getGameType,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                favorites = resp.favorites;
                $m.trigger(EVENT_FAVORITE_COLLECTION_MODIFIED, [favorites]);
            }
        });
    }

    //Add Selected Favorite to the order as a bet.
    this.addFavorite = function (favID, getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/addFavorite";
        var data = {
            Key: fkey,
            DrawDate: new Date().toDateString(),
            CurrencyCulture: cculture,
            GameTypeID: getGameType,
            Culture: lculture,
            Token: wallet.token,
            FavID: favID
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                $m.trigger(EVENT_SERVER_TIME_UPDATED);
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                $m.trigger(EVENT_PLACE_BETS_CALLED, [resp.bets, resp.wasSuccessful, resp.bets]);
            }
        });
    }

    //Returns the winning numbers for a specific game going back 7 days
    this.getWinningResults = function (getGameType) {
        if (typeof getGameType == 'undefined') { getGameType = gameType; }
        var $m = $(that);
        var url = baseURI + "/winningNumbersList";
        var data = {
            Key: fkey,
            Culture: lculture,
            GameTypeID: getGameType,
            LotteryGameTypeID: gameID,
            Count: 7
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                $m.trigger(EVENT_SERVER_TIME_UPDATED);
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                $m.trigger(EVENT_WINNING_NUMBERS_LOADED, [resp.winningNumberResult]);
            }
        });
    }

    return this;
});