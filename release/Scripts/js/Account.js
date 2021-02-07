var closestMonthly = 0;
var closestShare = 0;
var photo = null;
var limits = null;
$(function () {
    var $w = $(wallet);

    //Wallet Listeners
    $w.on("errorOccurred", function (ev, error, isFatal) {
        $.jStorage.set("token", wallet.token);
    });
    $w.on("passwordKeyValidationCalled", function (ev, wasSuccessful, message) {
        if (!wasSuccessful) {
            $(".reset-password-form").hide();
            alert(message);
            window.location.href = $("#login").val();
        }
    });
    $w.on("passwordResetCalled", function (ev, message) {
        alert("Reset successful! Please log in...");
        window.location.href = $("#login").val();
    });
    $w.on("loadPlayerCalled", function (ev, player) {
        if (player != null) {
            $.jStorage.set("player", player);
            $.jStorage.set("token", wallet.token);
            filterMenu(player.features);
            getDetails();
        }
    });
    $w.on("detailsCalled", function (ev, resp) {
        var account = resp.account;
        var player = wallet.player;
        $.jStorage.set("token", wallet.token);
        var birthday = new Date(account.birthday);
        var dd = birthday.getDate();
        var mm = birthday.getMonth() + 1; //January is 0!
        var yyyy = birthday.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        birthday = mm + '/' + dd + '/' + yyyy;


        $("#account-customer-id").text(account.customerID);
        $("#account-customer-username").text(player.username);
        $("#account-customer-full-name").text(account.firstName + " " + account.lastName);
        $("#account-customer-balance").text(player.balance);

        // Validation
        $("#div-email-validation-request").hide(); // Hide divs by default
        $("#div-email-validation-confirm").hide(); // Hide divs by default
        $("#div-cellphone-validation-request").hide(); // Hide divs by default
        $("#div-cellphone-validation-confirm").hide(); // Hide divs by default
        if (!account.emailAddressVerified) {
            if (account.required_Validation_Email) {
                if (account.validation_Email_Sent) {
                    $("#div-email-validation-confirm").show();
                    delayResendLink('email');
                }
                else {
                    $("#div-email-validation-request").show();
                }
            }
        }
        if (!account.cellPhoneVerified) {
            if (account.required_Validation_CellPhone) {
                if (account.validation_CellPhone_Sent) {
                    $("#div-cellphone-validation-confirm").show();
                    delayResendLink('cellphone');
                }
                else {
                    $("#div-cellphone-validation-request").show();
                }
            }
        }

        $("#FirstName").val(account.firstName);
        $("#LastName").val(account.lastName);
        $("#Gender").val(account.gender);
        $("#Birthday").val(birthday);
        $("#EmailAddress").val(account.emailAddress);
        $("#CellPhone").val(account.cellPhone);
        $("#PhoneNumber").val(account.phoneNumber);
        $("#Employer").val(account.employer);
        $("#AddressLine1").val(account.addressLine1);
        $("#AddressLine2").val(account.addressLine2);
        $("#AddressLine3").val(account.addressLine3);
        $("#AddressLine4").val(account.addressLine4);
        $("#Locality").val(account.locality);
        $("#Region").val(account.region);
        $("#Postcode").val(account.postcode);
        $("#Country").val(account.country);

        if (account.hasPin) {
            $(".current-pin-group").hide();
        }
    });
    $w.on("editDetailsCalled", function (ev, resp) {        
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            smallNotification("Account Details Updated!");
            //$("#FirstName").prop("disabled", true);
            //$("#LastName").prop("disabled", true);
            //$("#Gender").prop("disabled", true);
            //$("#Birthday").prop("disabled", true);
            //$("#EmailAddress").prop("disabled", true);
            $("#CellPhone").prop("disabled", true);
            $("#PhoneNumber").prop("disabled", true);
            $("#Employer").prop("disabled", true);
            $("#AddressLine1").prop("disabled", true);
            $("#AddressLine2").prop("disabled", true);
            $("#AddressLine3").prop("disabled", true);
            $("#AddressLine4").prop("disabled", true);
            $("#Locality").prop("disabled", true);
            $("#Region").prop("disabled", true);
            $("#Postcode").prop("disabled", true);
            $("#Country").prop("disabled", true);
            $(".btn-details-update").hide();
            $(".btn-enable-details-edit").show();
            getDetails(); // Reload the details page in case anything displayed there has changed;
        }
    });
    $w.on("transactionsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var transactions = resp.transactions;

        $(".transaction-history-body").empty();
        if (transactions.length > 0) {
            for (var i = 0; i < transactions.length; i++) {
                var template = document.querySelector('#transaction-history-row-template');
                var newLine = document.importNode(template.content, true);
                var transaction = transactions[i];

                newLine.querySelector(".transaction-date").innerHTML = new Date(transaction.createdOn).toLocaleDateString();
                newLine.querySelector(".transaction-order-id").innerHTML = transaction.orderID;
                newLine.querySelector(".transaction-summary").innerHTML = transaction.summary;
                newLine.querySelector(".transaction-amount").innerHTML = transaction.amount;
                newLine.querySelector(".transaction-pre-amount").innerHTML = transaction.preAmount;
                newLine.querySelector(".transaction-post-amount").innerHTML = transaction.postAmount;
                if (transaction.orderID == null)
                    newLine.querySelector(".btn-transaction-details").style = "display:none";
                $(".transaction-history-body").append(newLine);
            }

            // Set up data tables for any table elements with class "datatable"
            //$.extend($.fn.dataTableExt.oStdClasses, {
            //	"sWrapper": "dataTables_wrapper form-inline" //,
            //});

            //$('table.datatable').each(function () {
            //	var bFilter = true;
            //	if ($(this).hasClass('nofilter')) {
            //		bFilter = false;
            //	}
            //	var columnSort = new Array;
            //	$(this).find('thead tr th').each(function () {
            //		if ($(this).attr('data-bSortable') == 'false') {
            //			columnSort.push({ "bSortable": false });
            //		} else {
            //			columnSort.push({ "bSortable": true });
            //		}
            //	});

            //	var oTable = $(this).dataTable({
            //		"bFilter": bFilter,
            //		"bDestroy": true,
            //		"fnDrawCallback": function (oSettings) {
            //		},
            //		"aoColumns": columnSort,
            //		"iDisplayLength": 10,
            //		"oLanguage":
            //        {
            //        	"sEmptyTable": "No data available in table",
            //        	"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
            //        	"sInfoEmpty": "Showing 0 to 0 of 0 entries",
            //        	"sInfoFiltered": "(filtered from _MAX_ total entries)",
            //        	"sInfoPostFix": "",
            //        	"sInfoThousands": ",",
            //        	"sLoadingRecords": "Loading...",
            //        	"sProcessing": "Processing...",
            //        	"sSearch": "Filter these results:",
            //        	"sZeroRecords": "No matching records found",
            //        	"sLengthMenu": "_MENU_ records per page",
            //        	"oPaginate": {
            //        		"sFirst": "First",
            //        		"sLast": "Last",
            //        		"sNext": "Next",
            //        		"sPrevious": "Previous"
            //        	},
            //        	"oAria": {
            //        		"sSortAscending": ": activate to sort column ascending",
            //        		"sSortDescending": ": activate to sort column descending"
            //        	}
            //        }
            //	});
            //	oTable.fnSort([[0, 'desc']]);
            //});

            //$(".dataTables_filter,.dataTables_length").find("input,select").addClass("form-control");
        }
    });
    $w.on("transactionDetailsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var details = resp.details;

        if (details != null) {
            $(".transaction-details-order-body").empty();
            for (var i = 0; i < details.length; i++) {
                var template = document.querySelector('#transaction-details-order-template');
                var newLine = document.importNode(template.content, true);
                var order = details[i];

                newLine.querySelector(".transaction-detail-order-ballNumbers").innerHTML = order.ballNumbers;
                newLine.querySelector(".transaction-detail-order-houseName").innerHTML = order.houseName;
                newLine.querySelector(".transaction-detail-order-IsBoxed").innerHTML = order.isBoxed;
                newLine.querySelector(".transaction-detail-order-price").innerHTML = order.price;
                newLine.querySelector(".transaction-detail-order-payout").innerHTML = order.payout;

                $(".transaction-details-order-body").append(newLine);
            }
            $("#transactionDetailsModal").modal();
        }
    });
    $w.on("limitsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        limits = resp.limits;

        var deposit = $.grep(limits, function (e) { return e.name == "Deposit"; })[0];
        var wager = $.grep(limits, function (e) { return e.name == "Wager"; })[0];
        var losses = $.grep(limits, function (e) { return e.name == "Losses"; })[0];
        var withdraw = $.grep(limits, function (e) { return e.name == "Withdraw"; })[0];
        var lotteryOrderCount = $.grep(limits, function (e) { return e.name == "Lottery Order Count"; })[0];
        var gamingBetCount = $.grep(limits, function (e) { return e.name == "Gaming Bet Count"; })[0];
        $("#dep_h_Amount").val(deposit.hourAmount);
        $("#dep_d_Amount").val(deposit.dayAmount);
        $("#dep_w_Amount").val(deposit.weekAmount);
        $("#dep_m_Amount").val(deposit.monthAmount);
        $("#dep_y_Amount").val(deposit.yearAmount);
        $("#wag_h_Amount").val(wager.hourAmount);
        $("#wag_d_Amount").val(wager.dayAmount);
        $("#wag_w_Amount").val(wager.weekAmount);
        $("#wag_m_Amount").val(wager.monthAmount);
        $("#wag_y_Amount").val(wager.yearAmount);
        $("#los_h_Amount").val(losses.hourAmount);
        $("#los_d_Amount").val(losses.dayAmount);
        $("#los_w_Amount").val(losses.weekAmount);
        $("#los_m_Amount").val(losses.monthAmount);
        $("#los_y_Amount").val(losses.yearAmount);
        $("#wd_h_Amount").val(withdraw.hourAmount);
        $("#wd_d_Amount").val(withdraw.dayAmount);
        $("#wd_w_Amount").val(withdraw.weekAmount);
        $("#wd_m_Amount").val(withdraw.monthAmount);
        $("#wd_y_Amount").val(withdraw.yearAmount);
        $("#loc_h_Amount").val(lotteryOrderCount.hourAmount);
        $("#loc_d_Amount").val(lotteryOrderCount.dayAmount);
        $("#loc_w_Amount").val(lotteryOrderCount.weekAmount);
        $("#loc_m_Amount").val(lotteryOrderCount.monthAmount);
        $("#loc_y_Amount").val(lotteryOrderCount.yearAmount);
        $("#gbc_h_Amount").val(gamingBetCount.hourAmount);
        $("#gbc_d_Amount").val(gamingBetCount.dayAmount);
        $("#gbc_w_Amount").val(gamingBetCount.weekAmount);
        $("#gbc_m_Amount").val(gamingBetCount.monthAmount);
        $("#gbc_y_Amount").val(gamingBetCount.yearAmount);

    });
    $w.on("saveLimitsCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            getLimits();
            smallNotification("Limits Updated!");
        }
    });
    $w.on("exclusionsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var exclusion = resp.exclusions[0];

        if (exclusion != null) {
            $(".exclusions-empty").hide();
            $(".exclusions-list").show();
            $("#exclusion-started-on-date").text(new Date(exclusion.exclusionStartsOn).toLocaleDateString());
            $("#exclusion-ends-on-date").text(new Date(exclusion.exclusionEndsOn).toLocaleDateString());
            $("#exclusion-self-excluded").prop("checked", exclusion.isSelfExcluded);
            $(".btn-cancel-exclusion").show();
        }
        else {
            $(".exclusions-empty").show();
            $(".exclusions-list").hide();
        }
    });
    $w.on("confirmExclusionCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        if (resp.wasSuccessful) {
            exclusions();
            smallNotification("Exclusions Updated!");
        }
    });
    $w.on("cancelExclusionCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        if (resp.wasSuccessful) {
            exclusions();
            smallNotification("Exclusions Canceled! This will be reflected after 24 hours.");
        }
    });
    //$w.on("requestCancelExclusionCalled", function (ev, resp) {
    //	$.jStorage.set("token", wallet.token);
    //	if (resp.wasSuccessful) {
    //		exclusions();
    //		smallNotification("Request received!");
    //	}
    //});
    $w.on("changePasswordCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        if (resp.wasSuccessful) {
            $("#CurrentPassword").val("");
            $("#NewPassword").val("");
            $("#ConfirmPassword").val("");
            smallNotification("Password Updated!");
        }
    });
    $w.on("changePinCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        if (resp.wasSuccessful) {
            $("#CurrentPIN").val("");
            $("#NewPIN").val("");
            $("#ConfirmPIN").val("");
            smallNotification("PIN Updated!");
        }
    });
    $w.on("redeemVoucherCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        if (resp.wasSuccessful) {
            getDetails();
            $("#txtVoucherCode").val("");
            smallNotification("Voucher Redeemed!");
        }
        else { alert(resp.message); }
    });
    $w.on("replaysCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var replays = resp.replays;

        if (replays.length > 0) {
            $(".replay-body").empty();
            for (var i = 0; i < replays.length; i++) {
                var template = document.querySelector('#replay-row-template');
                var newLine = document.importNode(template.content, true);
                var replay = replays[i];

                newLine.querySelector(".replay-id").innerHTML = replay.id;
                newLine.querySelector(".replay-title").innerHTML = replay.title;
                newLine.querySelector(".replay-game-type").innerHTML = replay.gameType;
                newLine.querySelector(".replay-count").innerHTML = replay.replayCount;
                newLine.querySelector(".replay-last-replay").innerHTML = new Date(replay.lastReplay).toLocaleDateString();

                $(".replay-body").append(newLine);
            }
        }
    });
    $w.on("replayDetailsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
    });
    $w.on("editReplayCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            replays();
            smallNotification("Replay Updated!");
            $("#editFavModal").modal("hide");
        }

    });
    $w.on("syndicateOrdersCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var syndicates = resp.syndicates;

        $(".syndicate-body").empty();
        if (syndicates.length > 0) {
            for (var i = 0; i < syndicates.length; i++) {
                var template = document.querySelector('#syndicate-row-template');
                var newLine = document.importNode(template.content, true);
                var syndicate = syndicates[i];

                newLine.querySelector(".syndicate-id").innerHTML = syndicate.id;
                newLine.querySelector(".syndicate-name").innerHTML = syndicate.syndicateName;
                newLine.querySelector(".syndicate-share-count").innerHTML = syndicate.shareCount;
                newLine.querySelector(".syndicate-numbers").innerHTML = syndicate.numbers;
                newLine.querySelector(".syndicate-monthly-renewal-interval").innerHTML = syndicate.monthlyInterval;
                newLine.querySelector(".syndicate-total-price").innerHTML = parseFloat(syndicate.totalPrice).toFixed(2).toLocaleString();
                newLine.querySelector(".syndicate-renewal-date").innerHTML = new Date(syndicate.expirationDate).toLocaleDateString();

                $(".syndicate-body").append(newLine);
            }
        }
    });
    $w.on("syndicateOrderDetailsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var syndicate = resp.syndicate;

        if (syndicate != null) {
            $("#syndicate-details-customer-name").text(syndicate.customerName);
            $("#syndicate-details-syndicate-name").text(syndicate.syndicateName);
            $("#syndicate-details-share-count").text(syndicate.shareCount);
            $("#syndicate-details-numbers").text(syndicate.numbers);
            $("#syndicate-details-monthly-renewal-interval").text(syndicate.monthlyInterval == null ? " " : syndicate.monthlyInterval);
            $("#syndicate-details-total-price").text(parseFloat(syndicate.totalPrice).toFixed(2).toLocaleString());
            $("#syndicate-details-purchase-date").text(new Date(syndicate.purchaseDate).toLocaleDateString());
            $("#syndicate-details-renewal-date").text(syndicate.expirationDate == null ? " " : new Date(syndicate.expirationDate).toLocaleDateString());
            $("#syndicate-details-last-renewal-attempt-date").text(syndicate.lastRenewalAttemptDate == null ? " " : new Date(syndicate.lastRenewalAttemptDate).toLocaleDateString());
            $("#syndicate-details-renewal-try-count").text(syndicate.renewal_TryCount);
            $("#syndicate-details-renewal-share-count").text(syndicate.renewal_ShareCount) == null ? " " : syndicate.renewal_ShareCount;
            $("#syndicate-details-renewal-monthly-interval").text(syndicate.renewal_MonthlyInterval == null ? " " : syndicate.renewal_MonthlyInterval);

            $("#syndicateShareDetails").modal();
        }
    });
    $w.on("editSyndicateShareCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            smallNotification("Syndicate Order Updated!");
            syndicateOrders();
            $("#editSyndicateShareConfirm").modal("hide");
        }
    });
    $w.on("syndicateOrderBillingCycleOptionsCalled", function (ev, resp) {
        $.jStorage.set("token", wallet.token);
        var cycleOptions = resp.billingCycles;
        $("#editShareCount").val(closestShare);
        var $select = $('#editSyndicate_BillingCycle_ID');
        $select.html('');
        $select.append("<option></option>");
        for (var i = 0; i < cycleOptions.length; i++) {
            var cycle = cycleOptions[i];
            var isClosest = closestMonthly == cycle.monthlyInterval;
            var month = cycle.monthlyInterval > 1 ? " Months" : " Month";
            $select.append("<option value='" + cycle.id + "' " + (isClosest ? "selected" : "") + ">" + cycle.monthlyInterval + month + "</option>");
        }
        $("#editSyndicateShareConfirm").modal();
    });
    $w.on("cancelSyndicateShareCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            smallNotification("Syndicate Order Canceled!");
            syndicateOrders();
            $("#cancelSyndicateShareConfirm").modal("hide");
        }
    });
    $w.on("withdrawFundsCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            var player = wallet.player;
            var amount = $("#withdraw-funds-amount").val();
            player.balance = parseFloat(player.balance) - parseFloat(amount);
            $("#account-customer-balance").text(player.balance);
            $.jStorage.set("player", player);
            smallNotification("Funds Withdrawn!");
        }
    });
    $w.on("createSupportTicketCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            smallNotification("Your ticket has been submitted.");
        }
    });
    // Validation
    $w.on("sendValidationMessageCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            switch (resp.purposeType) {
                case 11: // CustomerEmailValidation
                    smallNotification("A validation messaage has been sent to your email address, you should receive it shortly.");
                    $("#div-email-validation-request").hide();
                    $("#div-email-validation-confirm").show();
                    delayResendLink('email');
                    break;
                case 10: // CustomerCellphoneValidation
                    smallNotification("A SMS message has been sent to your cell phone, you should receive it shortly.");
                    $("#div-cellphone-validation-request").hide();
                    $("#div-cellphone-validation-confirm").show();
                    delayResendLink('cellphone');
                    break;
            }
        }
    });
    $w.on("confirmValidationCodeCalled", function (ev, resp) {
        if (resp.wasSuccessful) {
            $.jStorage.set("token", wallet.token);
            switch (resp.purposeType) {
                case 11: // CustomerEmailValidation
                    smallNotification("You have sucessfully verified your email address.");
                    $("#div-email-validation-request").hide();
                    $("#div-email-validation-confirm").hide();
                    break;
                case 10: // CustomerCellphoneValidation
                    smallNotification("You have sucessfully verified your cell phone number.");
                    $("#div-cellphone-validation-request").hide();
                    $("#div-cellphone-validation-confirm").hide();
                    break;
            }
        }
    });


    //Page events
    $(".btn-reset").click(function () { passwordReset(); });
    $(".btn-enable-details-edit").click(function () {
        //$("#FirstName").prop("disabled", false);
        //$("#LastName").prop("disabled", false);
        //$("#Gender").prop("disabled", false);
        //$("#Birthday").prop("disabled", false);
        //$("#EmailAddress").prop("disabled", false);
        $("#CellPhone").prop("disabled", false);
        $("#PhoneNumber").prop("disabled", false);
        $("#Employer").prop("disabled", false);
        $("#AddressLine1").prop("disabled", false);
        $("#AddressLine2").prop("disabled", false);
        $("#AddressLine3").prop("disabled", false);
        $("#AddressLine4").prop("disabled", false);
        $("#Locality").prop("disabled", false);
        $("#Region").prop("disabled", false);
        $("#Postcode").prop("disabled", false);
        $("#Country").prop("disabled", false);
        $(".btn-details-update").show();
        $(".btn-enable-details-edit").hide();
    });
    $(".btn-details-update").click(function () {
        editDetails($("#FirstName").val(),
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
    });
    $(".btn-transaction-history-search").click(function () {
        transactions();
    });
    $(".btn-save-limits").click(function () {
        var deposit = $.grep(limits, function (e) { return e.name == "Deposit"; })[0];
        var wager = $.grep(limits, function (e) { return e.name == "Wager"; })[0];
        var losses = $.grep(limits, function (e) { return e.name == "Losses"; })[0];
        var withdraw = $.grep(limits, function (e) { return e.name == "Withdraw"; })[0];
        var lotteryOrderCount = $.grep(limits, function (e) { return e.name == "Lottery Order Count"; })[0];
        var gamingBetCount = $.grep(limits, function (e) { return e.name == "Gaming Bet Count"; })[0];

        deposit.hourAmount = $("#dep_h_Amount").val();
        deposit.dayAmount = $("#dep_d_Amount").val();
        deposit.weekAmount = $("#dep_w_Amount").val();
        deposit.monthAmount = $("#dep_m_Amount").val();
        deposit.yearAmount = $("#dep_y_Amount").val();
        wager.hourAmount = $("#wag_h_Amount").val();
        wager.dayAmount = $("#wag_d_Amount").val();
        wager.weekAmount = $("#wag_w_Amount").val();
        wager.monthAmount = $("#wag_m_Amount").val();
        wager.yearAmount = $("#wag_y_Amount").val();
        losses.hourAmount = $("#los_h_Amount").val();
        losses.dayAmount = $("#los_d_Amount").val();
        losses.weekAmount = $("#los_w_Amount").val();
        losses.monthAmount = $("#los_m_Amount").val();
        losses.yearAmount = $("#los_y_Amount").val();
        withdraw.hourAmount = $("#wd_h_Amount").val();
        withdraw.dayAmount = $("#wd_d_Amount").val();
        withdraw.weekAmount = $("#wd_w_Amount").val();
        withdraw.monthAmount = $("#wd_m_Amount").val();
        withdraw.yearAmount = $("#wd_y_Amount").val();
        lotteryOrderCount.hourAmount = $("#loc_h_Amount").val();
        lotteryOrderCount.dayAmount = $("#loc_d_Amount").val();
        lotteryOrderCount.weekAmount = $("#loc_w_Amount").val();
        lotteryOrderCount.monthAmount = $("#loc_m_Amount").val();
        lotteryOrderCount.yearAmount = $("#loc_y_Amount").val();
        gamingBetCount.hourAmount = $("#gbc_h_Amount").val();
        gamingBetCount.dayAmount = $("#gbc_d_Amount").val();
        gamingBetCount.weekAmount = $("#gbc_w_Amount").val();
        gamingBetCount.monthAmount = $("#gbc_m_Amount").val();
        gamingBetCount.yearAmount = $("#gbc_y_Amount").val();

        limits = [];
        limits.push(deposit);
        limits.push(wager);
        limits.push(losses);
        limits.push(withdraw);
        limits.push(lotteryOrderCount);
        limits.push(gamingBetCount);

        saveLimits(limits);
    });
    $(".btn-confirm-exclusion").click(function () {
        var sdate = $(".confirm-exclusion-start-date").val();
        var edate = $(".confirm-exclusion-end-date").val();
        var reason = $(".confirm-exclusion-reason").val();
        confirmExclusion(sdate, edate, reason);
    });
    $(".btn-cancel-exclusion").click(function () {
        cancelExclusion();
    });
    $(".btn-change-password").click(function () {
        var CurrentPassword = $("#CurrentPassword").val();
        var NewPassword = $("#NewPassword").val();
        var ConfirmPassword = $("#ConfirmPassword").val();
        changePassword(CurrentPassword, NewPassword, ConfirmPassword);
    });
    $(".btn-change-pin").click(function () {
        var CurrentPIN = $("#CurrentPIN").val();
        var NewPIN = $("#NewPIN").val();
        var ConfirmPIN = $("#ConfirmPIN").val();
        changePin(CurrentPIN, NewPIN, ConfirmPIN);
    });
    $(".btn-redeem-voucher").click(function () {
        var voucher = $("#txtVoucherCode").val();
        redeemVoucher(voucher);
    })
    $('body').on('click', '.btn-replay-edit', function () {
        var id = $(this).parent().find(".replay-id").text();
        var title = $(this).parent().parent().find(".replay-title").text();
        var count = $(this).parent().parent().find(".replay-count").text();

        $("#editReplayID").val(id);
        $("#replayTitle").val(title);
        $("#replayCount").val(count);
        $("#editFavModal").modal();
    });
    $('body').on('click', '.btn-transaction-details', function () {
        var id = $(this).parent().parent().find(".transaction-order-id").text();
        transactionDetails(id);
    });
    $('body').on('click', '.btn-syndicate-details', function () {
        var id = $(this).closest("td").find(".syndicate-id").text();
        syndicateOrderDetails(id);
    });
    $('body').on('click', '.btn-syndicate-edit', function () {
        var id = $(this).closest("td").find(".syndicate-id").text();
        closestMonthly = $(this).closest("tr").find(".syndicate-monthly-renewal-interval").text();
        closestShare = $(this).closest("tr").find(".syndicate-share-count").text();
        $("#editShareID").val(id);
        syndicateOrderBillingCycleOptions(id);
    });
    $(".btn-syndicate-confirm-edit").click(function () {
        var id = $("#editShareID").val();
        var count = $("#editShareCount").val();
        var billingCycle = $("#editSyndicate_BillingCycle_ID").val();

        editSyndicateShare(id, count, billingCycle);
    });
    $('body').on('click', '.btn-syndicate-cancel', function () {
        var id = $(this).closest("td").find(".syndicate-id").text();
        $("#cancelShareID").val(id);
        $("#cancelSyndicateShareConfirm").modal();
    });
    $(".btn-syndicate-confirm-cancel").click(function () {
        var id = $("#cancelShareID").val();

        cancelSyndicateShare(id);
    });
    $(".btn-edit-replay-submit").click(function () {
        var id = $("#editReplayID").val();
        var count = $("#replayCount").val();

        editReplay(id, count);
    });
    $(".btn-withdraw-funds").click(function () {
        var amount = $("#withdraw-funds-amount").val();
        withdrawFunds(amount);
    });
    $(".btn-submit-support-ticket").click(function () {
        var subject = $("#Request_Subject").val();
        var details = $("#Request_Details").val();
        var attachment = $("#attachment-byte-array").val();
        var mime = $("#attachment-mime-type").val();

        createSupportTicket(subject, details, attachment, mime);
    });
    $(".nav-tabs a").on("click", function () {
        //$("#FirstName").prop("disabled", true);
        //$("#LastName").prop("disabled", true);
        //$("#Gender").prop("disabled", true);
        //$("#Birthday").prop("disabled", true);
        //$("#EmailAddress").prop("disabled", true);
        $("#CellPhone").prop("disabled", true);
        $("#PhoneNumber").prop("disabled", true);
        $("#Employer").prop("disabled", true);
        $("#AddressLine1").prop("disabled", true);
        $("#AddressLine2").prop("disabled", true);
        $("#AddressLine3").prop("disabled", true);
        $("#AddressLine4").prop("disabled", true);
        $("#Locality").prop("disabled", true);
        $("#Region").prop("disabled", true);
        $("#Postcode").prop("disabled", true);
        $("#Country").prop("disabled", true);
        $(".btn-details-update").hide();
        $(".btn-enable-details-edit").show();
    });

    $("#transactions-menu").on("click", function () {
        transactions();
    });
    $("#player-limits-menu").on("click", function () {
        var player = wallet.player;
        if (player.features.feature_PlayerLimits) getLimits();
    });
    $("#player-exclusions-menu").on("click", function () {
        var player = wallet.player;
        if (player.features.feature_PlayerExclusions) exclusions();
    });
    $("#ticket-replay-menu").on("click", function () {
        replays();
    });
    $("#syndicate-orders-menu").on("click", function () {
        var player = wallet.player;
        if (player.features.feature_Syndication) syndicateOrders();
    });
    // Validation
    $(".btn-details-validate-email").click(function () {
        var code = $("#ValidateEmailCode").val();
        confirmValidationCode(11, code); // CustomerEmailValidation
    });
    $(".btn-details-validate-cellphone").click(function () {
        var code = $("#ValidateCellPhoneCode").val();
        confirmValidationCode(10, code); // CustomerCellphoneValidation
    });

    //Page Init
    init();
});

