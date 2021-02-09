/**
 * VIEW GLOBALS.JS FOR GLOBAL VARIABLES
 */
var globalGames = null;
$(function () {
	var $l = $(lottery);
	var $w = $(wallet);

	$l.on("errorOccurred", function (ev, error, isFatal) {
		errorOccured(ev, error, isFatal);
		removeOldBets();
	});

	$w.on("errorOccurred", function (ev, error, isFatal) {
		errorOccured(ev, error, isFatal);
	});

	$w.on("inactivityTimeoutEvent", function (ev) {
		unloadUser();
		if (typeof displaySignInUp == 'function') {
			displaySignInUp();
		}
		checkUI();
	});

	$l.on("getGamesCalled", function (ev, games, gameType) {
		switch (gameType) {
			case 1:
				initLottoGames(games);
				checkUI();
				break;
		}
	});

	$l.on("placeBetsCalled", function (ev, bets, valid, respBets, message) {
		if (valid) {
			var storedBets = $.jStorage.get("lotto-bets") != null ? $.jStorage.get("lotto-bets") : [];
			if (message != null && message != "")
				alert(message);

			var finalBets = storedBets.concat(respBets);
			// Update all the ids for the removal indexing;
			for (var i = 0; i < finalBets.length ; i++) {
				finalBets[i].id = i;
			}
			saveBets(finalBets);
			replaceBets(finalBets);
			console.log("Save bet collection to persistent storage");
			clearNumbers();
		}
	});

	$l.on("orderPlacedCalled", function (ev, wasSuccessful, orderID) {
		if (wasSuccessful) {
			getUserViaSession();
			updateBalance();
			$.jStorage.set("player", lottery.player);
			$(".welcome-text").text("Welcome " + lottery.player.username + "! ($" + lottery.player.balance + ")");
			smallNotification("Order #" + orderID + " placed successfully!");
			$("#bettotal").text(currencySymbol + parseFloat(betTotal()).toFixed(numDecimals) + "");
			$("#betcount").text(0 + " bets");
			saveBets([]);
			replaceBets([]);
			clearOrderEntryFields();
		}
		else {
		}
	});

	$l.on("favoriteCollectionModified", function (ev, favorites) {
		$("#custFav").empty();
		$("#favName").val("");
		addFavorites(favorites);
	});

	$w.on("loadPlayerCalled", function (ev, player) {
		if (player != null) {
			$.jStorage.set("player", player);
			if (typeof displayPlaceOrderBtn == 'function') {
				displayPlaceOrderBtn();
			}
			wallet.getLotteryToken();
		}
	});

	$w.on("getLotteryTokenCalled", function (ev, resp) {
		if (resp.wasSuccessful) {
			wallet.token = resp.token;
			lottery.token = resp.lotteryToken;
			$.jStorage.set("token", resp.token);
			checkUI();
			if (typeof getFavorites == 'function') {
				getFavorites();
			}
		}
	});

	//getGames(false, 1);
	initPage();
	loadBets(true);
	if ($.jStorage.get("player") != null) {
		lottery.player = $.jStorage.get("player");
		getUserViaSession();
	}
});

