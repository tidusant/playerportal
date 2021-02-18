/**
 * Global variables
 */
//4LL LOTTERY/ SETUP GLOBALS
var loturl = "https://lottery.tanddentertainment.com";
var walurl = "https://wallet.tanddentertainment.com";
var gamurl = "http://localhost:64957/";
var fkey = "B60B02E8-BF1A-489A-8234-F2BC3F7A69AE"; //Franchise Key

// Display options
var currencySymbol = "CaD ";
var numDecimals = 2;

var lottery = null;
var wallet = null;
var games = null;
var webcalloutCount = 0; // Tracks # of levels deep calls out are done, to allow client to have "busy" status
$(function () {
    wallet = new walletInit(walurl, jQuery, fkey);
    lottery = new lotteryInit(loturl, jQuery, fkey);

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