function init() {
    if ($.jStorage.get("player") != null) {
        wallet.player = $.jStorage.get("player");
        getUserViaSession();
    }

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = mm + '/' + dd + '/' + yyyy;

    $("#StartDate").val(today);
    $("#EndDate").val(today);
    $(".exclusions-list").hide();
}

function getUserViaSession() {
    wallet.getPlayerViaSession();
}

function AccountDetails(player) {
    $("#account-customer-id").val(player.id);
    $("#account-customer-username").val(player.username);
    $("#account-customer-full-name").val("I don't think I have this info");
    $("#account-customer-balance").val("0");
}

function passwordReset() {
    var username = $(".reset-username").val();
    var currpass = "";//$(".current-password").val();
    var newpass = $(".new-password").val();
    var confirmpass = $(".confirm-password").val();
    var key = $(".reset-key").val();
    wallet.passwordReset(username, currpass, newpass, confirmpass, key);
}

function validateKey() {
    var key = $(".reset-key").val();
    wallet.passwordResetKeyValidation(key);
}

function getDetails() {
    wallet.details();
}

function editDetails(firstname, lastname, gender, birthday, emailaddress, cellphone, phonenumber, employer, address1, address2, address3, address4, locality, postcode, country, region) {
    wallet.editDetails(firstname, lastname, gender, birthday, emailaddress, cellphone, phonenumber, employer, address1, address2, address3, address4, locality, postcode, country, region);
}