function initPage() {
	// Set up the UI /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$(".cart").hide();
	// Hide message dialogs
	$("#errorMessage,#busy").hide();

	// Hide the pop-up dialogs
	$("#placeOrder_Result,#transactionHistory,#orderDetails").hide();

	// Add bet action
	$("#addbet-action").on("click", function () {
		//var selectedDraws = $("#drawing-list div:has(input:checked)");//.map(function (a) { return $("#drawing-list div:has(input:checked)")[0].drawing.houseAbbreviation; }).toArray() || null;
		var selectedDraws = $(".selectable-drawing-item").has('input:checked');
		var gameTypeIDs = [];
		var nums = $("#numbers").val() || null;
		var sbet = $("#straightAmount").val() != "" ? $("#straightAmount").val() : "0";
		var bbet = $("#boxedAmount").val() != "" ? $("#boxedAmount").val() : "0";
		if (selectedDraws.length <= 0) {
			smallNotification("Select at least one house first.");
		} else if (sbet == null && bbet == null) {
			smallNotification("Straight and/or boxed bet missing.");
		}
		else if (nums == null) {
			smallNotification("Numbers must be chosen.");
		}
		else {
			// Parse out the houses own array;
			var houses = [];
			for (var i = 0; i < selectedDraws.length; i++) { // did start at 1
				var house = new Object();
				var hAbbr = $(selectedDraws[i]).find("input").attr("id").replace("house_", "").toString();
				var hName = $("#drawing-list div:has(input:checked) label[for=\"" + $(selectedDraws[i]).find("input").attr("id") + "\"]").text();
				house.houseAbbreviation = hAbbr;
				house.houseName = hName;

				houses.push(house);
				gameTypeIDs.push(hAbbr);
			}

			// Parse out the numbers into an array of arrays: basically string[][]
			var numbers = [];
			// Split the numbers apart based on the user possibly entering them sepatated by commas (ex. nums = '123,456,789')
			var hold = nums.split(",");
			// We now have an array of all the bet numbers (ex. array = ['123', '456', '789'])
			for (var i = 0; i < hold.length; i++) {
				//Split the individual numbers by character to add to the numbers array[][] (ex. numbers = ['1','2','3'],['4','5','6'],['7','8','9'])
				numbers.push(hold[i].split(""));
			}
			// Call AddBets
			var bets = makeLotteryBets(houses, numbers, sbet.replace("$", ""), bbet.replace("$", ""));
			lottery.placeBets(bets, gameTypeIDs, 1); // AdvancedPlay = 1

		}
		return false;
	});

	$(".invalidBets a").click(function () {
		lottery.removeInvalidBets();
		return false;
	});

	// Cancel order action
	$("#cancel-order").on("click", function () {
		askCancelOrder();
	});
	$("#cancel-order-trash").on("click", function () {
		askCancelOrder();
	});

	// Place order action
	$("#place-order").on("click", function () {

		placeOrder();
	});

	// View transaction history action
	$("#transaction-history").on("click", function () {
		ShowTransactionHistory(25, 1); // page_size, page
	});

	//Add Favorite to bets action
	$("#addfavorite-action").on("click", function () {
		var favID = $("#custFav").val();
		if (favID == null || favID <= 0) return false;
		//loading("Adding favorite to order.");
		lottery.addFavorite($("#custFav").val(), 1);
	});

	//Delete favorite action
	$("#deletefavorite-action").on("click", function () {
		//loading("Deleting favorite.");
		var selectedFavorite = $("#custFav").val();
		if (selectedFavorite == undefined || selectedFavorite == null || selectedFavorite == '') {
			return false;
		}
		var confirmDel = confirm("Are you sure you want to delete the favorite named '" + $("#custFav").text() + "'?");
		if (confirmDel) {
			lottery.deleteFavorite(selectedFavorite, 1);
		};
	});

	//Save favorite action
	$("#savefavorite-action").on("click", function () {
		var bets = getbets();
		var name = $("#favName").val();
		if (name != undefined && name != null && name != "") {
			if (bets.length > 0) {
				var confirmSave = confirm("Are you sure you want to save this order as a favorite?");
				if (confirmSave) {
					var storedBets = $.jStorage.get("lotto-bets") != null ? $.jStorage.get("lotto-bets") : [];
					lottery.saveFavorite(name, storedBets, 1);
				};
			}
			else { smallNotification("Please place some bets before saving a favorite."); }
		}
		else {
			smallNotification("Please name your favorite.");
		}
	});
	setUpAmountButtons();
	$("#quick-pick-2").click(function () { $("#numbers").val(quickPick(2)); return false; });
	$("#quick-pick-3").click(function () { $("#numbers").val(quickPick(3)); return false; });
	$("#quick-pick-4").click(function () { $("#numbers").val(quickPick(4)); return false; });
	$("#quick-pick-clear").click(function () { $("#numbers").val(""); return false; });
	$("#keypad_0").click(function () { $("#numbers").val($("#numbers").val() + "0"); return false; })
	$("#keypad_1").click(function () { $("#numbers").val($("#numbers").val() + "1"); return false; })
	$("#keypad_2").click(function () { $("#numbers").val($("#numbers").val() + "2"); return false; })
	$("#keypad_3").click(function () { $("#numbers").val($("#numbers").val() + "3"); return false; })
	$("#keypad_4").click(function () { $("#numbers").val($("#numbers").val() + "4"); return false; })
	$("#keypad_5").click(function () { $("#numbers").val($("#numbers").val() + "5"); return false; })
	$("#keypad_6").click(function () { $("#numbers").val($("#numbers").val() + "6"); return false; })
	$("#keypad_7").click(function () { $("#numbers").val($("#numbers").val() + "7"); return false; })
	$("#keypad_8").click(function () { $("#numbers").val($("#numbers").val() + "8"); return false; })
	$("#keypad_9").click(function () { $("#numbers").val($("#numbers").val() + "9"); return false; })
	$("#drawing-shortcuts #selectAll").click(function () { $("#drawing-list div input:not(:disabled)").prop("checked", true).change(); return false; });
	$("#drawing-shortcuts #selectNone").click(function () { $("#drawing-list div input:not(:disabled)").prop("checked", false).change(); return false; });
	$("#drawing-shortcuts #selectMorning").click(function () { $("#drawing-list div input:not(:disabled)").prop("checked", false); $("#drawing-list div.morning input:not(:disabled)").prop("checked", true).change(); return false; });
	$("#drawing-shortcuts #selectEvening").click(function () { $("#drawing-list div input:not(:disabled)").prop("checked", false); $("#drawing-list div.evening input:not(:disabled)").prop("checked", true).change(); return false; });

	//Load The Player (if there is one)
	if ($.jStorage.get("player") != null) {
		displayPlaceOrderBtn();
	}
	else {
		displaySignInUp();
	}

	getGames(false, 1);
}

