$(window).bind("scroll", function() {

    if ($(this).scrollTop() > 200) {
        $("#totop2").fadeIn();
    } else {
        $("#totop2").stop().fadeOut();
    }

});

$(document).ready(function () {
    checklogin();
    $('.banner-cycle').cycle();
    $('#popup-overlay').on('click', function (e) {
        if (e.target === this) {
            closePop();
        }
        
    });
    //check captcha
    var faillogin=$.jStorage.get("faillogin");
    if(faillogin==''||faillogin==undefined)faillogin=0;
    if(faillogin>=3){
        //show captcha
        
        Captcha();
        $('#captchaContent').show();
    }

    
   
});

function loginSubmit(){
    //check captcha
     var faillogin=$.jStorage.get("faillogin");
    if(faillogin==''||faillogin==undefined)faillogin=0;
    if(faillogin>=3){
        if(!ValidCaptcha()){
            alert('Invalid Captcha Input!');
            Captcha();
            return false;
        }
    }

    var $name = $("#uname").val();
        var $pwd = $("#pwd").val();
        var $captcha = $("#captcha").val();
        var regu = "^[ ]+$";
        var regex = new RegExp("[\\s]");
        var re = new RegExp(regu);
        if ($name == "" || re.test($name) || regex.test($name)) {
            $(".error-message").css("display","inline-block");
            $("#loginerror").html("Please input username");
            
        } else if ($pwd == "") {
            $(".error-message").css("display", "inline-block");
            $("#loginerror").html("Please input password");
            
        } else {
            
            $("#Login_Submit").hide();    
            $("#loading_login").show();
            getUser();
            
        }
    return false;
}

function closePop() {
    $('#popup-overlay').hide();
    $('#login-popup').hide();
}

function openLogin() {    
    $('#popup-overlay').show();
    $('#login-popup').show();
}



function closePopUps() {
    $('#pop-backdrop').fadeOut();
    $('.pop-wrap').fadeOut();
    $('.trypopup').fadeOut();
}

//4LL functions

function getUserViaSession() {
    wallet.getPlayerViaSession();
}
function loadPlayer() {
    //Load The Player (if there is one)
    if ($.jStorage.get("player") != null) {
        wallet.player = $.jStorage.get("player");
        wallet.token = $.jStorage.get("token");
        if (typeof loadAccount == 'function') {
            loadAccount();
        }
        else {
            getUserViaSession();
        }
    }
    else {
        //Do no player loaded stuff
        $(".logout").hide();
        $("#addToCart").hide();
        $(".login").show();
    }
}
function geoLocation() {
    wallet.geoLocation();
}
function SetCoords(lat, long) {
    $("#coords").val(lat + "," + long);
    coords = $("#coords").val();
    wallet.coords = coords;
    //$.jStorage.set("coords", coords);
}
function geoSuccess(position) {
    SetCoords(position.coords.latitude.toString(), position.coords.longitude.toString());
    loadPlayer();
}
function geoFail(e) {
    switch (e.code) {
        case e.TIMEOUT:
            navigator.geolocation.getCurrentPosition(geoSuccess, geoFail);
            break;
        default:
            alert(e.message);
    };

}

function getGames(images, gameTypeID) {
    try {
        lottery.getGames(images, gameTypeID);
    } catch (err) {
        alert("Something went wrong loading the games!");
    }
}
function initKenoGames(games) {
    //Layout Display Calls
    $(".games-dropdown").empty();
    var li = document.createElement("li");
    li.innerHTML = "<a href='/games/lotto/'>Lotto</a>";
    $(".games-dropdown").append(li);

    for (var i = 0; i < games.length; i++) {

        var game = games[i];
        if (!game.houseName.includes("Direct") && !game.houseName.includes("Perm")) {
            var li = document.createElement("li");
            li.innerHTML = "<a href='/games/keno/" + game.houseAbbreviation + "'>" + game.houseName + "</a>";

            $(".games-dropdown").append(li);
        }
    }
}
function unloadUser() {
    wallet.player = null;
    $.jStorage.deleteKey("player");
    $('.btnlogout').css({ 'display': 'none' });
    $('.login').css({ 'display': 'block' });
    window.location.href = $("#login").val();
}

