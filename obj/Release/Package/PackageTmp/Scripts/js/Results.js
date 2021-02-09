
$(function () {
    var $l = $(lottery);
    var $w = $(wallet);

    $l.on("getGamesCalled", function (ev, games, gameType) {
        //populateDropdown(games);
        //gameID = $("#drawings").val() == "null" ? null : $("#drawings").val();
        gameID = null;
        getResults();
    });
    $l.on("winningNumbersLoaded", function (ev, winningNumberResult) {
        if ($("#drawings").children('option').length <= 0) {
            populateDropdown(winningNumberResult);
        }
        displayGamesResults(winningNumberResult);
    });

    $("#drawings").change(function () {
        gameID = $("#drawings").val() == "null" ? null : $("#drawings").val();
        getResults();
    });

    //gameID = null;
    //getResults();
});

function getResults() {
    lottery.getWinningResults(null);
}

function populateDropdown(results) {
    $("#drawings").empty();
    var select = $("#drawings");
    var option = document.createElement("option");
    option.textContent = "All";
    option.value = null;
    select.append(option);
    var lastName = "";

    for (var i = 0; i < results.length; i++) {

        var result = results[i];
        var name = result.games_Lottery_GameTypeGroup_Name == null ? result.name : result.games_Lottery_GameTypeGroup_Name
        var exists = name == lastName;

        if (!exists) {
            var option = document.createElement("option");
            option.textContent = name;
            option.value = result.lotteryGameTypeID;

            select.append(option);
            lastName = name;
        }
    }

}

function displayGamesResults(results) {
    $("#winning-numbers").trigger("done-loading");
    $(".game-results-table-body").empty();
    var lastID = "";
    var lastDT = "";
    for (var i = 0; i < results.length; i++) {

        var result = results[i];
        var partners = [];

        var validationID = result.games_Lottery_GameTypeGroup_ID == null ? result.lotteryGameTypeID : result.games_Lottery_GameTypeGroup_ID;
        if ((validationID != lastID || (validationID == lastID && result.drawingDT != lastDT)) && result.ballCountOnOrder > 2) {
            if (document.querySelector(".game-results-table") != null) {
                template = document.querySelector('#game-results-row-template');
                newLine = document.importNode(template.content, true);

                newLine.querySelector(".game-name").innerHTML = result.games_Lottery_GameTypeGroup_Name == null ? result.name : result.games_Lottery_GameTypeGroup_Name;
                newLine.querySelector(".last-drawing").innerHTML = new Date(result.drawingDT).toLocaleDateString();
                newLine.querySelector(".gameImg").display = "none";

                for (var num = 0; num < result.ballCountOnOrder; num++) {
                    var li = document.createElement("li");
                    li.innerHTML = parseInt(result["b" + (num + 1)]);

                    if (num < result.ballCount) {
                        newLine.querySelector(".game-results-row-numbers-list").appendChild(li); //Balls
                    }
                    else {
                        li.className += "luckyNum";
                        newLine.querySelector(".game-results-row-extranumbers-list").appendChild(li); //Bonus Balls
                    }
                }

                if (result.games_Lottery_GameTypeGroup_ID == null) {
                    partners = $.grep(results, function (e) {
                        return (e.drawingDT == result.drawingDT &&
                                e.lotteryGameTypeID == result.lotteryGameTypeID &&
                                e.ballCountOnOrder > result.ballCountOnOrder &&
                                e.ballCountOnOrder > 2);
                    });
                }
                else {
                    //partners = $.grep(results, function (e) { return (e.drawingDT == result.drawingDT && e.games_Lottery_GameTypeGroup_ID == result.games_Lottery_GameTypeGroup_ID); });
                }
                for (var x = 0; x < partners.length; x++) {
                    var partner = partners[x];
                    li = document.createElement("br");
                    //li.innerHTML = "<br />";
                    //li.className += "ball-line-break";
                    //li.innerHTML = "/";
                    newLine.querySelector(".game-results-row-numbers-list").appendChild(li);

                    for (var num = 0; num < partner.ballCountOnOrder; num++) {
                        var li = document.createElement("li");
                        li.innerHTML = parseInt(partner["b" + (num + 1)]);

                        if (num < partner.ballCount) {
                            newLine.querySelector(".game-results-row-numbers-list").appendChild(li); //Balls
                        }
                        else {
                            li.className += "luckyNum";
                            newLine.querySelector(".game-results-row-extranumbers-list").appendChild(li); //Bonus Balls
                        }
                    }
                }
                $(".game-results-table-body").append(newLine);
                lastID = result.games_Lottery_GameTypeGroup_ID == null ? result.lotteryGameTypeID : result.games_Lottery_GameTypeGroup_ID;
                lastDT = result.drawingDT;
            }
        }
    }
}

