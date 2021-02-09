/*

		Wallet JS
		For use with 4LeafLotto.
		Encapsulates usage in an easy-to-use interface.

		Requires jQuery 1.9 or later.

		It is recommended that this file is not edited. Rather, as this handles authentication and wallet related content, other javascript files can interface from this
		directly since each lottery type can have wildly different recommended user interfaces. In other words, while the base 
		functionality is a "one-size-fits-all".

		To load:
						var wallet = walletInit(baseUrl, jQuery, key, currencyCulture, languageCulture, wa, clientCords)
						•	baseUrl: path to the 4LL lottery domain (usually something like https://wallet.something.com) - leave off end forward-slash
						•	jQuery: literally pass in the jQuery object (or $, your call)
						•	key: Franchise key given to you that matches the customer's franchise.
						•	currencyCulture: Culture for currency (default: en-US)
						•	languageCulture: culture for language (default: en-US)
						•	wa: WalletApplicationID (Should be 1)
						•	clientCords: Willing store coordinates (optional)


		Methods Available:
						•	getPlayer(username, password) – This is the login function, provide username and password here.
						•	getPlayerViaSession() – Will attempt to get player information from the wallet.player.playerSessionID
						•	register(email, firstname, lastname, phone, dateOfBirth, username, password, confirmPassword, termsAccepted) – Registers the user. All fields required
						•	forgotPassword(firstname, lastname, email) – Triggers a forgot password email. All fields required.
						•	geoLocation()  - Returns the details of the specified order.
						•   details() - The basic details of the player.
						•   editDetails(firstname, lastname, gender, birthday, emailaddress, cellphone, phonenumber, employer, address1, address2, address3, address4, locality, region, postcode, country) - Updated values for the player.
						•   transactions(sDate, eDate) - List of transaction for the specified date range.
						•   transactionDetails(id) - Details about the specified transaction
						•   limits() - Specified spending limits for the player
						•   saveLimits(dep_h, dep_d, dep_w, dep_m, dep_y, wag_h, wag_d, wag_w, wag_m, wag_y, los_h, los_d, los_w, los_m, los_y, wd_h, wd_d, wd_w, wd_m, wd_y, loc_h, loc_d, loc_w, loc_m, loc_y, gbc_h, gbc_d, gbc_w, gbc_m, gbc_y) - update customers spending limits
						•   exclusions() - List of exclusions currently going for the user (should only be one)
						•   cancelExclusion() - Cancel current exclusion. This should only be available to do if the exclusion was user generated.
						•   requestCancelExclusion() - Request a cancellation of the current exclusion, this should be available under any circumstance cancelExclusion is not.
						•   confirmExclusion(sDate, eDate,reason) - Created an exclusion record for the player.
						•   changePassword(currentPassword, newPassword, confirmPassword) - Changes the player's password
						•   changePin(currentPin, newPin, confirmPin) - Changes the player's PIN
						•   redeemVoucher(voucher) - Enter in a voucher code to apply to the player account.
						•   replays() - Retreives a list of replay orders for the current player.
						•   replayDetails(id) - Retreives details about the specified replay.
						•   editReplay(id, replayCount) - Edit the number of time the specificed order is replayed.
						•   syndicateOrders() - Retreives a list of Syndicate orders for the current user if the syndication feature is enabled.
						•   syndicateOrderDetails(id) - Retreives details about the specified syndicate order if the syndication feature is enabled.
						•   syndicateOrderBillingCycleOptions(id) - Retreives a list of valid billing cycle options for syndication. This call only works if the syndication feature is enabled.
						•   editSyndicateShare(id, shareCount, billingID) - Edit the number of shares in the specified syndicate. This call only works if the syndication feature is enabled.
						•   cancelSyndicateShare(id) - Canceled the current Syndicate. This call only works if the syndication feature is enabled.
						•   withdrawFunds(amount) - Adds a flag to withdraw funds for the user.
						•   createSupportTicket(subject, details, attachment,mime) - Creates a support ticket.
						•	signOut() - Signs out of a current session.


		Events Raised:
						•	loadPlayerCalled(player)
						•	PlayerCreatedCalled(player)
						•	forgotPasswordCalled(message)
						•	geoLocationCalled(geolocationEnabled)
						•   detailsCalled()
						•   editDetailsCalled()
						•   transactionsCalled()
						•   transactionDetailsCalled()
						•   limitsCalled()
						•   saveLimitsCalled()
						•   exclusionsCalled()
						•   confirmExclusionCalled()
						•   cancelExclusionCalled()
						•   requestCancelExclusionCalled()
						•   confirmExclusionCalled()
						•   changePasswordCalled()
						•   changePinCalled()
						•   redeemVoucherCalled()
						•   replaysCalled()
						•   replayDetailsCalled()
						•   editReplayCalled()
						•   syndicateOrdersCalled()
						•   syndicateOrderDetailsCalled()
						•   syndicateOrderBillingCycleOptionsCalled()
						•   editSyndicateShareCalled()
						•   cancelSyndicateShareCalled()
						•   withdrawFundsCalled()
						•   createSupportTicketCalled()
						•   signOutCalled()


	*/

