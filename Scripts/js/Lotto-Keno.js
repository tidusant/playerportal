﻿/**
 * VIEW GLOBALS.JS FOR GLOBAL VARIABLES
 */
var topNumbers = 0;
var topPicks = 0;
var minPicks = 0;
var permCount = 0;
var allowedBallCountsOnOrder = null;
var bottomNumbers = 0;
var bottomPicks = 0;
var ticketPrice = 2;
var extraBallText = "";
var extraBoolText = "";
var extraNumbersText = "";
var extraBoolAmt = 1.00;
var gameName = "";
var globalGames = null;

$(function () {
    var $l = $(lottery);
    var $w = $(wallet);
    getGames(false, 2);

    $l.on("errorOccurred", function (ev, error, isFatal) {
        errorOccured(ev, error, isFatal);
    });

    $w.on("errorOccurred", function (ev, error, isFatal) {
        errorOccured(ev, error, isFatal);
    });

    $l.on("placeBetsCalled", function (ev, bets, valid) {
        if (valid) {
        }
    });

    $l.on("orderPlacedCalled", function (ev, wasSuccessful, orderID) {
        if (wasSuccessful) {
            getUserViaSession();
            $.jStorage.set("player", wallet.player);
            clearItems(0);
            alert("Order #" + orderID + " placed successfully!");
        }
        else {
            //alert("Something went wrong");
        }
    });

    $l.on("getGamesCalled", function (ev, games, gameType) {
        switch (gameType) {
            case 2:
                initKenoGames(games);
                break;
        }
    });

    $w.on("loadPlayerCalled", function (ev, player) {
        if (player != null) {
            $.jStorage.set("player", player);
            $("#please-log-in").hide();
            $("#addToCart").show();
            wallet.getLotteryToken();
        }
        else {
            $("#please-log-in").show();
            $("#addToCart").hide();
        }
    });

    $w.on("getLotteryTokenCalled", function (ev, resp) {
    	if (resp.wasSuccessful) {
    		wallet.token = resp.token;
    		lottery.token = resp.lotteryToken;
    		$.jStorage.set("token", resp.token);
    	}
    });

    $('.row_itm').click(function (e) {
        calcTotal();
    });

    $(document).on("click", '.extra-boolean', function (e) {
        calcTotal();
    });

    $(".advancePlay").change(function () {
        var apValue = parseInt($(".advancePlay").val()) || 0; // Default to 0 if parse fails (will auto-set to 1 below);
        var apMaxValue = parseInt($(".advancePlay").attr("max")) || 1; // Default to 1 so the max stays just one advanced play;
        if (apValue <= 0) {
            $(".advancePlay").val("1");
        }
        else if (apValue > apMaxValue) {
            $(".advancePlay").val($(".advancePlay").attr("max"));
        }
        calcTotal();
    });

    $(".sub-games-list").change(function () {
        loadSelectedGame();
    });

    $(".ticketPrice").change(function () {
        ticketPrice = $(".ticketPrice").val();
        calcTotal();
    });

    $(".extra-number-refresh").click(function () {
        randomExtra();
    });

    $(".extra-number-refresh").hover(function () {
        $(".extra-number-refresh").addClass("spinning");
    }, function () {
        $(".extra-number-refresh").removeClass("spinning");
    });

    $("#addToCart").click(function () {
        if (checkForIncomplete()) {
            if (confirm("Are you sure you would like to order these bets?")) {
                var bets = makeBets();
                if (bets.length > 0) {
                    lottery.placeOrder(bets, 2);
                }
                else {
                    alert('Please place at least one bet.');
                }
            }
        }
        else {
            alert('Please complete or remove highlighted bets.');
        }
    });

    if ($.jStorage.get("player") != null) {
        wallet.player = $.jStorage.get("player");
        getUserViaSession();
    }
});

function initPage() {

    while (linesTotal > 1) {
        removeLine();
    }

    initMtable(0);
    initMtable(1);
    initMtable(2);
    initMtable(3);
    initMtable(4);

    clearItems(0);
    randomExtra();
    $(".advancePlay").val("1"); // Reset advanced play
}

