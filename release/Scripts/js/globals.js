/**
 * Global variables
/**
 * Global variables
 */
//4LL LOTTERY/ SETUP GLOBALS
//var siteurl = "http://50.204.72.53:81/PlayerPortal_L4/"
//var loturl = "https://lottery.tanddentertainment.com";
//var walurl = "http://50.204.72.53:81/WalletAPI";
//var gamurl = "http://50.204.72.53:81/WalletAPI";
//var apiurl = "http://50.204.72.53:81/api/PlayerPortalAPI";
//var fkey = "B60B02E8-BF1A-489A-8234-F2BC3F7A69AE"; //Franchise Key


var siteurl = "https://www.tanddentertainment.net/PlayerPortalNew/";
var loturl = "https://lottery.tanddentertainment.net";
var walurl = "https://www.tanddentertainment.net/WalletAPI";
var gamurl = "https://www.tanddentertainment.net/WalletAPI";
var apiurl = "https://www.tanddentertainment.net/WalletAPI";
var fkey = "B60B02E8-BF1A-489A-8234-F2BC3F7A69AE"; //Franchise Key

// Display options
var currencySymbol = "CaD ";
var numDecimals = 2;

var lottery = null;
var wallet = null;
var games = null;
var webcalloutCount = 0; // Tracks # of levels deep calls out are done, to allow client to have "busy" status

$(function () {  
    wallet = new walletInit(walurl, jQuery, fkey, "en-US");
   // lottery = new lotteryInit(loturl, jQuery, fkey, "en-US");
    //EVENTS
   
    $(wallet).on("errorOccurred", function (ev, error, isFatal) {
        errorOccured(ev, error, isFatal);
    });

    if ($.jStorage.get("token") != null) {
        wallet.token = $.jStorage.get("token");
    }
    


});

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
            // Validation
        case "CUSTOMER_MESSAGE_VALIDATION_FAILED":
            return "The system failed to send the validation message. Please try again.";
        case "CUSTOMER_EMAIL_INVALID":
            return "Your email address does not appear to be in a valid format. Please correct this and try again.";
        case "CUSTOMER_CELLPHONE_INVALID":
            return "Your cell phone number does not appear to be in international format (MSISDN) for sending SMS messages. Please correct this and try again.";
        case "CUSTOMER_DUPLICATE_VALIDATION_MESSAGE":
            return "You must wait a bit before attempting to resend the confirmation code.";
        case "CUSTOMER_UNKNOWN_VALIDATION_TYPE":
            return "The system could not determine what type of validation you are requesting. Please try again.";
        case "CUSTOMER_CONFIRM_VALIDATION_FAILED":
            return "There was an issue validating the code entered. Please try again.";
        case "CUSTOMER_INVALID_CODE":
            return "The code you entered was invalid or not found, it must be six digits long. Please re-enter and try again.";
        case "CUSTOMER_EXPIRED_CODE":
            return "The code you entered has expired. You will need to send another validation request.";
        case "TOKEN_CHECK_UNSUCCESSFUL":
            window.location.href = "login.html";
            return "TOKEN_CHECK_UNSUCCESSFUL";
        default: // idk
            return message;
    }
}

function changepin() {

    if (confirm('Are you sure you want to change your PIN?')) {
        //layer.open({ type: 2, shadeClose: false });
        var CurrentPIN = $("#CurrentPIN").val();
        var NewPIN = $("#NewPIN").val();
        var ConfirmPIN = $("#ConfirmPIN").val();
        wallet.changePin(CurrentPIN, NewPIN, ConfirmPIN);

    }
}

