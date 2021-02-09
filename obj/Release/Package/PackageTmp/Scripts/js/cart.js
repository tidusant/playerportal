var topNumbers = 0;
var topPicks = 0;
var bottomNumbers = 0;
var bottomPicks = 0;

var betId = 0;
var lineId = 0;

var extraBoolAmt = 1.00;
$(function () {
    var $l = $(lottery);
    var $w = $(wallet);
	
	$w.on("loadPlayerCalled", function (ev, player) {
        if (player != null) {
			displayCheckoutCart();
		}
		else{
		}
    });
	
    $l.on("orderPlacedCalled", function (ev, wasSuccessful) {
        if (wasSuccessful) {
            updateBalance();
            $.jStorage.set("player", lottery.player);
            $(".welcome-text").text("Welcome " + lottery.player.username + "! ($" + lottery.player.balance + ")");
            emptyCart();
            displayCheckoutCart();
			alert("Order placed successfully!");
        }
        else {
            //alert("Something went wrong");
        }
    });

	
    $(document).on("click", ".checkout-line-delete", function () {
        var id = $(this).find(".checkout-line-id").val();
        removeItem(id);
        displayCartMenu();
        pulseCart();
        displayCheckoutCart();
    });

    $(document).on("click", ".edit-bet", function () {
        betId = $(this).parent().find(".checkout-bet-id").val();
        lineId = $(this).parent().find(".checkout-bet-line-id").val();
        setupModal();
        $(".modal-pick-numbers").modal();
    });

    $(document).on("click", '.checkout-line-extra-bool', function (e) {
        betId = $(this).closest(".rtable").find(".checkout-bet-id").val();
        lineId = $(this).closest(".rtable").find(".checkout-bet-line-id").val();
        var checked = $(this).is(':checked');
        
        var cart = getCart();
        cart.lines[lineId].bets[betId].extraData = checked;

        var AmtToAddOn = ((checked ? parseFloat(extraBoolAmt) : (parseFloat(extraBoolAmt) * -1)) * (parseFloat(cart.lines[lineId].bets[betId].advanced)))

        var Amt = (parseFloat(cart.lines[lineId].bets[betId].amount) + AmtToAddOn);

        cart.lines[lineId].bets[betId].amount = Amt;

        cart.lines[lineId].lineTotal = parseFloat(cart.lines[lineId].lineTotal) + AmtToAddOn;
        cart.total = parseFloat(cart.total) + AmtToAddOn;

        var states = saveLineState();
        saveCart(cart);
        displayCheckoutCart();
        loadLineState(states);
    });

    $(document).on("click", ".btn-confirm-numbers-update", function () {
        updateBet();
        $(".modal-pick-numbers").modal("hide");
    });

    $(document).on("click", ".btn-add-bet", function () {
        newRandomBet(this);
    });

    $(document).on("click", ".btn-del-bet", function () {
        removeLastBet(this);
    });

    $(document).on("click", ".btn-add-draw", function () {
        updateDraw(this, 1);
    });

    $(document).on("click", ".btn-del-draw", function () {
        updateDraw(this, -1);
    });

    //This is for if you want the whole row to toggle instead of just the carat, this is not this way so that it doesn't
    //interfere with other controls on the row.
    //$('body').on('click.collapse-next.data-api', '[data-toggle=collapse-next]', function (e) {
    //    var $target = $(this).next().find(".line-details");
    //    $target.collapse('toggle');
    //})

    $(document).on('click', '.caret', function (e) {
        var $target = $(this).closest(".checkout-line").next().find(".line-details");
        $target.collapse('toggle');

        $(this).closest(".caret-holder").toggleClass("dropup");
    })

    $(".signOut").click(function () {
        //displaySignInUp();
    });
    $(".btnSignIn").click(function () {
        // displayPlaceOrderBtn();
    });
    $(".checkout-place-order").click(function () {
        placeOrder();
    });


    //displayCheckoutCart();

    if ($.jStorage.get("player") != null) {
        displayPlaceOrderBtn();
    }
    else {
        displaySignInUp();
    }
});