function setUpAmountButtons() {
	/* Straight and boxed amount shortcuts */
	$(".quick-pick a[data-value]").click(function () {
		// Find the parent of this that is a class of input-field, find the child input, and set its value to the link's data-value attribute
		$(this).closest(".input-field").find("input").val($(this).attr("data-value"));
		return false;
	});
}

function askCancelOrder() {
	var bets = getbets();
	if (bets.length > 0) {
		if (window.confirm("Are you sure you want to cancel your order?")) {
			cancelOrder();
			smallNotification("Your order has been canceled.");
			clearOrderEntryFields();
		}
	}
};

function makeLotteryBets(houses, numbers, sAmt, bAmt) {
	var bets = [];
	var currentBets = getbets();
	var id = 0;

	for (var i = 0; i < houses.length; i++) {
		for (var x = 0; x < numbers.length; x++) {
			if (sAmt > 0) {
				var bet = new Object();
				bet.id = parseInt(currentBets.length) + parseInt(bets.length);
				bet.houseAbbreviation = houses[i].houseAbbreviation;
				bet.houseName = houses[i].houseName;
				bet.amount = parseFloat(sAmt);
				bet.isBoxed = false;
				bet.numberString = numbers[x].join("-");
				bet.extraNumberString = "";
				bet.numbers = numbers[x];
				bet.extraBallNumbers = [];
				bet.advanced = 1;
				bet.drawDate = new Date();
				bet.extraData = "";

				bets.push(bet);
				id++;
			}

			if (bAmt > 0) {
				var bet = new Object();
				bet.id = parseInt(currentBets.length) + parseInt(bets.length);
				bet.houseAbbreviation = houses[i].houseAbbreviation;
				bet.houseName = houses[i].houseName;
				bet.amount = parseFloat(bAmt);
				bet.isBoxed = true;
				bet.numberString = numbers[x].join("-");
				bet.extraNumberString = "";
				bet.numbers = numbers[x];
				bet.extraBallNumbers = [];
				bet.advanced = 1;
				bet.drawDate = new Date();
				bet.extraData = "";

				bets.push(bet);
				id++;
			}
		}
	}

	return bets;
}

function syncBets(bets, respBets) {
	var finalBets = [];
	for (var i = 0; i < bets.length; i++) {
		var respBet = $.grep(respBets, function (e) { return e.houseAbbreviation == bets[i].houseAbbreviation; });
		bets[i].drawDate = respBet[0].drawDate;
		finalBets.push(bets[i]);
	}

	return finalBets;
}

//Lottery Functions
function populateHouseList(drawings) {
	console.log("populateHouseList()");
	var elem = $("#drawing-list");
	if (drawings == null || drawings.length == 0) {
		console.log("No drawings right now, please try later.");
		elem.empty().append("<p>No drawings are available. Please try later.</p>");
	}
	else {
		var houses = [];
		var tzoffset = new Date().getTimezoneOffset(); // mins
		for (var i = 0; i < drawings.length; i++) {
			var item = drawings[i];
			var disable = item.areAllDrawingsClosed() ? "disabled" : "";
			var localCloseTime = new Date(new Date(item.drawings[0].closesOn).getTime() - (tzoffset * 60000));
			var timeDesignation = localCloseTime.getHours() < 12 ? "morning" : "evening";
			var html = $("<div class='selectable-drawing-item drawing-item " + disable + " " + timeDesignation + "' data-lottery='" + item.lotteryType + "' data-houseabbreviation='" + item.houseAbbreviation + "'><label for='house_" + item.houseAbbreviation + "'><input type='checkbox' " + disable + " id='house_" + item.houseAbbreviation + "' /><span>" + item.houseName + "</span></label></div>");
			html[0].drawing = item; // This is used later when determining all of the selected houses
			houses.push(html);
		}
		elem.empty().append("<ul></ul>");
		elem.find("ul").append(houses);
		setupHouseButtons();
	}
}