function editaccount() {
    //check validate

    if ($("#FirstName").val().trim() == "") {
        errorOccured(null, "Please input FirstName", false);
        $("#FirstName").focus();
        return;
    }
    if ($("#LastName").val().trim() == "") {
        errorOccured(null, "Please input LastName", false);
        $("#LastName").focus();
        return;
    }
    if ($("#Birthday").val().trim() == "") {
        errorOccured(null, "Please input Birthday", false);
        $("#Birthday").focus();
        return;
    }
    var today = new Date();
    var yearrequire = today.getFullYear() - 18;
    var month = today.getMonth() + 1;
    var date = today.getDate();
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    var birthdaylimit = yearrequire + "-" + month + "-" + date;
    if ($("#Birthday").val() > birthdaylimit) {
        errorOccured(null, "You must over 18!", false);
        $("#Birthday").focus();
        return;
    }
    if ($("#EmailAddress").val().trim() == "" && $("#CellPhone").val().trim() == "") {
        errorOccured(null, "Please input EmailAddress or CellPhone", false);
        $("#EmailAddress").focus();
        return;
    }

    //layer.open({ type: 2, shadeClose: false });   
    wallet.editDetails($("#FirstName").val(),
        $("#LastName").val(),
        $("#Gender").val(),
        $("#Birthday").val(),
        $("#EmailAddress").val(),
        $("#CellPhone").val(),
        $("#PhoneNumber").val(),
        $("#Employer").val(),
        $("#AddressLine1").val(),
        $("#AddressLine2").val(),
        $("#AddressLine3").val(),
        $("#AddressLine4").val(),
        $("#Locality").val(),
        $("#Region").val(),
        $("#Postcode").val(),
        $("#Country").val());

}
function getUser() {
    
    var username = $("#uname").val();
    var pass = $("#pwd").val();
    if (username.trim() == "" || pass.trim() == "") {
        errorOccured(null, "Please input Card Number and PIN!");
        return;
    }
    layer.open({ type: 2, shadeClose: false });
    wallet.getPlayer(username, pass);

    var $w = $(wallet);


}
function loadUser() {
    var PlayerID = $.jStorage.get("PlayerID");
    var Player = $.jStorage.get("Player");
    var Account = $.jStorage.get("Account");

    if (Player != null && Player != undefined) {
        $("#account_fullname").html(Player.Name);
        var balancestr = Number(Player.TotalAmount).toFixed(2);
        balancestr += " " + Account.Currency
        $("#account_balance").html(balancestr);

        $("#account-customer-id").text(PlayerID);
        $("#account-customer-username").text(Player.Name);
        $("#account-customer-full-name").text(Account.FirstName + " " + Account.LastName);
        $("#account-customer-balance").text(parseFloat(Player.TotalAmount).toFixed(2));
        $("#account-customer-currency").text(Account.Currency);

        $("#account-customer-id").text(PlayerID);
        $("#FirstName").val(Account.FirstName);
        $("#LastName").val(Account.LastName);
        $("#Gender").val(Account.Gender);
        $("#EmailAddress").val(Account.EmailId);
        $("#Employer").val(Account.Employer);
        $("#CellPhone").val(Account.Phone);
        $("#PhoneNumber").val(Account.PhoneNumber);
        $("#AddressLine1").val(Account.Address);
        $("#AddressLine2").val(Account.AddressLine1);
        $("#AddressLine3").val(Account.AddressLine2);
        $("#AddressLine4").val(Account.AddressLine3);
        $("#Country").val(Account.Country);
        $("#Postcode").val(Account.Zipcode);
        var Birthday = Account.DateOfBirth;
        // implement nullcheck on 08-jan-2018
        if (Birthday != null) { 
            Birthday = Birthday.substring(5, 7) + "/" + Birthday.substring(8, 10) + "/" + Birthday.substring(0, 4);
        }        
        $("#Birthday").val(Birthday);
        $("#Locality").val(Account.City);
        $("#Region").val(Account.State);
    }


}
function unloadUser() {
    wallet.player = null;
    wallet.account = null;
    wallet.LogoutPlayer();

    window.location = siteurl;
}
function GetPlayerDetails() {
    wallet.getPlayerDetails();
}

//function transactions() {
//    var sDate = $("#StartDate").val();
//    var eDate = $("#EndDate").val();
//    var CardNumber = $.jStorage.get("CardNumber");
//    //layer.open({ type: 2, shadeClose: false });
//    wallet.transactions(CardNumber, sDate, eDate);

//}



//function checklogin() {

//    if ($.jStorage.get("Player") != null) {
//        $(".profile_loggedout").hide();
//        $(".profile_loggedin").show();
//        console.log("logged in");
//    } else {
//        console.log("logged out");
//        $(".profile_loggedout").show();
//        $(".profile_loggedin").hide();
//    }
//    loadUser();
//}

function logout() {
    layer.open({ type: 2, shadeClose: false });
    wallet.player = null;
    wallet.account = null;
    wallet.LogoutPlayer();
    //for local test
    //wallet = null;
    //$.jStorage.flush();
    //window.location = siteurl;
}


function login() {
    //validate

    getUser();
}