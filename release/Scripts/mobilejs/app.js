// FUNCTIONS
function showNotification(type, container, message, isPrepend) {
    var notification = $('<div class="alert alert-'+type+'" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'+message+'</div>');
    notification.hide();
    if (isPrepend) $(container).prepend(notification); else $(container).append(notification);
    notification.slideDown().delay(5000).slideUp();
}

function showError(title,message) {
    var alert = $('<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span></button><strong>'+title+'</strong> '+message+'</div>');
    $('#page-wrapper > .container-fluid').prepend(alert);
};

function showWindow(url, form, size) {

    $('#ajax-modal .modal-body').load(url + ' #body', function(response, status, xhr) {
        var html = $('<div/>').append(response);
        var title = html.find('#title').text();
        $('#ajax-modal .modal-header').html(title);
    });

    $('#ajax-modal .modal-dialog').toggleClass('modal-sm', ! size);
    $('#ajax-modal .btn-primary').toggle(form);

    $('#ajax-modal').modal('show');

}

function webGoto(page){
    if (page != null && page.length > 0) {
        window.location.href=page + ".htm";
    }
}

function appGoto(page){
    if (page != null && page.length > 0) {
        window.location.href=page + ".htm";
    }
}

function appGetMessage(reqMessageType, line) {
    var resultJson = null;
    $.ajaxSettings.async = false;
    $.getJSON(baseurl + '/message/getMessage.htm', {reqMessageType:reqMessageType, line:line}, function (data) {
        if (data.status == 'true') {
            resultJson = data;
        }
    });
    $.ajaxSettings.async = true;
    return resultJson;
}

function appPageLogout() {
    $.getJSON(baseurl + '/execute_PageOut.htm', {}, function (data) {
        window.location.href='index.htm';
    });
}


/*###################################################################################################################
 * PHP可使用JS函数接口，START
 *###################################################################################################################
 */
function appLogout() {
    //alert('logout');
    $.getJSON('/appLogout.htm', {}, function (data) {
        appSendLogoutSignal(window.loginName, window.token);
        //alert('logout success');
        window.location.href='appLogin.htm';
    });
}

function appSendLogoutSignal(accountName, accountToken){
    //alert("send logout signal");
    if(typeof(appClient) != "undefined"){
        appClient.logoutNotice(accountName, accountToken);
        //alert("had sended logout signal to appClient");
    }else{
        window.location.href = "appshoot://logoutNotice?accountName=" + accountName + "&accountToken=" + accountToken;
        //alert("appClient is undefined. had sended logout signal to ios");
    }
}

function appGotoUrl(url){
	//alert("send appGotoUrl");
    if(typeof(appClient) != "undefined"){
        appClient.gotoUrl(url);
        //alert("had sended appGotoUrl to appClient");
    }else{
        window.location.href = "appshoot://gotoUrl?url="+url;
        //alert("appClient is undefined. had sended appGotoUrl to ios");
    }
}

function appGotoSlotUrl(url){
	//alert("send appGotoUrl");
    if(typeof(appClient) != "undefined"){
        appClient.appGotoSlotUrl(url);
        //alert("had sended appGotoUrl to appClient");
    }else{
        window.location.href = "appshoot://appGotoSlotUrl?url="+url;
        //alert("appClient is undefined. had sended appGotoUrl to ios");
    }
}



function appLoginToGame(gameCode,clientType){
	//alert("send appLoginToGame");
    if(typeof(appClient) != "undefined"){
        appClient.loginToGame(gameCode,clientType);
        //alert("had sended appLoginToGame to appClient");
    }else{
        window.location.href = "appshoot://loginToGame?gameCode="+ gameCode +"&clientType="+clientType;
        //alert("appClient is undefined. had sended appLoginToGame to ios");
    }
}

function appSendLoginSignal(accountName, accountToken){
	//alert("send login signal");
    if(typeof(appClient) != "undefined"){
        appClient.loginNotice(accountName, accountToken);
        //alert("had sended login signal to appClient");
    }else{
        window.location.href = "appshoot://loginNotice?accountName=" + accountName + "&accountToken=" + accountToken;
        //alert("appClient is undefined. had sended login signal to ios");
    }
}

function appSendRefershLoginNotice(accountName, accountToken){
	//alert("send login signal");
    if(typeof(appClient) != "undefined"){
        appClient.refershLoginNotice(accountName, accountToken);
        //alert("had sended login signal to appClient");
    }else{
        window.location.href = "appshoot://refershLoginNotice?accountName=" + accountName + "&accountToken=" + accountToken;
        //alert("appClient is undefined. had sended login signal to ios");
    }
}

function appLoginByToken(accountName, accountToken){
    //alert("confirm login by accountName: " + accountName + " ; token : " + accountToken + "; ?");
    if (window.isLogin && window.token == accountToken)
    {
        //alert('already login');
    	appSendRefershLoginNotice(accountName, accountToken);
        return true;
    }

    $.getJSON('/doAutoLogin.htm', {username:accountName, token:accountToken}, function (data) {
        if (data.isLoginSucc == 1) {
            //alert("tokenLogin success");
        	appSendRefershLoginNotice(accountName, accountToken);
            appGoto('index');
        }else{
            //alert("tokenLogin fail!");
            appSendLogoutSignal(accountName, accountToken);
        }
    });
}


function setCookie(cname, cvalue, time,domain) {
    
    if(time==undefined)time=24*60*60;
    var d = new Date();
    d.setTime(d.getTime() + time*1000);
    var expires = "expires="+ d.toUTCString();
    
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"+(domain!=undefined?(";domain="+domain):"");
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function callLogin(){
    if(!$("#fbMenu").hasClass("fbHide"))
        toggleFBMenu();
        $("#LoginBox").modal("show");
    }


function checklogin(){

    if ($.jStorage.get("Player") != null) {
        $(".profile_loggedout").hide();
        $(".profile_loggedin").show();
        console.log("logged in");
    }else{
        console.log("logged out");
        $(".profile_loggedout").show();
        $(".profile_loggedin").hide();
    }

}



// READY
$(function() {
    window.loginName   = $('#AppInfo').attr('username');
    window.token        = $('#AppInfo').attr('token');
    window.isLogin        = $('#AppInfo').attr('isLogin');
    checklogin();
});