// Applies properties and methods to a collection of houses
function applyToHouses(houses) {
	// Adds properties and methods to a drawing object
	function applyToDrawings(drawing) {
		drawing.isDrawingClosed = function () {
			return (this == null || this.isActive == false || new Date(this.closesOn).getTime() <= new Date().getTime());
		};
	}
	// Adds properties and methods to a house object
	function applyToHouse(house) {
		house.lastClosingHouse = function () {
			if (this.drawings.length == 0) return null;
			return this.drawings.sort(function (a, b) {
				var da = new Date(a.closesOn).getTime();
				var db = new Date(b.closesOn).getTime();
				if (da == db) return 0;
				return da > db ? 1 : -1;
			})[0];
		}
		house.areAllDrawingsClosed = function () {
			return (
		this == null
		|| this.drawings == null
		|| this.drawings.length == 0
		|| $.grep(this.drawings, function (d) { return d.isDrawingClosed(); }).length == this.drawings.length); // All return true if all are closed
		}
		$(house.drawings).each(function (idx, d) { applyToDrawings(d); })
	}
	$(houses).each(function (idx, h) { applyToHouse(h); });
	return houses;
}

function setupHouseButtons() {
	console.log("setupHouseButtons()");
	$("#drawing-list div input")
		.on("change", function () { selectBox(this); })
		.each(function () { selectBox(this); });
}

function selectBox(item) {
	var container = $(item).closest("label");
	var checked = item.checked;
	if (checked && !container.hasClass("selected")) {
		container.addClass("selected");
	}
	else if (!checked && container.hasClass("selected")) {
		container.removeClass("selected");
	}
}

function ShowTransactionHistory(page_size, page) {
	busy();
	lottery.transactionHistory(page_size, page, function (resp) {
		notBusy();
		if (!resp.wasSuccessful) {
			window.alert(friendlyError(resp.message));
		}
		else {
			var html = "";
			if (resp.transactionHistory == undefined || resp.transactionHistory.length <= 0)
				html += "<div class='no-data'><p>No transaction history could be found to display.</p></div>";
			else {
				html += "<table class='table'><thead><tr><th style='text-align:left'>Date/Time</th><th style='text-align:left'>Summary</th><th style='text-align:right'>Amount</th></tr></thead><tbody>";
				for (i = 0; i < resp.transactionHistory.length; i++) {
					html += "<tr><td style='text-align:left'>" + resp.transactionHistory[i].createdOn + "</td><td style='text-align:left'>";
					if (resp.transactionHistory[i].orderID != "")
						html += "<a class='hover-hand' onclick='ShowOrderDetails(" + resp.transactionHistory[i].orderID + ")'>" + resp.transactionHistory[i].summary + "</a>";
					else
						html += resp.transactionHistory[i].summary;
					html += "</td><td style='text-align:right'>" + resp.transactionHistory[i].amount + "</td></tr>";
				}
				html += "</tbody></table>";
				if (resp.pageCount > 1) {
					html += "<ul class='pager'>";
					for (i = 1; i <= resp.pageCount; i++) {
						if (i == resp.page)
							html += "<li class='current'>" + i.toString() + "</li>";
						else
							html += "<li><a class='hover-hand' onclick='ShowTransactionHistory(" + resp.pageSize.toString() + "," + i.toString() + ")'>" + i.toString() + "</a></li>";
					}
					html += "</ul>";
				}
			}
			$("#transactionHistoryTable").html(html);
			$("#transactionHistory").show();
		}
	});
}