function displayCheckoutCart() {
    var cart = getCart();
    $(".checkout-body").empty();

    if (cart.lines.length > 0) {
        for (var i = 0; i < cart.lines.length; i++) {
            var template = document.querySelector('#checkout-line-template');
            var newLine = document.importNode(template.content, true);
            var line = cart.lines[i];

            newLine.querySelector(".checkout-line-gameName").innerHTML = line.gameName;
            newLine.querySelector(".checkout-line-betCount").innerHTML = line.bets.length;
            newLine.querySelector(".checkout-line-DrawCount").innerHTML = line.advancedPlay;
            newLine.querySelector(".checkout-line-total").innerHTML = "$" + line.lineTotal.toFixed(2);
            newLine.querySelector(".checkout-line-id").value = i;
            //newLine.querySelector(".gameImg").src = line.img;
            //newLine.querySelector(".gameImg").alt = line.gameName;
			newLine.querySelector(".gameImg").display = "none";

            //Add the bets
            for (var x = 0; x < line.bets.length; x++) {
                var bettemplate = document.querySelector('#checkout-line-details-template');
                var newbetLine = document.importNode(bettemplate.content, true);
                var bet = line.bets[x];

                newbetLine.querySelector(".checkout-line-numbers-list-header").innerHTML += "Line " + (parseInt(x) + 1);
                newbetLine.querySelector(".checkout-bet-id").value = x;
                newbetLine.querySelector(".checkout-bet-line-id").value = i;

                if (bet.extraData != "") {
                    if (bet.extraData == true) {
                        newbetLine.querySelector(".checkout-line-extra-bool").checked = true;
                    }
                    else {
                    }
                }

                //Dirty Hard Coded Game Name Displaying
                switch (line.gameName) {
                    case "Lotto 6aus49":
                        //newLine.querySelector(".extra-numbers-text").innerHTML = (line.extraNumbersText);
                        //newLine.querySelector(".extra-numbers-container").style.display = 'block';
                        newbetLine.querySelector(".checkout-line-extra").style.visibility = 'hidden';
                        break;
                    case "Mega Millions":
                        newbetLine.querySelector(".extra-text").innerHTML = (line.extraBoolText);
                        //newLine.querySelector(".extra-numbers-container").style.visibility = 'hidden';
                        newbetLine.querySelector(".checkout-line-extra").style.display = 'block';
                        break;
                    case "Powerball":
                        newbetLine.querySelector(".extra-text").innerHTML = (line.extraBoolText);
                        //newLine.querySelector(".extra-numbers-container").style.visibility = 'hidden';
                        newbetLine.querySelector(".checkout-line-extra").style.display = 'block';
                        break;
                    default:
                        //newLine.querySelector(".extra-numbers-container").style.visibility = 'hidden';
                        newbetLine.querySelector(".checkout-line-extra").style.visibility = 'hidden';
                }

                //Balls
                for (var num = 0; num < bet.numbers.length; num++) {
                    var li = document.createElement("li");
                    li.innerHTML = bet.numbers[num];
                    newbetLine.querySelector(".checkout-line-numbers-list").appendChild(li);
                }

                //BonusBalls
                for (var num = 0; num < bet.extraBallNumbers.length; num++) {
                    var li = document.createElement("li");
                    li.innerHTML = bet.extraBallNumbers[num];
                    li.className += "luckyNum";
                    newbetLine.querySelector(".checkout-line-extranumbers-list").appendChild(li);
                }


                newLine.querySelector(".drawing-holder").appendChild(newbetLine);
            }
            $(".checkout-body").append(newLine);
        }

        $(".checkout-total").text("$" + cart.total.toFixed(2));
    }
    else {
        var template = document.querySelector('#cart-empty');
        var newLine = document.importNode(template.content, true);
        $(".checkout-body").append(newLine);
        $(".checkout-total").text("");
        $('.checkout-place-order').prop('disabled', true);
    }
}