function transactions() {
    var sDate = $("#StartDate").val();
    var eDate = $("#EndDate").val();
    wallet.transactions(sDate, eDate);
}

function transactionDetails(id) {
    wallet.transactionDetails(id);
}

function getLimits() {
    wallet.limits();
}

function saveLimits(limits) {
    wallet.saveLimits(limits);
}

function exclusions() {
    wallet.exclusions();
}

function cancelExclusion() {
    wallet.cancelExclusion();
}

function confirmExclusion(sDate, eDate) {
    wallet.confirmExclusion(sDate, eDate);
}

function changePassword(currentPassword, newPassword, confirmPassword) {
    wallet.changePassword(currentPassword, newPassword, confirmPassword);
}

function changePin(currentPin, newPin, confirmPin) {
    wallet.changePin(currentPin, newPin, confirmPin)
}

function redeemVoucher(voucher) {
    wallet.redeemVoucher(voucher);
}

function replays() {
    wallet.replays();
}

function replayDetails(id) {
    wallet.replayDetails(id);
}

function editReplay(id, replayCount) {
    wallet.editReplay(id, replayCount);
}

function syndicateOrders() {
    wallet.syndicateOrders();
}

function syndicateOrderDetails(id) {
    wallet.syndicateOrderDetails(id);
}