function ShowOrderDetails(orderID) {
	busy();
	lottery.orderDetails(orderID, function (resp) {
		notBusy();
		if (!resp.wasSuccessful) {
			window.alert(friendlyError(resp.message));
		}
		else {
			var html = "";
			if (resp.orderDetails == undefined || resp.orderDetails.length <= 0)
				html += "<div class='no-data'><p>No order details could be found to display.</p></div>";
			else {
				html += "<table class='table'><thead><tr><th style='text-align:left'>Item</th><th style='text-align:left'>Date</th><th style='text-align:right'>Paid In</th><th style='text-align:right'>Paid Out</th></tr></thead><tfoot><tr><th colspan='6'>";
				if (resp.gameTypeID != 4) { // RaffleLottery
					// TODO: figure out a good way to handle the 'Add To Order' action.
					//html += "<div class='ct action'><button type='button' class='action button add-to-order' onclick='AddToOrder(" + gameTypeID.toString() + ", " + orderID.toString() + ");'>Add To Order</button></div>";
				}
				else {
					html += "&nbsp;";
				}
				html += "</th></tr></tfoot><tbody>";
				for (i = 0; i < resp.orderDetails.length; i++) {
					html += "<tr><td style='text-align:left'>" + resp.orderDetails[i].item + "</td>";
					html += "<td style='text-align:left'>" + resp.orderDetails[i].date + "</td>";
					html += "<td style='text-align:right'>" + resp.orderDetails[i].price + "</td>";
					html += "<td style='text-align:right'>" + resp.orderDetails[i].payout + "</td></tr>";
				}
				html += "</tbody></table><br />";
				if (resp.canBeVoided) {
					switch (resp.gameTypeID) {
						case 1: // Lottery
							html += "<p>Lottery orders can be voided as long as no houses on the order are closed.</p>";
							break;
						case 2: // Keno
							html += "<p>" + resp.kenoName + " orders can be voided as long as no drawings on the order are closed.</p>";
							break;
						case 3: // Bigball
							html += "<p>Bigball orders can be voided as long as no drawings on the order are closed.</p>";
							break;
						case 4: // RaffleLottery
							html += "<p>RaffleLottery orders can be voided as long as the raffle is not closed.</p>";
							break;
					}
					html += "<div class='ct action'><button type='button' class='action button void-order' onclick='if (confirm(\"Are you sure you want to void this order?\")) { VoidOrder(" + resp.orderID.toString() + "); }'>Void Order</button></div>";
				}
			}
			$("#orderDetailsTable").html(html);
			$("#orderDetails").show();
		}
	});
}

function VoidOrder(orderID) {
	busy();
	lottery.voidOrder(orderID, function (resp) {
		notBusy();
		if (!resp.wasSuccessful) {
			window.alert(friendlyError(resp.message));
		}
		else {
			window.alert('The order #' + resp.orderID.toString() + ' was voided.');
			$("#orderDetails").hide();
		}
	});
}

