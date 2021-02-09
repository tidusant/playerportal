$(function () {
    var $l = $(lottery);
    var $w = $(wallet);
    $w.on("loadPlayerCalled", function (ev, player) {
        if (player != null) {
            $.jStorage.set("player", player);
            $.jStorage.set("token", wallet.token);
            window.location.href = "/account/accountmanagement";
        }
        else {
        }
    });




    $(".btnSignIn").click(function () {
        //  window.location.href = "/account/accountmanagement";
        getUser();
    });
});