function syndicateOrderBillingCycleOptions(id) {
    wallet.syndicateOrderBillingCycleOptions(id);
}

function editSyndicateShare(id, shareCount, billingID) {
    wallet.editSyndicateShare(id, shareCount, billingID);
}

function cancelSyndicateShare(id) {
    wallet.cancelSyndicateShare(id);
}

function withdrawFunds(amount) {
    wallet.withdrawFunds(amount);
}

function createSupportTicket(subject, details, attachment, mime) {
    wallet.createSupportTicket(subject, details, attachment, mime);
}

// Shows a small notification
var smallNotificationTimeoutHandle = null;
function smallNotification(messageHtml, timeout, runIfLinkClickedInMessage) {
    if (smallNotificationTimeoutHandle != null) {
        clearTimeout(smallNotificationTimeoutHandle);
    }
    var message = $("#message");
    message.html(messageHtml);
    var a = message.find("a");
    if (a.length == 1 && typeof runIfLinkClickedInMessage === "function") {
        a.one("click", function () {
            runIfLinkClickedInMessage();
            clearTimeout(smallNotificationTimeoutHandle);
            message.hide("fast");
            return false;
        })
    }
    message.show("fast");
    smallNotificationTimeoutHandle = setTimeout(function () {
        clearTimeout(smallNotificationTimeoutHandle);
        message.hide("fast");
    }, (timeout || 7777));
}