function initMtable(num) {

    $('.liHolder:eq(' + num + ')').html('');

    $('.liHolder:eq(' + num + ')').each(function (index, element) {
        clearItems(1, $(this).parent());
        for (var i = 1; i <= topNumbers; i++) {
            $(this).append('<li>' + i + '</li>');
        }
    });

    $('.liHolder:eq(' + num + ')').find('li').click(function (e) {
        var $items;
        $items = $('.liHolder:eq(' + num + ') li.active');
        if ($(this).hasClass('active')) {
            $(this).toggleClass('active');
        } else {
            if ($items.length < topPicks) {
                $(this).toggleClass('active');
            }
        }
        $items = $('.liHolder:eq(' + num + ') li.active');

        if (allowedBallCountsOnOrder != null && allowedBallCountsOnOrder.length > 0) {

            var index = $.inArray($items.length, allowedBallCountsOnOrder)
            if (index === -1) {
                // not in array
                var min = Math.min.apply(Math, allowedBallCountsOnOrder);
                var max = Math.max.apply(Math, allowedBallCountsOnOrder);
                $(this).parent().parent().find('.select_descr').html('Select ' + min + ' To ' + max);
            }
            else {
                $(this).parent().parent().find('.select_descr').html('Ok');
            }
        }
        else if ($items.length < topPicks) {
            $(this).parent().parent().find('.select_descr').html('Select ' + (topPicks - $items.length));
        }
        else {
            $(this).parent().parent().find('.select_descr').html('Ok');
        }

        //if ($items.length < topPicks) {
        //	$(this).parent().parent().find('.select_descr').html('Select ' + (topPicks - $items.length) + ' Numbers');
        //}
        //else {
        //	$(this).parent().parent().find('.select_descr').html('Ok');
        //}

        checkForIncomplete();
        calcTotal();
    });


    if (bottomNumbers != null && bottomNumbers > 0) {
        $('.luckyHolder:eq(' + num + ')').each(function (index, element) {
            for (var i = 1; i <= bottomNumbers; i++) {
                $(this).append('<li>' + i + '</li>');
            }
        });

        $('.luckyHolder:eq(' + num + ')').find('li').click(function (e) {
            var $items;
            $items = $('.luckyHolder:eq(' + num + ') li.active');
            if ($(this).hasClass('active')) {
                $(this).toggleClass('active');
            } else {

                if ($items.length < bottomPicks) {
                    $(this).toggleClass('active');
                }
            }
            $items = $('.luckyHolder:eq(' + num + ') li.active');
            if ($items.length < bottomPicks) {
                $(this).parent().parent().find('.select_descr_l').html('Select ' + (bottomPicks - $items.length) + ' ' + extraBallText);
            } else $(this).parent().parent().find('.select_descr_l').html('Ok');

            checkForIncomplete();
            calcTotal();
        });
    }
}

var dataX = {};

function quickPick(num, where) {

    var pickCount = topPicks;
    if (allowedBallCountsOnOrder != undefined && allowedBallCountsOnOrder.length > 0 && minPicks > 0) {
        // If the game has multiple ball counts allowed, just choose the lowest one as the quick pick value
        pickCount = minPicks;
    }

    if (num == 0) {
        clearItems(0, 0);
        $('.liHolder').each(function (index, element) {
            clickItems($(this), pickCount, topNumbers);
        });
        $('.luckyHolder').each(function (index, element) {
            clickItems($(this), bottomPicks, bottomNumbers);
        });
    } else {
        clearItems(num, where);
        $(where).parent().parent().find('.liHolder').each(function (index, element) {
            clickItems($(this), pickCount, topNumbers);
        });
        $(where).parent().parent().find('.luckyHolder').each(function (index, element) {
            clickItems($(this), bottomPicks, bottomNumbers);
        });
    }
}

function clickItems(holder, minz, maxz) {
    for (var i = 1; i <= minz; i++) {
        var rndx = Math.floor(Math.random() * maxz) + 0;
        $(holder).find('li:eq(' + rndx + ')').click();
    }
    var $items;
    $items = $(holder).find('li.active');
    if ($items.length < minz) {
        clickItems(holder, minz, maxz);
    }
    calcTotal();
}

