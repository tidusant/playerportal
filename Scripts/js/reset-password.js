$(function () {
    var $w = $(wallet);

    $w.on("passwordKeyValidationCalled", function (ev, wasSuccessful, message) {
        if (!wasSuccessful) {
            $(".reset-password-form").hide();
            alert(message);
            window.location.href = $("#login").val();
        }
    });

    $w.on("passwordResetCalled", function (ev, successMessage) {
        alert("Reset successful! Please log in...");
        window.location.href = $("#login").val();
    });

    $(".btn-reset").click(function () { passwordReset(); });

    validateKey();
});

function validateKey() {
    var key = $(".reset-key").val();
    wallet.passwordResetKeyValidation(key);
}


function passwordReset() {
    var username = $(".reset-username").val();
    var currpass = "";//$(".current-password").val();
    var newpass = $(".new-password").val();
    var confirmpass = $(".confirm-password").val();
    var key = $(".reset-key").val();
    wallet.passwordReset(username, currpass, newpass, confirmpass, key);
}