function makeBetControl(bet) {
    //Add the bets
    var bettemplate = document.querySelector('#checkout-line-details-template');
    var newbetLine = document.importNode(bettemplate.content, true);
    //var bet = line.bets[x];

    newbetLine.querySelector(".checkout-line-numbers-list-header").innerHTML += "Line " + betId;
    newbetLine.querySelector(".checkout-bet-id").value = betId;
    newbetLine.querySelector(".checkout-bet-line-id").value = lineId;
    //Balls
    for (var num = 0; num < bet.numbers.length; num++) {
        var li = document.createElement("li");
        li.innerHTML = bet.numbers[num];
        newbetLine.querySelector(".checkout-line-numbers-list").appendChild(li);
    }

    //BonusBalls
    for (var num = 0; num < bet.extraBallNumbers.length; num++) {
        var li = document.createElement("li");
        li.innerHTML = bet.extraBallNumbers[num];
        li.className += "luckyNum";
        newbetLine.querySelector(".checkout-line-extranumbers-list").appendChild(li);
    }


    return newbetLine;
}

function displayPlaceOrderBtn() {
    $(".checkout-sign-inup-div").hide();
    $(".checkout-place-order-div").show();
}

function displaySignInUp() {
    $(".checkout-sign-inup-div").show();
    $(".checkout-place-order-div").hide();
}

function placeOrder() {
    var lines = getCart().lines;
    var bets = [];
    for (var i = 0; i < lines.length; i++) {
        bets = bets.concat(lines[i].bets);
    }

    lottery.placeOrder(bets);
}

function updateBalance() {
    var cart = getCart();

    var newBalance = parseFloat(lottery.player.balance) - parseFloat(cart.total);
    lottery.player.balance = newBalance;
}

function setupModal(button) {
    var cart = getCart();

    topNumbers = cart.lines[lineId].topNumbers;
    topPicks = cart.lines[lineId].topPicks;
    bottomNumbers = cart.lines[lineId].bottomNumbers;
    bottomPicks = cart.lines[lineId].bottomPicks;

    $('.mtable').find('.liHolder').empty();
    $('.mtable').find('.luckyHolder').empty();


    initMtable(0);

    var bet = cart.lines[lineId].bets[betId];

    for (var i = 0; i < bet.numbers.length; i++) {
        $('.mtable').find('.liHolder').find("li").each(function (index, element) {
            if ($(element).html() == bet.numbers[i]) {
                $(element).addClass("active");
            }
        });
    }

    for (var i = 0; i < bet.extraBallNumbers.length; i++) {
        $('.mtable').find('.luckyHolder').find("li").each(function (index, element) {
            if ($(element).html() == bet.extraBallNumbers[i]) {
                $(element).addClass("active");
            }
        });
    }
}

function updateBet() {
    var cart = getCart();
    var bet = cart.lines[lineId].bets[betId];

    var items = [];
    var xitems = [];

    $('.mtable').find('.liHolder').each(function (index, element) {
        //Push the selected numbers
        $(this).find('li.active').each(function (index, element) {
            items.push($(element).html());
        });
    });

    $('.mtable').find('.luckyHolder').each(function (index, element) {
        //Push the Lucky Numbers
        $(this).find('li.active').each(function (index, element) {
            xitems.push($(element).html());
        });
    });

    bet.numberString = items.join(",");
    bet.extraNumberString = xitems.join(",");
    bet.numbers = items;
    bet.extraBallNumbers = xitems;

    saveCart(cart);
}

function newRandomBet(btn) {
    var cart = getCart();

    lineId = $(btn).closest(".checkout-line").find(".checkout-line-id").val();
    var wasOpen = $(btn).closest(".checkout-line").find(".caret-holder").hasClass("dropup");

    var states = saveLineState();

    var newBet = cart.lines[lineId].bets[cart.lines[lineId].bets.length - 1];
    var Amt = (parseFloat(newBet.amount) * (parseFloat(newBet.advanced)));

    cart.lines[lineId].lineTotal = parseFloat(cart.lines[lineId].lineTotal) + parseFloat(Amt);
    cart.total = parseFloat(cart.total) + parseFloat(Amt);

    cart.lines[lineId].bets.push(newBet);
    saveCart(cart);
    betId = cart.lines[lineId].bets.length - 1;
    setupModal();
    quickPick(0);
    updateBet();
    displayCheckoutCart();
    loadLineState(states);
}