function clearItems(num, where) {
    if (num == 0) {
        $('.mtable').find('li').removeClass('active');

        if (allowedBallCountsOnOrder != null && allowedBallCountsOnOrder.length > 0) {
            var min = Math.min.apply(Math, allowedBallCountsOnOrder);
            var max = Math.max.apply(Math, allowedBallCountsOnOrder);
            $('.select_descr').html('Select ' + min + ' To ' + max);
        }
        else {
            $('.select_descr').html('Select ' + topPicks);
        }


        if (bottomNumbers != null && bottomNumbers > 0) {
            $('.select_descr_l').html('Select ' + bottomPicks + ' ' + extraBallText);
        }
    } else {
        $(where).parent().parent().find('li').removeClass('active');

        if (allowedBallCountsOnOrder != null && allowedBallCountsOnOrder.length > 0) {
            var min = Math.min.apply(Math, allowedBallCountsOnOrder);
            var max = Math.max.apply(Math, allowedBallCountsOnOrder);
            $(where).parent().parent().find('.select_descr').html('Select ' + min + ' To ' + max);
        }
        else {
            $(where).parent().parent().find('.select_descr').html('Select ' + topPicks);
        }

        if (bottomNumbers != null && bottomNumbers > 0) {
            $(where).parent().parent().find('.select_descr_l').html('Select ' + bottomPicks + ' ' + extraBallText);
        }
    }
    checkForIncomplete();
    calcTotal();
}

var currentMtable = 0;
function nextMtable() {
    if (currentMtable < 4) {
        currentMtable++;
        $('.mtable_holder').animate({ scrollLeft: currentMtable * 228 }, 300);
    }
    //$('.lineNumber').html('Line #'+(currentMtable+1));
}
function prevMtable() {
    if (currentMtable > 0) {
        currentMtable--;
        $('.mtable_holder').animate({ scrollLeft: currentMtable * 228 }, 300);
    }
    //$('.lineNumber').html('Line #'+(currentMtable+1));
}

var linesTotal = 1;
function addLine() {
    if (linesTotal < 5) {
        $('.lineHolder:first').clone().appendTo('#lines');
        $('.lineHolder:last').find('.liHolder').empty();
        $('.lineHolder:last').find('.luckyHolder').empty();
        for (var i = 0; i < 5; i++) {
            var index = i + linesTotal * 5;
            initMtable(index);
        }
        linesTotal++;
        //$('.lineNumber:last').html('Line #'+(linesTotal));
    }
    if (linesTotal > 1) {
        $('#removeLines').show();
    }
    $('#row_itm_holder').find('.active').click();
}
function removeLine() {
    $('.lineHolder:last').remove();
    linesTotal--;
    if (linesTotal == 1) {
        $('#removeLines').hide();
    }
    $('#row_itm_holder').find('.active').click();
    calcTotal();
}

function makeBets() {
    var bets = [];
    var i = 0;
    var extraNums = null;
    //Get the amount and advanced count.
    var amount = $(".ticketPrice").val();
    var advanced = $(".advancePlay").val();

    //Get the numbers
    $('.mtable').each(function (index, element) {
        var bet = new Object();
        var items = [];
        var xitems = [];
        $(this).find('.liHolder').each(function (index, element) {
            //Push the selected numbers
            $(this).find('li.active').each(function (index, element) {
                items.push($(element).html());
            });
        });
        if (bottomNumbers != null && bottomNumbers > 0) {
            $(this).find('.luckyHolder').each(function (index, element) {
                //Push the Lucky Numbers
                $(this).find('li.active').each(function (index, element) {
                    xitems.push($(element).html());
                    if (gameID == "Lotto6aus49") {
                        extraNums = "123456" + $(element).html();
                    }
                });
            });

        }

        var xItemCheck = (bottomNumbers != null && bottomNumbers > 0) ? (xitems.length > 0) : true;
        if (items.length > 0 && xItemCheck) {
            bet.id = i;
            bet.houseAbbreviation = gameID;
            bet.houseName = gameName;
            bet.amount = parseFloat(amount) + ($(this).find(".extra-boolean").is(':checked') ? parseFloat(extraBoolAmt) : parseInt(0));
            bet.isBoxed = false;
            bet.numberString = items.join(",");
            bet.extraNumberString = xitems.join(",");
            bet.numbers = items;
            bet.extraBallNumbers = xitems;
            bet.advancedPlay = parseInt(advanced) || 1; // Default to just one advanced play if null
            bet.extraData = (extraNums != null) ? extraNums : $(this).find(".extra-boolean").is(':checked');

            bets.push(bet);
            i++;
        }
    });

    $.jStorage.set("bets", bets);
    return bets;
}

