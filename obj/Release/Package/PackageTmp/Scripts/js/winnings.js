
$(function () {
    var $l = $(lottery);
    var $w = $(wallet);

    $l.on("getGamesCalled", function (ev, games, gameType) {
        populateDropdown(games);
        gameID = $("#drawings").val() == "null" ? null : $("#drawings").val();
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

    gameID = null;
    getResults();
});

function getResults() {
    lottery.getWinningResults(gameType);
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
                    li = document.createElement("li");
                    li.innerHTML = "<br />";
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