//function loadGamesDDL(games) {
//    var select = $(".sub-games-list");
//    var lastGroupID = null;
//    var optGroup = null;
//    for (var i = 0; i < games.length; i++) {
//        var game = games[i];
//        if (game.games_Lottery_GameTypeGroup_ID != null || game.games_Lottery_GameTypeGroup_ID != undefined) {
//            if (lastGroupID != game.games_Lottery_GameTypeGroup_ID) {
//                optGroup = document.createElement("optgroup");
//                optGroup.label = game.games_Lottery_GameTypeGroup_Name;
//                lastGroupID = game.games_Lottery_GameTypeGroup_ID;
//                select.append(optGroup);
//            }
//        }
//        else {
//            lastGroupID = null;
//            optGroup = null;
//        }
//        var option = document.createElement("option");
//        option.textContent = game.houseName;
//        option.value = game.houseAbbreviation;
//        if (optGroup != null || optGroup != undefined) {
//            optGroup.append(option);
//        }
//        else {
//            select.append(option);
//        }
//    }
//}

//$(function () {
//    var $l = $(lottery);

//    $l.on("winningNumbersLoaded", function (ev, results) {
//        populateWinningNumbersDDL(results);
//        doneLoading();
//    });

//    if ($("#winningdate") != null) {
//        loading("LOADING NUMBERS");
//        getWinningResults();
//        $("#winningdate").change(function () {
//            displayWinningNumbers($(this).val());
//        });
//    }
//});

//function displayGameResults(game) {
//    $(".game-result-jackpot").text("$" + (game.jackpotAmount == null ? "0.00" : parseFloat(game.jackpotAmount.toFixed(2)).toLocaleString()));
//    document.querySelector(".game-result-img").src = "data:" + game.imageMimeType + ";base64," + game.imageData;

//    InitClock($('.gamelistTimer'), game.closeDT);
//}
//function populateWinningNumbersDDL(results) {
//    for (var i = 0; i < results.length; i++) {
//        var result = results[i];
//        var option = document.createElement("option");
       
//        var val = "";

//        for (var num = 0; num < result.ballCountOnOrder; num++) {
//            if (num < result.ballCount) {
//                val += (num > 0 ? "-" : "") + parseInt(result["b" + (num + 1)]).toString(); //Balls
//            }
//            else {
//                val += "/" + parseInt(result["b" + (num + 1)]).toString(); //Bonus Balls
//            }
//        }
//        option.text = (new Date(result.drawingDT).toLocaleDateString());
//        option.value = val;
//        $("#winningdate").append(option);
//    }
//    displayWinningNumbers($("#winningdate").val());
//}
//function displayWinningNumbers(numbers) {
//    $(".rtable").empty();
//    var extranums = numbers.split("/");
//    var nums = extranums[0].split("-");
//    extranums.splice(0, 1);//Remove the normal numbers.

//    var template = document.querySelector('#game-results-row-template');
//    var newLine = document.importNode(template.content, true);

//    for (var num = 0; num < nums.length; num++) {
//        var li = document.createElement("li");
//        li.innerHTML = parseInt(nums[num]);

//        newLine.querySelector(".game-results-row-numbers-list").appendChild(li); //Balls
//    }

//    for (var num = 0; num < extranums.length; num++) {
//        var li = document.createElement("li");
//        li.innerHTML = parseInt(extranums[num]);
//        li.className += "luckyNum";

//        newLine.querySelector(".game-results-row-extranumbers-list").appendChild(li); //Bonus Balls
//    }

//    $(".rtable").append(newLine);
//}