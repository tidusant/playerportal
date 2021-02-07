$(function () { 

    $.ajax({
        type: "POST",
        //url: '../PlayerPortal_L4/Home/GetCafeGameImageInfo',
        url: RootUrl +'Home/GetCafeGameImageInfo',
        dataType: 'json',
        success: function (data) {

             for (i = 0; i < data.length; i++) {
                if (data[i].Category == "Top Rated") {
                    var topPlayed = '<div class="slides">' +
                    '	<div class="slot">' +
                    '		<i class="new index_icons"></i>' +
                    '		<img src=' + data[i].strGameImage + ' style="width: 236px;height: 132px;">' +
                    '		<div class="game-title">' +
                    '			<i class="icon-flame index_icons"></i> ' + data[i].ImageLink + '' +
                    '			<div class="rating">' +
                    '				<span class="star-a index_icons"></span>' +
                    '				<span class="star-a index_icons"></span>' +
                    '				<span class="star-a index_icons"></span>' +
                    '				<span class="star-a index_icons"></span>' +
                    '				<span class="star-a index_icons"></span>' +
                    '			</div>' +
                    '		</div>' +
                    '		<div class="trans games">' +
                    '			<a href="javascript:play(false,\'greedyservants\',true,false);" runat="server" class="btn gamein" attr-gamename="Cash Fish" attr-gameplat="PT" attr-gameid="cashfi">Play now</a>' +
                    '		</div>' +
                    '	</div>' +
                    '</div>';

                    $('#topPlayed').append(topPlayed);
                }

                else if (data[i].Category == "Player Choices") {
                    var playerChoice = '<div class="event"><a href="javascript:play(false,\'greedyservants\',true,false);" runat="server">' +
                                       '<img src=' + data[i].strGameImage + ' style="width: 236px;height:100%; position:relative; background-size:contain"/>' +
                                       '<span class="event-t">' + data[i].ImageLink + '</span></a></div>';

                    $('#playerChoice').append(playerChoice);
                }
                else if (data[i].Category == "Editor Choices") {
                    var editorChoice = '<div class="game-c"><div class="game">' +
                                        '<a href="javascript:play(false,\'greedyservants\',true,false);" runat="server">' +
                                        '<span class="light"></span>                                    ' +
                                        '<img class="game-img" src=' + data[i].strGameImage + ' style="height:255px; background-size:contain" />' +
                                        '</a></div></div>';

                    $('#editorChoice').append(editorChoice);
                }
            }

            $('.game-cycle').cycle();
            $('.slot-cycle').cycle();
            $('.event-cycle').cycle();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(errorThrown);

        }

    })
})