function errorOccured(ev, error, isFatal) {
    var ferror = friendlyError(error);
    console.log("ERROR OCCURRED: " + error + " - " + ferror);
    if (isFatal)
        showErrorMessage(ferror);
    else
        window.alert(ferror);

    //doneLoading();
}

//function friendlyError(message) {
//	if (message == "" || message == null) return null;
//	switch (message) {
//		case "SERVER_ERROR":
//			return "An Internal error occured.";
//		case "PLAYER_NOT_FOUND":
//			return "Player information could not be found.";
//		case "PLAYER_EXCLUDED_FROM_PLAY":
//			return "Player has been excluded from play. Please contact customer support.";
//		case "PLAYER_LOCKED_OUT":
//			return "Player has been locked out. Please contact customer support.";
//		case "PLAYER_INACTIVE":
//			return "Player account is inactive. Pleae contact customer support.";
//		case "AUTHENTICATION_FAILED":
//			return "Username or password is incorrect.";
//		case "ACCOUNT_CREATION_FAILED":
//			return "There was an error creating your account, please try again later.";
//		case "INVALID_KEY":
//			return "The configuration for lottery is not valid.";
//		case "GAME_TYPE_UNAVAILABLE":
//			return "This game is unavailable at this time. Please contact customer support for more information.";
//		case "NO_DRAWINGS":
//			return "There are no drawings available for today. Please check back later!";
//		case "NO_HOUSES_SELECTED":
//			return "No houses have been selected. Please select at least one house to add bets.";
//		case "NO_NUMBERS_SELECTED":
//			return "No numbers have been chosen. Please select numbers to play, and try again.";
//		case "CANNOT_PLAY_PAST_DRAWINGS":
//			return "Cannot play drawings that are in the past. Please select a drawing that has not closed, and try again.";
//		case "HOUSE_NOT_FOUND":
//			return "That house was not found.";
//		case "COULD_NOT_FIND_DRAWING_FOR_NUMBERS_PROVIDED":
//			return "Could not find a drawing for the house that matches the numbers entered.";
//		case "COULD_NOT_PARSE_NUMBERS":
//			return "Could not parse the numbers given.";
//		case "HOUSE_DOES_NOT_ALLOW_STRAIGHT_BETS":
//			return "The house selected does not allow straight bets.";
//		case "HOUSE_DOES_NOT_ALLOW_BOXED_BETS":
//			return "The house selected does not allow boxed bets.";
//		case "BET_UNDER_MINIMUM_ALLOWED_AMOUNT":
//			return "The amount for this bet is under the minimum amount allowed for this drawing.";
//		case "BET_OVER_MAXIMUM_ALLOWED_AMOUNT":
//			return "The amount for this bet is over the maximum amount allowed for this drawing.";
//		case "BOXED_BET_IS_INVALID":
//			return "The boxed bet specified is invalid. This can be caused by repeating the same number.";
//		case "SOLD_OUT":
//			return "The number for this drawing is sold out.";
//		case "DRAWING_CLOSED":
//			return "This drawing has closed.";
//		case "LINE_LIMIT_EXCEEDED":
//			return "The number of lines allowed on an order has been exceeded.";
//		case "NO_BETS":
//			return "There are no bets on the order. Add some bets, and try again.";
//		case "INVALID_BETS":
//			return "There are invalid bets on the order, which need to be removed before the order can be placed.";
//		case "LOGIN_LOCATION_INVALID":
//			return "There was an issue determining your location, by law, your location is required to place an order.";
//		case "FAVORITE_SAVING_ERROR":
//			return "There was an error saving your favorite, please try again later.";
//		case "FAVORITE_LIMIT_REACHED":
//			return "You have reached the maximum number of favorites you can save, delete some favorites to save more.";
//		case "DUPLICATE_FAVORITE_NAME":
//			return "A favorite with this name already exists.";
//		case "WALLET_APPLICATION_USERNAME_OR_PASSWORD_INCORRECT":
//			return "Username or password is incorrect";
//			// Validation
//		case "CUSTOMER_MESSAGE_VALIDATION_FAILED":
//			return "The system failed to send the validation message. Please try again.";
//		case "CUSTOMER_EMAIL_INVALID":
//			return "Your email address does not appear to be in a valid format. Please correct this and try again.";
//		case "CUSTOMER_CELLPHONE_INVALID":
//			return "Your cell phone number does not appear to be in international format (MSISDN) for sending SMS messages. Please correct this and try again.";
//		case "CUSTOMER_DUPLICATE_VALIDATION_MESSAGE":
//			return "You must wait a bit before attempting to resend the confirmation code.";
//		case "CUSTOMER_UNKNOWN_VALIDATION_TYPE":
//			return "The system could not determine what type of validation you are requesting. Please try again.";
//		case "CUSTOMER_CONFIRM_VALIDATION_FAILED":
//			return "There was an issue validating the code entered. Please try again.";
//		case "CUSTOMER_INVALID_CODE":
//			return "The code you entered was invalid or not found, it must be six digits long. Please re-enter and try again.";
//		case "CUSTOMER_EXPIRED_CODE":
//			return "The code you entered has expired. You will need to send another validation request.";
//		default: // idk
//			return message;
//	}
//}

