function InitClock(clockElement, date) {
    var counter = (new Date(date) - (new Date())) / 1000;
    var clock = $(clockElement).FlipClock(counter,{
        clockFace: 'DailyCounter',
        countdown: true,
        stop: function() {
            location.reload();
        },
    });
}