function getFavorites() {
	lottery.getFavorites(1);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pad(num, size) {
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}
function quickPick(numBalls) {
	var max = Math.pow(10, numBalls);
	var num = getRandomInt(0, max - 1);
	var snum = pad(num, numBalls);
	return snum;
}

// Adds one or more bet objects to the table
function addBets(bet) {
	var bets = [].concat(bet);
	for (var i = 0; i < bets.length; i++) {
		var bet = bets[i];
		var container = $("#bets > table > tbody");
		var err = "";
		var ferror = friendlyError(bet.error);

		var template = $("#bet-template").html().trim();
		var $row = $(template);
		$row.find(".numbers").html(bet.numberString);
		$row.find(".is-boxed").html((bet.isBoxed ? "B" : "S"));
		$row.find(".house").html(bet.houseAbbreviation);
		$row.find(".date").html(new Date(bet.drawDate).toDateString());
		$row.find(".amount").html(bet.amount.toFixed(numDecimals));
		$row.find("[data-id]").data("id", bet.id);
		$row.find(".remove-bet a.remove").one("click", removeBetLinkHandler);
		$row[0].bet = bet;
		$errorRow = $row[2];
		if (bet.error === undefined || bet.error === null) {
			$row[2] = null;
		}
		else {
			$($errorRow).addClass("error").attr("title", ferror).find(".message").html(ferror);
		}
		container.append($row);
	}
}

function replaceBets(allBets) {
	$("#bets > table > tbody tr:not(:hidden,.no-bets)").remove();
	addBets(allBets);
	checkShowNoBetsMessage();
}

function onBetsAdded(bet) {
	addBets(bet);
	checkShowNoBetsMessage();
}

function saveBets(bets) {
	$.jStorage.set("lotto-bets", bets);
	checkUI();
}

function loadBets(onStartup) {
	var bets = $.jStorage.get("lotto-bets") == null ? [] : $.jStorage.get("lotto-bets");
	replaceBets(bets);
}

function getbets() {
	var bets = $.jStorage.get("lotto-bets") != null ? $.jStorage.get("lotto-bets") : [];
	return bets;
}

function removeOldBets() {
	var bets = getbets();
	var removed = false;
	var newBets = [];
	for (var i = 0; i < bets.length; i++) {
		var bet = bets[i];
		var game = $.grep(globalGames, function (e) { return e.houseAbbreviation == bet.houseAbbreviation; });
		if (game != undefined && game.length > 0) {
			if (game[0].areAllDrawingsClosed() != true) {
				newBets.push(bet);
			}
			else {
				removed = true; // All drawings are closed so this bet will be removed (not added to the newBet collection);
			}
		}
	}
	saveBets(newBets);
	replaceBets(newBets);
	if (removed) {
		smallNotification("Houses are closed for some of the bets, these have been automatically removed.");
	}
}

//Favorites
function addFavorites(favorite) {
	var favorites = favorite || [];
	var select = $("#custFav");
	if (favorites != null && favorites.length > 0) {
		var option = document.createElement("option");
		option.textContent = "";
		option.value = -1;
		select.append(option);
		for (var i = 0; i < favorites.length; i++) {
			var favorite = favorites[i];
			option = document.createElement("option");
			option.textContent = favorite.favoriteName;
			option.value = favorite.id;
			select.append(option);
		}
	}
}

function replaceFavorites(allFavorites) {
	$("#custFav").empty();
	addFavorites(allFavorites);
}
// Shows a small notification, useful for allowing player to undo actions, above bet list
var smallNotificationTimeoutHandle = null;

function smallNotification(messageHtml, timeout, runIfLinkClickedInMessage) {
	if (smallNotificationTimeoutHandle != null) {
		clearTimeout(smallNotificationTimeoutHandle);
	}
	var undo = $("#undo");
	undo.html(messageHtml);
	var a = undo.find("a");
	if (a.length == 1 && typeof runIfLinkClickedInMessage === "function") {
		a.one("click", function () {
			runIfLinkClickedInMessage();
			clearTimeout(smallNotificationTimeoutHandle);
			undo.hide("fast");
			return false;
		})
	}
	undo.show("fast");
	smallNotificationTimeoutHandle = setTimeout(function () {
		clearTimeout(smallNotificationTimeoutHandle);
		undo.hide("fast");
	}, (timeout || 7777));
}

function onBetRemoved(bet) {
	checkShowNoBetsMessage();
	if (smallNotificationTimeoutHandle != null) {
		clearTimeout(smallNotificationTimeoutHandle);
	}
	var msg = "<a href=\"#\">Bet was removed. Click here to undo.</a>";
	if (bet.error != null)
		msg = "Invalid bet was removed.";
	var undo = $("#undo");
	smallNotification(msg, 7777, function () {
		lottery.addBets(bet);
	});
}

function removeBetLinkHandler(a, b, c) {
	var bet = $(this).closest("tr")[0].bet;
	var bets = getbets();
	var index = arrayObjectIndexOf(bets, bet);
	bets.splice(index, 1);
	replaceBets(bets);
	saveBets(bets);
	return false;
}

// Errors
function showErrorMessage(contents) {
	$("#errorMessage .message").html(contents);
	$("#errorMessage").show("fast");
}

function checkUI() {
	var bets = getbets();
	if (wallet.player != null) {
		if (lottery.token != null) {
			$("#place-order").prop("disabled", bets.length <= 0);
			$("#cancel-order").prop("disabled", bets.length <= 0);
			displayPlaceOrderBtn();
		}
		else {
			displayPlaceOrderBtn();
			$(".favorites-controls").hide();
		}
	} else {
		displayPlaceOrderBtn();
		$(".favorites-controls").hide();
	}


}

function resetOrderScreen() {
	lottery.resetOrder();
	clearOrderEntryFields();
}

function clearNumbers() {
	$("#numbers").val('');
}

function clearOrderEntryFields() {
	clearNumbers();
	$("#drawing-shortcuts #selectNone").click();
	$("#straightAmount").val('');
	$("#boxedAmount").val('');
	checkUI();
	loadBets(false);
}

// Determine if we should show the no bets message
function checkShowNoBetsMessage() {
	var table = $("#bets > table");
	var message = table.find("tbody tr.no-bets");
	var bets = $.jStorage.get("lotto-bets") != null ? $.jStorage.get("lotto-bets") : [];
	if (bets.length == 0) {
		message.show();
	} else {
		message.hide();
	}
	// Update totals
	$("#betcount").text(bets.length + " bets");
	$("#bettotal").text(currencySymbol + parseFloat(betTotal()).toFixed(numDecimals) + "");
}

function betTotal() {
	var bets = getbets();
	var total = 0;
	for (var i = 0; i < bets.length; i++) {
		total += bets[i].amount;
	}
	total = jsround(total);
	return total;
}

function jsround(num) {
	return Math.round((num * 100) + 0.00001) / 100;
}

function placeOrder() {
	if (lottery.player != null) {
		var bets = getbets();
		if (bets.length > 0) {
			if (confirm("Are you sure you would like to order these bets?")) {
				lottery.placeOrder(bets, 1);
			}
		}
		else {
			alert("Please place some bets");
		}
	}
	else {
		alert("Please log in first...");
	}
}

function cancelOrder() {
	saveBets([]);
	replaceBets([]);
}

function displayPlaceOrderBtn() {
	$(".checkout-sign-inup-div").hide();
	$("#order-actions").show();
	$(".favorites-controls").show();
}

function displaySignInUp() {
	$(".checkout-sign-inup-div").show();
	$("#order-actions").hide();
	$(".favorites-controls").hide();
}

function updateBalance() {
	var newBalance = parseFloat(lottery.player.balance) - parseFloat(betTotal());
	lottery.player.balance = newBalance;
	$(".balance-text").text("Balance: " + currencySymbol + lottery.player.balance.toFixed(numDecimals));
}

function disableButtons(onoff) {
	$("button,a,label").prop('disabled', onoff);
}

/* Set up more/less boxes for a container */
function setupMoreLessChildren(item, childTag, setupResizeHandler) {
	var shouldSetupResizeHandler = setupResizeHandler || true;
	var itemName = item;
	var childTagName = childTag;
	function switchPage(element) {
		killSensor();
		var $elem = $(element).find("a");
		var toPage = $elem.data("page");
		var target = $elem.data("target");
		var parent = $elem.closest("div.page");
		parent.removeClass("active");
		var sib = parent.siblings("[data_page=" + toPage + "]");
		sib.addClass("active");
		attachSensor();
	}
	var rs;
	var done = false;
	function killSensor() {
		if (rs != null) {
			rs.detach();
			rs = null;
		}
	}
	function attachSensor() {
		if (shouldSetupResizeHandler == true) {
			rs = new ResizeSensor(jQuery(itemName), function () {
				resize(itemName, childTagName);
			});
		}
	}
	function resize(item, childTag) {
		/*
containerHeight = Height of container
elemHeight = Height of each element
Number of items per page = containerHeight / elemHeight, floored
while (processedItems < totalItems)
{
		var totalItemsToAdd = items per page
		if (not page 1) total Itemstoadd-1

		Add	number of items
}
*/
		killSensor();
		var $item = $(item);
		$item.find(".prevPage,.nextPage").off();
		$item.css("overflow", "hidden");
		var children;
		if ($item.find("div.nextPage,div.prevPage").length > 0) {
			$item.find("div.nextPage,div.prevPage").remove();
		}
		if (done) {
			children = $(item + " " + childTag);
		}
		else {
			children = $(item + " " + childTag + ":visible");
		}
		var totalChildren = children.toArray().length;
		//console.log("children count = " + totalChildren);
		if (totalChildren == 0) return;
		var height = $(children[0]).outerHeight(true);
		//console.log("height of 1st element = " + height);
		var containerHeight = ($item.height() - 55);
		//console.log("container height = " + containerHeight);
		if (containerHeight < height) return;
		var itemsPerPage = Math.floor(containerHeight / height);
		children = children.detach();
		$item.children().remove();
		var page = 1;
		var arrc = children.toArray();
		while (arrc.length > 0) {
			var totalAddedThisPage = 0;
			var active = page == 1 ? " active" : "";
			var div = $("<div/>", { class: "page" + active, data_page: page });
			if (page > 1) {
				div.append("<div class=\"prevPage drawing-item\"><label><a class=\"\" href=\"#\" data-target=\"" + item + "\" data-page=\"" + (page - 1).toString() + "\"></a><span></span></label></div>");
				totalAddedThisPage++;
			}
			var countToRemove = (itemsPerPage - totalAddedThisPage < arrc.length ? itemsPerPage - totalAddedThisPage : arrc.length) - 1; // -1 = account for next button possibly being added
			var itemsRemoved = arrc.splice(0, countToRemove);
			div.append(itemsRemoved);
			if (arrc.length > 1) //(nextButton)
			{
				div.append("<div class=\"drawing-item nextPage\"><label><a class=\"\" href=\"#\" data-target=\"" + item + "\" data-page=\"" + (page + 1).toString() + "\"></a><span></span></label></div>");
			}
			else if (arrc.length == 1) {
				div.append(arrc.splice(0, 1));
			}
			$item.append(div);
			page++;
			//return;
		}
		$item.find(".prevPage,.nextPage").on("click", function () { switchPage(this); return false; });
		page--;
		var thisPage = 0;
		$item.find(".page").each(function () {
			thisPage++;
			var $this = $(this);
			$this.find(".prevPage span").text("<<< Page " + thisPage + " of " + page);
			$this.find(".nextPage span").text("Page " + thisPage + " of " + page + " >>>");
		});
		attachSensor();
		done = true;
	}
	resize(item, childTag);
}

function initLottoGames(games) {
	if (typeof applyToHouses == 'function') {
		applyToHouses(games)
	}
	if (typeof populateHouseList == 'function') {
		populateHouseList(games);
	}

	globalGames = games;
	displayDenominations();
}

function arrayObjectIndexOf(Array, Object) {
	for (var i = 0, len = Array.length; i < len; i++) {
		if (Array[i].id === Object.id) return i;
	}
	return -1;
}

function displayDenominations() {
	var denominations = [5.00, 1.00, 0.50, 0.25, 0.10, 0.05, 0.01]; // Default denominations for display;
	// Parse out the first drawings' denominations;
	if (globalGames != null && globalGames.length > 0) {
		var game = globalGames[0];
		if (game != null && game.drawings != null && game.drawings.length > 0) {
			if (game.drawings[0].denominations != null && game.drawings[0].denominations != "") {
				var denoms = game.drawings[0].denominations.split(",");
				var decimals = denoms[0].indexOf(".") >= 0;
				if (decimals) {
					numDecimals = 2; // ? Set this to 2 decimal places ?
					denominations = denoms.map(parseFloat);
				}
				else {
					numDecimals = 0; // ? Set this to no decimals ?
					denominations = denoms.map(Number);
				}
			}
		}
	}

	// Sort list from lowest to highest;
	denominations.sort(function (a, b) {
		return a - b;
	});

	// Add the amounts to the UI;
	var sol = $("#amount-straight-ct").find('ol');
	var bol = $("#amount-boxed-ct").find('ol');
	var lis = document.createElement("li");
	var lib = document.createElement("li");
	var ancs = document.createElement("a");
	var ancb = document.createElement("a");
	ancs.href = "#";
	ancb.href = "#";
	ancs.text = "clear";
	ancb.text = "clear";
	ancs.dataset.value = "";
	ancb.dataset.value = "";
	lis.appendChild(ancs);
	lib.appendChild(ancb);
	sol.append(lis);
	bol.append(lib);
	for (var i = 0; i < denominations.length; i++) {
		if (i >= 7) {
			break;
		}
		lis = document.createElement("li");
		lib = document.createElement("li");
		ancs = document.createElement("a");
		ancb = document.createElement("a");
		ancs.href = "#";
		ancb.href = "#";
		ancs.text = denominations[i].toFixed(numDecimals);
		ancb.text = denominations[i].toFixed(numDecimals);
		ancs.dataset.value = denominations[i].toFixed(numDecimals);
		ancb.dataset.value = denominations[i].toFixed(numDecimals);
		lis.appendChild(ancs);
		lib.appendChild(ancb);
		sol.append(lis);
		bol.append(lib);
	}
	setUpAmountButtons();
}

function getGames(images, gameTypeID) {
	try {
		lottery.getGames(images, gameTypeID);
	} catch (err) { alert("Something went wrong loading the games!"); }
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
			return "Player account is inactive. Pleae contact customer support.";
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
		default: // idk
			return message;
	}
}

function getUserViaSession() {
	wallet.getPlayerViaSession();
}

function errorOccured(ev, error, isFatal) {
	var ferror = friendlyError(error);
	console.log("ERROR OCCURRED: " + error + " - " + ferror);
	if (isFatal)
		showErrorMessage(ferror);
	else
		window.alert(ferror);
}

function unloadUser() {
	lottery.player = null;
	$.jStorage.deleteKey("player");
}