function makeLotteryBets(houses, numbers, sAmt, bAmt) {
    var bets = [];

    for (var i = 0; i < houses.length; i++) {
        for (var x = 0; x < numbers.length; x++) {
            if (sAmt > 0) {
                var bet = new Object();
                bet.id = i;
                bet.houseAbbreviation = houses[i];
                bet.houseName = houses[i];
                bet.amount = parseFloat(sAmt);
                bet.isBoxed = false;
                bet.numberString = numbers[x].join(",");
                bet.extraNumberString = "";
                bet.numbers = numbers[x];
                bet.extraBallNumbers = [];
                bet.advanced = 1;
                bet.extraData = "";

                bets.push(bet);
                i++;
            }

            if (bAmt > 0) {
                var bet = new Object();
                bet.id = i;
                bet.houseAbbreviation = houses[i];
                bet.houseName = houses[i];
                bet.amount = parseFloat(bAmt);
                bet.isBoxed = true;
                bet.numberString = numbers[x].join(",");
                bet.extraNumberString = "";
                bet.numbers = numbers[x];
                bet.extraBallNumbers = [];
                bet.advanced = 1;
                bet.extraData = "";

                bets.push(bet);
                i++;
            }
        }
    }

    return bets;
}

function clearNumbers() {
    $("#numbers").val('');
}

function getGameInfo(game) {

    permCount = game.permutationCount;
    topNumbers = game.maximumNumberPerBall;
    topPicks = game.ballCountOnOrder;
    allowedBallCountsOnOrder = null;
    var allowedBallCountsOnOrderString = game.allowedBallCountsOnOrder;
    if (allowedBallCountsOnOrderString != undefined && allowedBallCountsOnOrderString != "") {
        var allowedBallCountsOnOrderStringArray = allowedBallCountsOnOrderString.split(",");
        allowedBallCountsOnOrder = allowedBallCountsOnOrderStringArray.map(Number);
        if (permCount != undefined && permCount > 1) {
            // Remove the permutation number from the allowed ball counts if it exists;
            var index = allowedBallCountsOnOrder.indexOf(game.permutationCount);
            if (index > -1) {
                allowedBallCountsOnOrder.splice(index, 1);
            }
        }
        // Set the min/max allowed ball counts
        minPicks = Math.min.apply(Math, allowedBallCountsOnOrder);
        topPicks = Math.max.apply(Math, allowedBallCountsOnOrder);
    }

    //bottomNumbers = game.houseAbbreviation == "Lotto6aus49" ? 0 : game.extraBallMaximumNumberPerBall;
    //bottomPicks = game.houseAbbreviation == "Lotto6aus49" ? 0 : game.extraBallCount;
    bottomNumbers = game.extraBallMaximumNumberPerBall;
    bottomPicks = game.extraBallCount;
    ticketPrice = parseFloat(game.minimumAmountPerBet).toFixed(2).toLocaleString();
    var denominations = game.denominations.split(",");
    denominations.sort(function (a, b) {
        return a - b;
    });

    $(".play-game-jackpot").text(currencySymbol + (game.jackpotAmount == null ? "0.00" : parseFloat(game.jackpotAmount.toFixed(2)).toLocaleString()));
    $("#play-game-name").val(game.houseName);
    $(".keno-header").text("Play " + game.houseName);
    $(".maxAdvancePlay").text(game.advancedPlays);
    $(".advancePlay").attr("max", game.advancedPlays);

    var select = $(".ticketPrice");
    select.html('');

    var minAmnt = game.minimumAmountPerBet || 0;
    var maxAmnt = game.maximumAmountPerBet || 0;
    for (var i = 0; i < denominations.length; i++) {
        var option = document.createElement("option");
        var amnt = parseFloat(denominations[i]);
        if (amnt >= minAmnt) {
            var add = true;
            if (maxAmnt > 0 && (amnt > maxAmnt)) {
                add = false;
            }
            if (add) {
                option.textContent = currencySymbol + amnt.toLocaleString();
                option.value = denominations[i];
                select.append(option);
            }
        }
    }

    extraBallText = (game.extraBallName != null ? game.extraBallName : "Bonus Numbers");
    extraBoolText = (game.extraBoolName != null ? game.extraBoolName : "Extra Option") + currencySymbol + extraBoolAmt.toFixed(2);
    extraNumbersText = (game.extraNumName != null ? game.extraNumName : "Extra Numbers");
    $(".extra-text").text((game.extraBoolName != null ? game.extraBoolName : "Extra Option") + currencySymbol + extraBoolAmt.toFixed(2));
    $(".extra-numbers-text").text(game.extraNumName != null ? game.extraNumName : "Extra Numbers");

    //document.querySelector(".play-game-img").src = "data:" + game.imageMimeType + ";base64," + game.imageData;
    //document.querySelector(".play-game-img").alt = game.houseName;
    //InitClock($('.play-game-clock'), game.closeDT);

    initPage();
    displayExtras(game.houseAbbreviation);
    calcTotal();
}