var walletInit = (function (baseUrl, _$, key, currencyCulture, languageCulture) {
    "use strict";

    // Private vars
    var baseURI = baseUrl + "/api/PlayerPortalAPI";
    var token = null;
    var fkey = key; // franchise key
    var coords = null;
    var player = null;
    var $ = _$;
    var cculture = currencyCulture || "en-US";
    var lculture = languageCulture || currencyCulture;
    var that = this;
    // Events raised (no magic strings lol)
    var EVENT_ERROR_OCCURRED = "errorOccurred";
    var EVENT_INTERNET_BUSY = "internetCallBusy";
    var EVENT_INTERNET_NOT_BUSY = "internetCallNotBusy";
    var EVENT_PLAYER_LOADED = "loadPlayerCalled";
    var EVENT_PLAYER_CREATED = "playerCreatedCalled";
    var EVENT_SERVER_TIME_UPDATED = "serverTimeUpdated";
    var EVENT_INACTIVITY = "inactivityTimeoutEvent";
    var EVENT_FORGOT_PASSWORD = "forgotPasswordCalled";
    var EVENT_PASSWORD_KEY_VALIDATION = "passwordKeyValidationCalled";
    var EVENT_PASSWORD_RESET = "passwordResetCalled";
    var EVENT_GEOLOCATION_CALLED = "geoLocationCalled";
    var EVENT_DETAILS_CALLED = "detailsCalled";
    var EVENT_EDIT_DETAILS_CALLED = "editDetailsCalled";
    var EVENT_TRANSACTIONS_CALLED = "transactionsCalled";
    var EVENT_TRANSACTION_DETAILS_CALLED = "transactionDetailsCalled";
    var EVENT_LIMITS_CALLED = "limitsCalled";
    var EVENT_SAVE_LIMITS_CALLED = "saveLimitsCalled";
    var EVENT_EXCLUSIONS_CALLED = "exclusionsCalled";
    var EVENT_CONFIRM_EXCLUSION_CALLED = "confirmExclusionCalled";
    var EVENT_CANCEL_EXCLUSION_CALLED = "cancelExclusionCalled";
    var EVENT_REQUEST_CANCEL_EXCLUSION_CALLED = "requestCancelExclusionCalled";
    var EVENT_CONFIRM_EXCLUSION_CALLED = "confirmExclusionCalled";
    var EVENT_CHANGE_PASSWORD_CALLED = "changePasswordCalled";
    var EVENT_CHANGE_PIN_CALLED = "changePinCalled";
    var EVENT_REDEEM_VOUCHER_CALLED = "redeemVoucherCalled";
    var EVENT_REPLAYS_CALLED = "replaysCalled";
    var EVENT_REPLAY_DETAILS_CALLED = "replayDetailsCalled";
    var EVENT_EDIT_REPLAY_CALLED = "editReplayCalled";
    var EVENT_SYNDICATE_ORDERS_CALLED = "syndicateOrdersCalled";
    var EVENT_SYNDICATE_ORDER_DETAILS_CALLED = "syndicateOrderDetailsCalled";
    var EVENT_SYNDICATE_BILLING_CYCLE_CALLED = "syndicateOrderBillingCycleOptionsCalled";
    var EVENT_EDIT_SYNDICATE_SHARE_CALLED = "editSyndicateShareCalled";
    var EVENT_CANCEL_SYNDICATE_SHARE_CALLED = "cancelSyndicateShareCalled";
    var EVENT_WITHDRAW_FUNDS_CALLED = "withdrawFundsCalled";
    var EVENT_CREATE_SUPPORT_TICKET_CALLED = "createSupportTicketCalled";
    // Validation
    var EVENT_SEND_VALIDATION_MESSAGE_CALLED = "sendValidationMessageCalled";
    var EVENT_CONFIRM_VALIDATION_CODE_CALLED = "confirmValidationCodeCalled";
    var EVENT_GET_LOTTERY_TOKEN_CALLED = "getLotteryTokenCalled";
    var EVENT_SIGNOUT_CALLED = "signOutCalled";

    // Internal general functions ///////////////////////////////////////////////////////////////////////////////
    function isNumber(o) {
        return !isNaN(o - 0) && o !== null && o !== "" && o !== false;
    }
    function guid() {
        // http://stackoverflow.com/a/8809472/607117
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    function jsround(num) {
        return Math.round((num * 100) + 0.00001) / 100;
    }
    // helper methods ///////////////////////////////////////////////////////////////////////////////////////////

    // Internal op-specific methods ////////////////////////////////////////////////////////////////////////////

    //// PUBLIC PROPERTIES AND METHODS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //// Sent in with the order, used to detect if the same order was attempted to be submitted more than once.
    this.uniqueID = guid();
    // Times from server - populated on first call to server
    var serverTimeUTC = null;
    var serverTimeLocal = null;

    //// Returns the last-retrieved server time, both local and UTC
    this.getServerTime = function () {
        return {
            local: serverTimeLocal,
            utc: serverTimeUTC
        };
    }

    //////API Calls
    //this.getPlayer = function (username, password) {
    //    var $m = $(that);
    //    var url = baseURI + "/getPlayerInfo";
    //    var data = {
    //        Token: null,
    //        Key: fkey,
    //        Coords: this.coords,
    //        UserName: username,
    //        Password: password
    //    };
    //    $.post(url, data, function (resp) {
    //        if (resp == null) {
    //            $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
    //        }
    //        else {
    //            serverTimeLocal = resp.serverTimeLocal;
    //            serverTimeUTC = resp.serverTimeUTC;
    //            if (resp.wasSuccessful == false) {
    //                $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
    //            }
    //            else {
    //  wallet.player = resp.player;
    //                if (resp.token != null && resp.token != "") wallet.token = resp.token;
    //                $m.trigger(EVENT_PLAYER_LOADED, [wallet.player]);
    //            }
    //        }
    //    });
    //}






    ////API Calls
    this.getPlayer = function (username, password) {
        debugger;

        var $m = $(that);
        var url = baseURI + "/LoginPlayer";
        var data = {
            Key: '',
            UserName: username,
            Password: password

        }


        $.post(url, data, function (resp) {
            if (resp == null) {

                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {

                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $.jStorage.flush();
                    wallet = resp;
                    wallet.token = resp.PlayerOTP;
                    wallet.player = resp.Player;
                    wallet.account = resp.account;
                    //wallet.PlayerOTP = resp.PlayerOTP;
                    if (wallet.PlayerOTP != null && wallet.PlayerOTP != "") wallet.PlayerOTP = resp.PlayerOTP;
                    $.jStorage.set("OTP", resp.PlayerOTP);
                    $.jStorage.set("CardNumber", username);
                    $.jStorage.set("PlayerID", wallet.PlayerID);
                    $.jStorage.set("Name", wallet.account.FirstName);
                    $.jStorage.set("VigDns", wallet.VIGDNS);
                    $.jStorage.set("Player", wallet.player);
                    $.jStorage.set("Account", wallet.account);

                    window.location.href = '/Account/AccountManagement';


                }
            }
        });
    }



    ////API Calls
    this.getPlayerDetails = function () {
        var CardNumber = $.jStorage.get("CardNumber");
        var $m = $(that);
        var url = baseURI + "/GetPlayerDetails";
        var data = {
            Key: fkey,
            CardNumber: CardNumber
        };

        $.post(url, data, function (resp) {
            if (resp == null) {

                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {

                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {

                    wallet.player = resp.Player;
                    wallet.account = resp.account;
                    //wallet.PlayerOTP = resp.PlayerOTP;
                    if (resp != null && resp != "") {
                        $.jStorage.set("Player", wallet.player);
                        $.jStorage.set("Account", wallet.account);
                        $.jStorage.set("Name", wallet.account.FirstName);
                    }
                    window.location.href = '/Account/AccountManagement';

                }
            }
        });
    }


    this.getPlayerViaSession = function () {
        var $m = $(that);
        var url = baseURI + "/getPlayerInfoViaSessionToken";
        var data = {
            Token: wallet.token,
            Key: fkey
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_INACTIVITY);
                    //$m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    wallet.player = resp.player;
                    if (resp.token != null && resp.token != "") wallet.token = resp.token;
                    $m.trigger(EVENT_PLAYER_LOADED, [wallet.player]);
                }
            }
        });
    }
    this.signOut = function () {
        var $m = $(that);
        if (wallet.player == null) {
            return false;
        }
        else {
            var url = baseURI + "/signOut";
            var data = {
                Token: wallet.token,
                Key: fkey
            };
            $.post(url, data, function (resp) {
                if (resp == null) {
                    $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
                }
                else {
                    serverTimeLocal = resp.serverTimeLocal;
                    serverTimeUTC = resp.serverTimeUTC;
                    if (resp.wasSuccessful == false) {
                        $m.trigger(EVENT_INACTIVITY);
                        //$m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                    }
                    else {
                        wallet.player = null;
                        wallet.token = null;
                        $m.trigger(EVENT_SIGNOUT_CALLED);
                    }
                }
            });
        }
    };

    this.LogoutPlayer = function () {
        var $m = $(that);
        var PlayerOTP = $.jStorage.get("OTP");
        var PlayerID = $.jStorage.get("PlayerID");
        if (PlayerOTP == null) {
            wallet = null;

            $.jStorage.flush();
            $('.btnlogout').css({ 'display': 'none' });
            $('.login').css({ 'display': 'block' });
            $('.btnaccount').css({ 'display': 'none' });

            //    window.location.href = $("#login").val();
            window.location.href = "/home/index";
            return false;
        }
        else {
            var url = baseURI + "/LogoutPlayer";
            var data = {
                PlayerID: PlayerID,
                OTP: PlayerOTP
            };
            $.post(url, data, function (resp) {
                if (resp == null) {
                    $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
                }
                else {
                    serverTimeLocal = resp.serverTimeLocal;
                    serverTimeUTC = resp.serverTimeUTC;
                    if (resp.wasSuccessful == false) {
                        $m.trigger(EVENT_INACTIVITY);
                        //$m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                    }
                    else {
                        wallet = null;

                        $.jStorage.flush();
                        $('.btnlogout').css({ 'display': 'none' });
                        $('.login').css({ 'display': 'block' });
                        $('.btnaccount').css({ 'display': 'none' });

                        //    window.location.href = $("#login").val();
                        window.location.href = "/home/index";
                    }
                }
            });
        }
    };




    this.register = function (email, firstname, lastname, phone, dateOfBirth, username, password, confirmPassword, pin, confirmPin, termsAccepted) {
        var $m = $(that);
        var url = baseURI + "/registerUser";
        var data = {
            Token: null,
            Key: fkey,
            Email: email,
            FirstName: firstname,
            LastName: lastname,
            Phone: phone,
            DateOfBirth: dateOfBirth,
            UserName: username,
            Password: password,
            ConfirmPassword: confirmPassword,
            PIN: pin,
            ConfirmPIN: confirmPin,
            TermsAccepted: termsAccepted
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    wallet.player = resp.player;
                    if (resp.token != null && resp.token != "") wallet.token = resp.token;
                    $m.trigger(EVENT_PLAYER_CREATED, [wallet.player]);
                }
            }
        });
    }
    this.forgotPassword = function (firstname, lastname, email) {
        var $m = $(that);
        var url = baseURI + "/forgotPassword";
        var data = {
            Token: null,
            Key: fkey,
            FirstName: firstname,
            LastName: lastname,
            Email: email
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    //wallet.player = resp.player;
                    $m.trigger(EVENT_FORGOT_PASSWORD, [resp.message]);
                }
            }
        });
    }
    this.passwordResetKeyValidation = function (key) {
        var $m = $(that);
        var url = baseURI + "/passwordResetKeyValidation";
        var data = {
            Token: null,
            Key: fkey,
            ValidationKey: key
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_PASSWORD_KEY_VALIDATION, [resp.wasSuccessful, resp.message]);
                }
                else {
                    if (resp.token != null && resp.token != "") wallet.token = resp.token;
                    $m.trigger(EVENT_PASSWORD_KEY_VALIDATION, [resp.wasSuccessful]);
                }
            }
        });
    }
    this.passwordReset = function (username, newpassword, confirmpassword, key) {
        var $m = $(that);
        var url = baseURI + "/passwordReset";
        var data = {
            Token: null,
            Key: fkey,
            UserName: username,
            NewPassword: newpassword,
            ConfirmPassword: confirmpassword,
            ValidationKey: key
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_PASSWORD_RESET, [resp.message]);
                }
            }
        });
    }
    this.geoLocation = function () {
        var $m = $(that);
        var url = baseURI + "/Geolocation";
        var data = {
            Token: null,
            Key: fkey
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_GEOLOCATION_CALLED, [resp.geoLocationEnabled]);
                }
            }
        });
    }
    this.details = function () {
        var $m = $(that);
        var url = baseURI + "/details";
        var data = {
            Token: wallet.token,
            Key: fkey
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_DETAILS_CALLED, [resp]);
                }
            }
        });
    }

    this.editDetails = function (firstname, lastname, gender, birthday, emailaddress, cellphone, phonenumber, employer, address1, address2, address3, address4, locality, region, postcode, country) {

        var $m = $(that);
        var PlayerID = $.jStorage.get("PlayerID");
        var url = baseURI + "/PlayerEditDetails";
        var data = {
            Key: fkey,
            PlayerID: PlayerID, Name: firstname, lastname: lastname, EmailID: emailaddress, Phone: cellphone, AlternatePhone: phonenumber, Employer: employer, Address: address1, AddressLine1: address2, AddressLine2: address3, AddressLine3: address4, City: locality, State: region, ZipCode: postcode, Country: country
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_EDIT_DETAILS_CALLED, [resp]);
                }
            }
        });
    }
    this.transactions = function (CardNumber, sDate, eDate) {
        var $m = $(that);
        var url = baseURI + "/GetPlayerTransaction";
        var data = {

            Key: fkey,
            StartDate: sDate,
            EndDate: eDate,
            CardNumber: CardNumber
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                // if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    // $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_TRANSACTIONS_CALLED, [resp]);
                }
            }
        });
    }


    this.transactionDetails = function (id) {
        var $m = $(that);
        var url = baseURI + "/transactionDetails";
        var data = {
            Token: wallet.token,
            Key: fkey,
            OrderID: id
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_TRANSACTION_DETAILS_CALLED, [resp]);
                }
            }
        });
    }
    this.limits = function () {
        var $m = $(that);
        var url = baseURI + "/limits";
        var data = {
            Token: wallet.token,
            Key: fkey
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_LIMITS_CALLED, [resp]);
                }
            }
        });
    }
    this.saveLimits = function (limits) {
        var $m = $(that);
        var url = baseURI + "/saveLimits";
        var data = {
            Token: wallet.token,
            Key: fkey,
            Limits: limits
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_SAVE_LIMITS_CALLED, [resp]);
                }
            }
        });
    }
    this.exclusions = function () {
        var $m = $(that);
        var url = baseURI + "/exclusions";
        var data = {
            Token: wallet.token,
            Key: fkey,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_EXCLUSIONS_CALLED, [resp]);
                }
            }
        });
    }
    this.cancelExclusion = function () {
        var $m = $(that);
        var url = baseURI + "/cancelExclusion";
        var data = {
            Token: wallet.token,
            Key: fkey,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CANCEL_EXCLUSION_CALLED, [resp]);
                }
            }
        });
    }
    this.confirmExclusion = function (sDate, eDate, reason) {
        var $m = $(that);
        var url = baseURI + "/confirmExclusion";
        var data = {
            Token: wallet.token,
            Key: fkey,
            sDate: sDate,
            eDate: eDate,
            Reason: reason
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CONFIRM_EXCLUSION_CALLED, [resp]);
                }
            }
        });
    }
    this.changePassword = function (currentPassword, newPassword, confirmPassword) {
        var $m = $(that);
        var url = baseURI + "/changePassword";
        var data = {
            Token: wallet.token,
            Key: fkey,
            CurrentPassword: currentPassword,
            NewPassword: newPassword,
            ConfirmPassword: confirmPassword
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CHANGE_PASSWORD_CALLED, [resp]);
                }
            }
        });
    }
    this.changePin = function (currentPin, newPin, confirmPin) {
        var $m = $(that);
        var url = baseURI + "/changePin";
        var data = {
            Token: wallet.token,
            Key: fkey,
            CurrentPin: currentPin,
            NewPin: newPin,
            ConfirmPin: confirmPin
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CHANGE_PIN_CALLED, [resp]);
                }
            }
        });
    }
    this.redeemVoucher = function (voucher) {
        var $m = $(that);
        var url = baseURI + "/redeemVoucher";
        var data = {
            Token: wallet.token,
            Key: fkey,
            VoucherCode: voucher
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_REDEEM_VOUCHER_CALLED, [resp]);
                }
            }
        });
    }
    this.replays = function () {
        var $m = $(that);
        var url = baseURI + "/replays";
        var data = {
            Token: wallet.token,
            Key: fkey,

        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_REPLAYS_CALLED, [resp]);
                }
            }
        });
    }
    this.replayDetails = function (id) {
        var $m = $(that);
        var url = baseURI + "/replayDetails";
        var data = {
            Token: wallet.token,
            Key: fkey,
            ID: id
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_REPLAY_DETAILS_CALLED, [resp]);
                }
            }
        });
    }
    this.editReplay = function (id, replayCount) {
        var $m = $(that);
        var url = baseURI + "/editReplay";
        var data = {
            Token: wallet.token,
            Key: fkey,
            ID: id,
            ReplayCount: replayCount
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_EDIT_REPLAY_CALLED, [resp]);
                }
            }
        });
    }
    this.syndicateOrders = function () {
        var $m = $(that);
        var url = baseURI + "/syndicateOrders";
        var data = {
            Token: wallet.token,
            Key: fkey,

        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_SYNDICATE_ORDERS_CALLED, [resp]);
                }
            }
        });
    }
    this.syndicateOrderDetails = function (id) {
        var $m = $(that);
        var url = baseURI + "/syndicateOrderDetails";
        var data = {
            Token: wallet.token,
            Key: fkey,
            ID: id
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_SYNDICATE_ORDER_DETAILS_CALLED, [resp]);
                }
            }
        });
    }
    this.syndicateOrderBillingCycleOptions = function (id) {
        var $m = $(that);
        var url = baseURI + "/syndicateOrderBillingCycleOptions";
        var data = {
            Token: wallet.token,
            Key: fkey,
            ID: id
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_SYNDICATE_BILLING_CYCLE_CALLED, [resp]);
                }
            }
        });
    }
    this.editSyndicateShare = function (id, shareCount, billingID) {
        var $m = $(that);
        var url = baseURI + "/editSyndicateShare";
        var data = {
            Token: wallet.token,
            Key: fkey,
            ID: id,
            ShareCount: shareCount,
            BillingID: billingID
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_EDIT_SYNDICATE_SHARE_CALLED, [resp]);
                }
            }
        });
    }
    this.cancelSyndicateShare = function (id) {
        var $m = $(that);
        var url = baseURI + "/cancelSyndicateShare";
        var data = {
            Token: wallet.token,
            Key: fkey,
            ID: id
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CANCEL_SYNDICATE_SHARE_CALLED, [resp]);
                }
            }
        });
    }
    this.withdrawFunds = function (amount) {
        var $m = $(that);
        var url = baseURI + "/withdrawFunds";
        var data = {
            Token: wallet.token,
            Key: fkey,
            Amount: amount
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_WITHDRAW_FUNDS_CALLED, [resp]);
                }
            }
        });
    }
    this.createSupportTicket = function (subject, details, attachment, mime) {
        var $m = $(that);
        var url = baseURI + "/createSupportTicket";
        var data = {
            Token: wallet.token,
            Key: fkey,
            Subject: subject,
            Details: details,
            Attachment: attachment,
            MimeType: mime
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CREATE_SUPPORT_TICKET_CALLED, [resp]);
                }
            }
        });
    }
    // Validation
    this.sendValidationMessage = function (purposeType) {
        /*
        purposeType:
            CustomerCellphoneValidation = 10,
            CustomerEmailValidation = 11,
    */
        var $m = $(that);
        var url = baseURI + "/sendValidationMessage";
        var data = {
            Token: wallet.token,
            Key: fkey,
            PurposeType: purposeType,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_SEND_VALIDATION_MESSAGE_CALLED, [resp]);
                }
            }
        });
    }
    this.confirmValidationCode = function (purposeType, code) {
        /*
        purposeType:
            CustomerCellphoneValidation = 10,
            CustomerEmailValidation = 11,
    */
        var $m = $(that);
        var url = baseURI + "/confirmValidationCode";
        var data = {
            Token: wallet.token,
            Key: fkey,
            PurposeType: purposeType,
            Code: code,
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_CONFIRM_VALIDATION_CODE_CALLED, [resp]);
                }
            }
        });
    }

    this.getLotteryToken = function () {
        var $m = $(that);
        var url = baseURI + "/getLotteryToken";
        var data = {
            Token: wallet.token,
            Key: fkey,
            LottoToken: lottery.lotteryToken
        };
        $.post(url, data, function (resp) {
            if (resp == null) {
                $m.trigger(EVENT_ERROR_OCCURRED, "SERVER_ERROR", true);
            }
            else {
                serverTimeLocal = resp.serverTimeLocal;
                serverTimeUTC = resp.serverTimeUTC;
                if (resp.token != null && resp.token != "") wallet.token = resp.token;
                if (resp.wasSuccessful == false) {
                    $m.trigger(EVENT_ERROR_OCCURRED, resp.message, true);
                }
                else {
                    $m.trigger(EVENT_GET_LOTTERY_TOKEN_CALLED, [resp]);
                }
            }
        });
    }



    return this;
});