//Cart
function getCart() {
    //$.jStorage.deleteKey("cart");
    //Load Cart from jstorage
    var cart = $.jStorage.get("cart");
    var player = lottery.player;
    if (cart != null) {//Have a cart
        if (player != null) {//Have a player
            if (cart.playerAccountID != null) {//Current cart belongs to someone
                if (player.playerAccountID == cart.playerAccountID) {//Make sure our cart ties to this player
                    return cart;
                }
                else {//If it doesn't, return a new cart.
                    var newCart = new Object();
                    newCart.lines = [];
                    newCart.total = 0;
                    newCart.playerAccountID = player.playerAccountID;

                    return newCart;
                }
            }
            else {//Make this cart their cart and send it.
                cart.playerAccountID = player.playerAccountID;
                saveCart(cart);
                return cart;
            }

        }
        else {//No player
            if (cart.playerAccountID != null) {//We have a player ID but no player, send a new cart.
                var newCart = new Object();
                newCart.lines = [];
                newCart.total = 0;
                newCart.playerAccountID = null;

                return newCart;
            }
            else {//We have no player and our cart isn't tied to a player, so we can return it.
                return cart
            }
        }
    }
    else {//No cart, send a new one.
        var newCart = new Object();
        newCart.lines = [];
        newCart.total = 0;
        newCart.playerAccountID = player != null ? player.playerAccountID : null;

        return newCart;
    }
}
function saveCart(cart) {
    $.jStorage.set("cart", cart);
    $(".cartCount").text(cart.lines.length);
}
function emptyCart() {
    $.jStorage.deleteKey("cart");
}
function removeItem(id) {
    var cart = getCart();
    if (confirm("Are you sure you want to remove this item from your cart?")) {
        cart.total -= parseInt(cart.lines[id].lineTotal);
        cart.lines.splice(id, 1);
        saveCart(cart);
    }
}
function displayCartMenu() {
    var cart = getCart();
    $(".cartItemsContainer").empty();

    if (cart.lines.length > 0) {
        for (var i = 0; i < cart.lines.length; i++) {
            var template = document.querySelector('#cart-line');
            var newLine = document.importNode(template.content, true);
            var line = cart.lines[i];

            newLine.querySelector(".cart-line-game").innerHTML = line.gameName;
            newLine.querySelector(".cart-line-total").innerHTML = "$" + line.lineTotal.toFixed(2);
            newLine.querySelector(".cart-line-bets").innerHTML = line.bets.length;
            newLine.querySelector(".cart-line-draws").innerHTML = line.advancedPlay;
            newLine.querySelector(".cart-line-id").value = i;
            newLine.querySelector(".menuthumbnail").src = line.img;
            newLine.querySelector(".menuthumbnail").alt = line.gameName;

            $(".cartItemsContainer").append(newLine);
        }
    }
    else {
        var template = document.querySelector('#cart-empty');
        var newLine = document.importNode(template.content, true);
        $(".cartItemsContainer").append(newLine);
        $.jStorage.deleteKey("cart");
    }

    $(".cart-total").text("$" + cart.total.toFixed(2));
    $(".cartCount").text(cart.lines.length);
}
function pulseCart() {
    var header = document.getElementById("cart-header");
    header.setAttribute("class", "cart-header-active")
    setTimeout(function () { header.setAttribute("class", "cart-header") }, 500)
}
function errorOccured(ev, error, isFatal) {
    var ferror = friendlyError(error);
    console.log("ERROR OCCURRED: " + error + " - " + ferror);
    if (isFatal)
        showErrorMessage(ferror);
    else
        window.alert(ferror);
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
            return "Player account is inactive. Please contact customer support.";
        case "PLAYER_SESSION_CLOSED":
            return "Player's session has ended. Please log back in to continue.";
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
        case "NEW_PIN_CANNOT_EQUAL_CURRENT_PIN":
            return "New pin cannot equal current pin.";
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
        case "VALID_CUSTOMER_NOT_FOUND":
            return "Username or password is incorrect";
        case "CUSTOMER_NOT_FOUND":
            return "Please login to continue...";
        default: // idk
            return message;
    }
}


function checklogin() {

    if ($.jStorage.get("Player") != null) {
        $(".profile_loggedout").hide();
        $(".profile_loggedin").show();
        $("#headertop").css("margin-top", "20px");
        console.log("logged in");
        loadUser();
        //for mobile
        if(typeof(isMobile)!="undefined" && isMobile){
            $(".offer-main-container").css("margin-top","120px");
            $('header').css('height','120px');
            $("header .outer .inner .nav-container .selection-container .contact-select").css("margin-right","2px");
        }
    } else {
        console.log("logged out");
        $(".profile_loggedout").show();
        $(".profile_loggedin").hide();
        $("#headertop").css("margin-top", "0px");
        
    }

}

function logout() {    
    //wallet.player = null;
    //wallet.account = null;
    //wallet.LogoutPlayer();

    //for local test
    wallet = null;
    $.jStorage.flush();
    window.location = siteurl;
}

//for captcha function
function Captcha(){
     var alpha = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z', 
            '0','1','2','3','4','5','6','7','8','9');
     var i;
     for (i=0;i<6;i++){
         var a = alpha[Math.floor(Math.random() * alpha.length)];
         var b = alpha[Math.floor(Math.random() * alpha.length)];
         var c = alpha[Math.floor(Math.random() * alpha.length)];
         var d = alpha[Math.floor(Math.random() * alpha.length)];
         var e = alpha[Math.floor(Math.random() * alpha.length)];
         var f = alpha[Math.floor(Math.random() * alpha.length)];
         var g = alpha[Math.floor(Math.random() * alpha.length)];
                      }
         var code = a + ' ' + b + ' ' + ' ' + c + ' ' + d + ' ' + e + ' '+ f + ' ' + g;
         document.getElementById("mainCaptcha").innerHTML = code
         document.getElementById("mainCaptcha").value = code
       }
function ValidCaptcha(){
     var string1 = removeSpaces(document.getElementById('mainCaptcha').value);
     var string2 =         removeSpaces(document.getElementById('txtInput').value);
     if (string1 == string2){
            return true;
     }else{        
          return false;
          }
}
function removeSpaces(string){
     return string.split(' ').join('');
}