function loadGamesDDL(games) {
    var select = $(".sub-games-list");
    var lastGroupID = null;
    var optGroup = null;
    for (var i = 0; i < games.length; i++) {
        var game = games[i];

        if (game.games_Lottery_GameTypeGroup_ID != null || game.games_Lottery_GameTypeGroup_ID != undefined) {
            if (lastGroupID != game.games_Lottery_GameTypeGroup_ID) {
                optGroup = document.createElement("optgroup");
                optGroup.label = game.games_Lottery_GameTypeGroup_Name;
                lastGroupID = game.games_Lottery_GameTypeGroup_ID;
                select.append(optGroup);
            }
        }
        else {
            lastGroupID = null;
            optGroup = null;
        }
        var option = document.createElement("option");
        option.textContent = game.houseName;
        option.value = game.houseAbbreviation;
        if (optGroup != null || optGroup != undefined) {
            optGroup.append(option);
        }
        else {
            select.append(option);
        }
    }
}

function displayExtras(gameName) {
    //Dirty Hard Coded Game Name Displaying
    switch (gameName) {
        case "Lotto6aus49":
            $(".extra-numbers-container").show();
            $(".extra-data").hide();
            break;
        case "MegaMillions":
            $(".extra-numbers-container").hide();
            $(".extra-data").show();
            break;
        case "Powerball":
            $(".extra-numbers-container").hide();
            $(".extra-data").show();
            break;
        default:
            $(".extra-numbers-container").hide();
            $(".extra-data").hide();
    }
}

function checkForIncomplete() {
    var formClean = true;

    $(".mtable").each(function () {
        var totalCount = parseInt($(this).find('.liHolder li.active').length) + parseInt($(this).find('.luckyHolder li.active').length);
        var totalPicks = parseInt(topPicks) + parseInt(bottomPicks == null ? 0 : bottomPicks);
        var finalCheck = false;
        if (totalCount == 0) {
            finalCheck = true;
        }
        else {
            // Check if this is a game withh allowed ballcounts;
            if (allowedBallCountsOnOrder != undefined && allowedBallCountsOnOrder.length > 0) {
                var index = $.inArray(totalCount, allowedBallCountsOnOrder)
                if (index != -1) {
                    finalCheck = true;
                }
            }
            else {
                // Else game expects the ballcount to match the total pick count;
                if (totalCount == totalPicks)
                    finalCheck = true;
            }
        }
        if (finalCheck) {
            $(this).removeClass("problem");
        }
        else {
            $(this).addClass("problem");
            formClean = false;
        }
    });

    //$(".mtable").each(function () {
    //    var totalCount = parseInt($(this).find('.liHolder li.active').length) + parseInt($(this).find('.luckyHolder li.active').length)
    //    var totalPicks = parseInt(topPicks) + parseInt(bottomPicks == null ? 0 : bottomPicks);
    //    var finalCheck = (totalCount == 0) ? true : (totalCount == totalPicks);
    //    if (finalCheck) {
    //        $(this).removeClass("problem");
    //    }
    //    else {
    //        $(this).addClass("problem");
    //        formClean = false;
    //    }
    //});

    return formClean;
}