// Validation
function sendValidationMessage(purposeType) {
    /*
		purposeType:
			CustomerCellphoneValidation = 10,
			CustomerEmailValidation = 11,
	*/
    switch (purposeType) {
        case 11: // CustomerEmailValidation
            $("#resend-code-email").hide();
            $("#ValidateEmailCode").val(''); // Clear the value if there is one entered in already;
            break;
        case 10: // CustomerCellphoneValidation
            $("#resend-code-cellphone").hide();
            $("#ValidateCellPhoneCode").val(''); // Clear the value if there is one entered in already;
            break;
    }
    wallet.sendValidationMessage(purposeType);
}

function delayResendLink(validationTypeString) {
    setTimeout(function () {
        $("#resend-code-" + validationTypeString).show(); // show the re-send link 30 seconds after initial send.
    }, 30000);
}

function confirmValidationCode(purposeType, code) {
    /*
		purposeType:
			CustomerCellphoneValidation = 10,
			CustomerEmailValidation = 11,
	*/
    switch (purposeType) {
        case 11: // CustomerEmailValidation
            $("#ValidateEmailCode").val(); // Clear the value of the code;
            break;
        case 10: // CustomerCellphoneValidation
            $("#ValidateCellPhoneCode").val(); // Clear the value of the code;
            break;
    }
    wallet.confirmValidationCode(purposeType, code);
}

function filterMenu(features) {
    if (features == undefined || features == null) return;
    // Check for inactive features and remove them from the menu links;
    if (!features.feature_PlayerLimits) {
        $("#player-limits-menu").hide();
    }
    if (!features.feature_PlayerExclusions) {
        $("#player-exclusions-menu").hide();
    }
    if (!features.feature_Syndication) {
        $("#syndicate-orders-menu").hide();
    }
    if (!features.feature_SupportTickets) {
        $("#support-menu").hide();
    }
    if (!features.feature_Promotions) {
        $("#redeem-voucher-menu").hide();
    }
}

function unloadUser() {    
    wallet.player = null;
    $.jStorage.flush();
    $.jStorage.deleteKey("player");
    //$.jStorage.deleteKey("playerId");
    //$.jStorage.deleteKey("Name");
    //$.jStorage.deleteKey("TotaAmount");

}