function removeLastBet(btn) {
    var cart = getCart();

    lineId = $(btn).closest(".checkout-line").find(".checkout-line-id").val();
    if (cart.lines[lineId].bets.length > 1) {
        var Bet = cart.lines[lineId].bets[cart.lines[lineId].bets.length - 1];
        var Amt = (parseFloat(Bet.amount) * (parseFloat(Bet.advanced)));

        cart.lines[lineId].lineTotal = parseFloat(cart.lines[lineId].lineTotal) - parseFloat(Amt);
        cart.total = parseFloat(cart.total) - parseFloat(Amt);

        var states = saveLineState();
        cart.lines[lineId].bets.pop();
        saveCart(cart);
        displayCheckoutCart();
        loadLineState(states);
    }
}

function updateDraw(btn, amt) {
    var cart = getCart();

    lineId = $(btn).closest(".checkout-line").find(".checkout-line-id").val();
    var line = cart.lines[lineId];
    var newDrawCount = parseInt(line.advancedPlay) + parseInt(amt);
    if (newDrawCount > 0) {
        line.advancedPlay = newDrawCount;

        for (var i = 0; i < line.bets.length; i++) {
            line.bets[i].advanced = newDrawCount;
        }

        var betsPrice = parseFloat(line.bets[0].amount) * parseFloat(line.bets.length);

        cart.total = parseFloat(cart.total) - parseFloat(line.lineTotal);//Subtract out the current total of the line so we can just throw the new one in.
        line.lineTotal = (betsPrice * parseFloat(line.advancedPlay));
        cart.total = parseFloat(cart.total) + parseFloat(line.lineTotal);//Add the whole new line total back in
        
        saveCart(cart);
        displayCheckoutCart();
        loadLineState(states);
    }
}

function initMtable(num) {
    $('.liHolder:eq(' + num + ')').each(function (index, element) {
        for (var i = 1; i <= topNumbers; i++) {
            $(this).append('<li>' + i + '</li>');
        }
    });
    $('.luckyHolder:eq(' + num + ')').each(function (index, element) {
        for (var i = 1; i <= bottomNumbers; i++) {
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
        if ($items.length < topPicks) {
            $(this).parent().parent().find('.select_descr').html('Select ' + (topPicks - $items.length) + ' Numbers');
        } else $(this).parent().parent().find('.select_descr').html('Ok');
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
            $(this).parent().parent().find('.select_descr_l').html('Select ' + (bottomPicks - $items.length) + ' Lucky Numbers');
        } else $(this).parent().parent().find('.select_descr_l').html('Ok');
    });
}

function quickPick(num, where) {

    if (num == 0) {
        clearItems(0, 0);
        $('.liHolder').each(function (index, element) {
            clickItems($(this), topPicks, topNumbers);
        });
        $('.luckyHolder').each(function (index, element) {
            clickItems($(this), bottomPicks, bottomNumbers);
        });
    } else {
        clearItems(num, where);
        $(where).parent().parent().find('.liHolder').each(function (index, element) {
            clickItems($(this), topPicks, topNumbers);
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
}

function clearItems(num, where) {
    if (num == 0) {
        $('.mtable').find('li').removeClass('active');
        $('.select_descr').html('Select ' + topPicks + ' Numbers');
        $('.select_descr_l').html('Select ' + bottomPicks + ' Lucky Numbers');
    } else {
        $(where).parent().parent().find('li').removeClass('active');
        $(where).parent().parent().find('.select_descr').html('Select ' + topPicks + ' Numbers');
        $(where).parent().parent().find('.select_descr_l').html('Select ' + bottomPicks + ' Lucky Numbers');
    }
}

function saveLineState() {
    var states = [];
    var count = $(".checkout-line-id").length;
    for (var i = 0; i < count; i++) {
        states.push($(".checkout-line-id[value='" + i + "']").closest(".checkout-line").find(".caret-holder").hasClass("dropup"));
    }
    return states;
}

function loadLineState(states) {
    for (var i = 0; i < states.length; i++) {
        if (states[i]) {
            var $target = $(".checkout-line-id[value='" + i + "']").closest(".checkout-line").next().find(".line-details");
            $target.addClass("tmp");
            $target.collapse('toggle');
            $target.removeClass("tmp");
            $(".checkout-line-id[value='" + i + "']").closest(".checkout-line").find(".caret-holder").toggleClass("dropup");
        }
    }
}