function calcTotal() {
    ticketPrice = $(".ticketPrice").val() || 0; // Grab the current selected ticket price;
    var amount = 0;
    var advanced = $(".advancePlay").val();
    var lines = 0;
    $(".mtable").each(function () {

        var items = [];
        $(this).find('.liHolder').each(function (index, element) {
            //Push the selected numbers
            $(this).find('li.active').each(function (index, element) {
                items.push($(element).html());
            });
        });

        var xItemCheck = (bottomNumbers != null && bottomNumbers > 0) ? ($(this).find('.select_descr_l').html() == 'Ok') : true;
        if ($(this).find('.select_descr').html() == 'Ok' && xItemCheck) {
            var permLines = 1; // Default to 1 for multiplication below;
            if (permCount != undefined && permCount > 0) {
                // calculate the count based on the amount of balls selected;
                permLines = getCombinationCount(items, permCount);
            }
            lines = parseInt(lines) + parseInt(permLines);
            amount = amount + ((parseFloat(ticketPrice) + ($(this).find(".extra-boolean").is(':checked') ? parseInt(extraBoolAmt) : parseInt(0))) * permLines);
        }
    });

    $('#row_itm_holder').find('.active').removeClass('active');
    $(this).addClass('active');
    $('.priceLineCount').html(lines + ' Line' + (lines != 1 ? 's' : ''));
    var total = amount * advanced;
    $(".playtotal").text(total.toFixed(2));
}

function randomExtra() {
    $(".extra-number-selector").find(".extra-number").each(function () {
        $(this).val(getRandomInt(0, 9));
    });
    $(".extra-number-selector").find(".extra-number-special").each(function () {
        $(this).val(getRandomInt(0, 9));
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function makeExtraString() {
    var nums = [];
    var specialNums = [];

    if ($('.extra-numbers-container').is(":visible")) {
        $('.extra-number-selector').find(".extra-number").each(function () {
            nums.push($(this).val());
        });

        $('.extra-number-selector').find(".extra-number-special").each(function () {
            specialNums.push($(this).val());
        });

        var final = nums.join("") + "" + specialNums.join("");

        return final;
    }
    else { return null; }
}

function initKenoGames(games) {
    //Layout Display Calls
    if (typeof applyToHouses == 'function') {
        applyToHouses(games)
    }

    if (typeof getGameInfo == 'function') {
        globalGames = games;
        loadGamesDDL(globalGames);
        loadSelectedGame();
    }
}

function loadSelectedGame() {
    var game = $.grep(globalGames, function (e) { return e.houseAbbreviation == $(".sub-games-list").val(); });
    gameID = game[0].houseAbbreviation;
    gameName = game[0].houseName;
    getGameInfo(game[0].drawings[0]);
}

function updateBalance() {
    var cart = getCart();
    var newBalance = parseFloat(wallet.player.balance) - parseFloat(cart.total);
    wallet.player.balance = newBalance;
    $(".balance-text").text("Balance: " + currencySymbol + wallet.player.balance.toFixed(numDecimals));
}

function getCombinationCount(items, count) {
    var itemz = items || [];
    return getCombinations(itemz.length, count);
}

function getCombinations(n, r) {
    var temp = n;
    for (var i = n - 1; i > (n - r) ; i--) {
        temp = temp * i;
    }
    for (var i = r; i > 1; i--) {
        temp = temp / i;
    }
    return temp;
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
    wallet.player = null;
    $.jStorage.deleteKey("player");
}