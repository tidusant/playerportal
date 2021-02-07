var windowProxy;
window.onload=function(){

    // Create a proxy window to send to and receive
    // messages from the iFrame


    // Register an event handler to receive messages;
    windowProxy.addEventListener(onMessage);


};

        
if((typeof jQuery !== 'undefined')) {
    (function ($) {
        if ($('.bxslider').length) {
            $('.bxslider').bxSlider(
                {
                    auto: true,
                    mode: 'fade',
                    pause: 6000,
                    autoHover: true
                }
            );
        }

        if ($("#luckynumber_lotto").length) {
            $("#luckynumber_lotto").html(luckynuumber(0,9));
        }
        if ($("#luckynumber_home").length) {
            $("#luckynumber_home").html(luckynuumber(0,9));
        }
        if ($("#luckynumber_wn").length) {
            $("#luckynumber_wn").html(luckynuumber(0,9));
        }



        $("#btnarea").on('click',function(){
            var toggleWidth = $("#calcdiv").width() == 540 ? "85px" : "540px";
        //$('#toggle').animate({ width: toggleWidth });
             $("#calcdiv").animate({
                width: toggleWidth
            }, 1000, function() {
                 $("#calcarea").toggle();
            // Animation complete.
            });
            return false;
        });
        $("#payout_submit").on('click', function () {
         calculate();
        });

         function calculate(){
            //console.log(combinations($("#number").val()));
            var input = $("#number").val().split('');
var result = perms(input);
for (var i = 0; i < result.length; i++) {
    result[i] = result[i].join('');
}
            //console.log(unique(result));
//console.log(unique(result).length);
            //which ticket type?
            var lottery = [60,600,5000];
            var paper = [60,600,4500];
            var total=0;
            var combo = 1;
            if(jQuery("#match_type").val()=="box"){
                combo = unique(result).length;
            }
            //PayoutPer$ x Amount / Ways = Total Payout

            if(jQuery("#ticket_type").val()=="Lottery Ticket"){
                total = (paper[jQuery("#game_type").val()] * jQuery("#amount").val())/combo;
            }
            if(jQuery("#ticket_type").val()=="Online Ticket"){
                total = (online[jQuery("#game_type").val()] * jQuery("#amount").val())/combo;
            }
          //  console.log((Math.floor(total* 100) / 100).toFixed(2));
            jQuery("#winnings").html('$' + (Math.floor(total* 100) / 100).toFixed(2));

        }
        function combinations(str) {
    var fn = function(active, rest, a) {
        if (!active && !rest)
            return;
        if (!rest) {
            a.push(active);
        } else {
            fn(active + rest[0], rest.slice(1), a);
            fn(active, rest.slice(1), a);
        }
        return a;
    }
    return fn("", str, []);
}
        function perms(data) {
    if (!(data instanceof Array)) {
        throw new TypeError("input data must be an Array");
    }

    data = data.slice();  // make a copy
    var permutations = [],
        stack = [];

    function doPerm() {
        if (data.length == 0) {
            permutations.push(stack.slice());
        }
        for (var i = 0; i < data.length; i++) {
            var x = data.splice(i, 1);
            stack.push(x);
            doPerm();
            stack.pop();
            data.splice(i, 0, x);
        }
    }

    doPerm();
            return permutations;

}
        function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}
        function luckynuumber(min, max){
            return "<img src='images/A_" + (Math.floor(Math.random() * (max - min + 1)) + min) + ".png'><img src='images/A_" + (Math.floor(Math.random() * (max - min + 1)) + min) + ".png'><img src='images/A_" + (Math.floor(Math.random() * (max - min + 1)) + min) + ".png'>";
        }
        function call1(){
            //console.log("call 1");
            //console.log($('#f1').contents().find('body').html());
             //$('#f1').contents().find('body').html('<div> blah </div>');

        }
        //call1();
        //$('#f1').load(function() {
        //   call1();
        //});

    })(jQuery);

}
