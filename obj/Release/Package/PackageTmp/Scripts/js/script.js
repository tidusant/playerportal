/**
 * VIEW GLOBALS.JS FOR GLOBAL VARIABLES
 */
"use strict";
var lottery = null;
var wallet = null;
var webcalloutCount = 0; // Tracks # of levels deep calls out are done, to allow client to have "busy" status
var coords = ""; //Holder var for the coordinates
var gameType = 2; //Defailt game type if getGames is ever called without specifying
var wa = 1; //Web application ID, should always be 1.

var userAgent = navigator.userAgent.toLowerCase(),
		initialDate = new Date(),
		$html = $('html'),
		isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
		isDesktop = $html.hasClass('desktop'),
		isIEBrows = navigator.appVersion.indexOf("MSIE") != -1 || navigator.appVersion.indexOf('Trident/') > 0,
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
		isTouch = "ontouchstart" in window,
		$year = $("#copyright-year"),
		$document = $(document),
		plugins = {
		    pointerEvents: isIE && isIE < 11 ? 'js/pointer-events.min.js' : false,
		    smoothScroll: $html.hasClass('use--smoothscroll') ? 'js/smoothscroll.min.js' : false,
		    tooltip: $('[data-toggle="tooltip"]'),
		    timePicker: $(".rd-mailform-time-picker"),
		    datePicker: $('.form-input[type="date"]'),
		    dropdownSelect: $(".rd-mailform-select"),
		    flickrfeed: $('.flickr'),
		    filePicker: $('.rd-file-picker'),
		    fileDrop: $('.rd-file-drop'),
		    popover: $('[data-toggle="popover"]'),
		    calendar: $('.rd-calendar'),
		    parallax: $('.rd-parallax'),
		    search: $('.rd-navbar-search'),
		    video: $(".rd-video"),
		    instafeed: $('.instafeed'),
		    twitterfeed: $('.twitter'),
		    facebookfeed: $('.facebook'),
		    materialTabs: $('.rd-material-tabs'),
		    responsiveTabs: $('.responsive-tabs'),
		    navTabs: $('.nav-tabs'),
		    textRotator: $(".rotator"),
		    mfp: $('[data-lightbox]').not('[data-lightbox="gallery"] [data-lightbox]'),
		    mfpGallery: $('[data-lightbox^="gallery"]'),
		    owl: $('.owl-carousel'),
		    navbar: $('.rd-navbar'),
		    dateCountdown: $('.DateCountdown'),
		    statefulButton: $('.btn-stateful'),
		    countDown: $('.countdown'),
		    counter: $('.counter'),
		    viewAnimate: $('.view-animate'),
		    progressBar: $('.progress-bar'),
		    swiper: $(".swiper-slider"),
		    isotope: $(".isotope"),
		    mailForm: $('.rd-mailform'),
		    facebookplugin: $('#fb-root'),
		    googleMapAPI: '//maps.google.com/maps/api/js',
		    googleMapLibraries: '//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places',
		    googleMap: $('#google-map'),
		    googleSearch: $('.google-search'),
		    audioPlayer: $('.rd-audio'),
		    slick: $('.carousel-slider'),
		    scroller: $(".scroll-wrap"),
		    socialite: $(".socialite"),
		    twitter: $(".twitter-timeline")
		},
		//$features = $('.icon-share'),
		i = 0;

function busy() { console.log("Busy..."); }
function notBusy() { console.log("No Longer Busy..."); }

function startDataLoadingAttribute() {
    $("[data-loading]").each(function () {
        var elem = this;
        $(elem).children().hide();
        $(elem).children(".loading").show();
        $(elem).bind("done-loading", function () {
            var that = $(this);
            var speed = $(that).attr("data-loading");
            if (speed != "off") {
                $(elem).unbind("done-loading");
                $(that).children(".loading").slideUp(speed);
                setTimeout(function () {
                    $(that).children().not(".loading").show(speed);
                }, 100);
            }
        });
    });
}
$(function () {
    startDataLoadingAttribute();
});

/**
 * Initialize All Scripts
 */
$document.ready(function () {
    var walurl = $("#APIURL").val();
    var loturl = $("#APIURL").val();
    var fkey = '';
    //4LL WALLET START
    wallet = new walletInit(walurl, jQuery, fkey, "en-US");
    lottery = new lotteryInit(loturl, jQuery, fkey, "en-US");
    var $l = $(lottery);
    var $w = $(wallet);
    //EVENTS
    $l.on("errorOccurred", function (ev, error, isFatal) {
        errorOccured(ev, error, isFatal);
    });
    $w.on("errorOccurred", function (ev, error, isFatal) {
        errorOccured(ev, error, isFatal);
    });

    $w.on("loadPlayerCalled", function (ev, player) {
        if (player != null) {
            $.jStorage.set("player", player);
            $.jStorage.set("token", wallet.token);
            $(".login").hide();
            //$(".balance-text").text("Balance: " + currencySymbol + player.balance.toFixed(numDecimals));
            $(".logout").show();

            $(".balance-text").text(currencySymbol + player.balance.toFixed(numDecimals));
            $(".checkout-place-order").show();
            $("#addToCart").show();
        }
        else {
            $(".login").show();
            $(".logout").hide();
            $("#addToCart").hide();
        }
    });

    $w.on("inactivityTimeoutEvent", function (ev) {
        $.jStorage.set("player", null);
        $.jStorage.set("token", null);
        $(".login").show();
        $(".logout").hide();
        $("#addToCart").hide();
        if (typeof displaySignInUp == 'function') {
            $(".login").show();
        }
    });

    $w.on("geoLocationCalled", function (ev, geolocationEnabled) {
        if (geolocationEnabled) {
            if (!navigator.geolocation) {
            } else navigator.geolocation.getCurrentPosition(geoSuccess, geoFail);
        }
        else {
            loadPlayer();
        }
    });

    //$w.on("playerCreatedCalled", function (ev, player) {
    //    alert("Account created succesfully! Please log in.");
    //    window.location.href = "/account/login";
    //});

    $l.on("getGamesCalled", function (ev, games, gameType) {
        switch (gameType) {
            case 1:
                //initLottoGames(games);
                break;
            case 2:
                //initKenoGames(games);
                break;
            case 3:
                initBigBallGames(games);
                break;
        }
    });
    geoLocation();
    //getGames(false, 2);

    //4LL WALLET END

    function getSwiperHeight(object, attr) {
        var val = object.attr("data-" + attr),
            dim;

        if (!val) {
            return undefined;
        }

        dim = val.match(/(px)|(%)|(vh)$/i);

        if (dim.length) {
            switch (dim[0]) {
                case "px":
                    return parseFloat(val);
                case "vh":
                    return $(window).height() * (parseFloat(val) / 100);
                case "%":
                    return object.width() * (parseFloat(val) / 100);
            }
        } else {
            return undefined;
        }
    }

    function toggleSwiperInnerVideos(swiper) {
        var prevSlide = $(swiper.slides[swiper.previousIndex]),
                nextSlide = $(swiper.slides[swiper.activeIndex]),
            videos;

        prevSlide.find("video").each(function () {
            this.pause();
        });

        videos = nextSlide.find("video");
        if (videos.length) {
            videos.get(0).play();
        }
    }

    function toggleSwiperCaptionAnimation(swiper) {
        var prevSlide = $(swiper.container),
                nextSlide = $(swiper.slides[swiper.activeIndex]);

        prevSlide
                .find("[data-caption-animate]")
                .each(function () {
                    var $this = $(this);
                    $this
                            .removeClass("animated")
                            .removeClass($this.attr("data-caption-animate"))
                            .addClass("not-animated");
                });

        nextSlide
                .find("[data-caption-animate]")
                .each(function () {
                    var $this = $(this),
                            delay = $this.attr("data-caption-delay");

                    setTimeout(function () {
                        $this
                                .removeClass("not-animated")
                                .addClass($this.attr("data-caption-animate"))
                                .addClass("animated");
                    }, delay ? parseInt(delay) : 0);
                });
    }

    function makeParallax(el, speed, wrapper, prevScroll) {
        var scrollY = window.scrollY || window.pageYOffset;

        if (prevScroll != scrollY) {
            prevScroll = scrollY;
            el.addClass('no-transition');
            el[0].style['transform'] = 'translate3d(0,' + -scrollY * (1 - speed) + 'px,0)';
            el.height();
            el.removeClass('no-transition');


            if (el.attr('data-fade') === 'true') {
                var bound = el[0].getBoundingClientRect(),
                        offsetTop = bound.top * 2 + scrollY,
                        sceneHeight = wrapper.outerHeight(),
                        sceneDevider = wrapper.offset().top + sceneHeight / 2.0,
                        layerDevider = offsetTop + el.outerHeight() / 2.0,
                        pos = sceneHeight / 6.0,
                        opacity;
                if (sceneDevider + pos > layerDevider && sceneDevider - pos < layerDevider) {
                    el[0].style["opacity"] = 1;
                } else {
                    if (sceneDevider - pos < layerDevider) {
                        opacity = 1 + ((sceneDevider + pos - layerDevider) / sceneHeight / 3.0 * 5);
                    } else {
                        opacity = 1 - ((sceneDevider - pos - layerDevider) / sceneHeight / 3.0 * 5);
                    }
                    el[0].style["opacity"] = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity.toFixed(2);
                }
            }
        }

        requestAnimationFrame(function () {
            makeParallax(el, speed, wrapper, prevScroll);
        });
    }

    function preventScroll(e) {
        e.preventDefault();
    }

    function isScrolledIntoView(elem) {
        var $window = $(window);
        return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
    }

    function lazyInit(element, func) {
        var $win = jQuery(window);
        $win.on('load scroll', function () {
            if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
                func.call();
                element.addClass('lazy-loaded');
            }
        });
    }

    /**
	 * @module       Set current year
	 */
    if ($year.length) {
        $year.text(initialDate.getUTCFullYear());
    }

    /**
	 * @module       IE Polyfills
	 * @description  Adds some loosing functionality to IE browsers
	 */
    if (isIE) {

        if (isIE < 10) {
            $html.addClass("lt-ie-10");
        }

        if (isIE < 11) {
            if (plugins.pointerEvents) {
                $.getScript(plugins.pointerEvents)
                        .done(function () {
                            $html.addClass("ie-10");
                            PointerEventsPolyfill.initialize({
                            });
                        });
            }
        }

        if (isIE === 11) {
            $("html").addClass("ie-11");
        }

        if (isIE === 12) {
            $("html").addClass("ie-edge");
        }
    }

    /**
	 * @module       Bootstrap Tooltips
	 * @author       Jason Frame
	 * @version      3.3.6
	 * @license      MIT License
	 * @link         https://github.com/twbs/bootstrap/blob/master/js/tooltip.js
	 */
    if (plugins.tooltip.length) {
        var tooltipPlacement = plugins.tooltip.attr('data-placement');
        $(window).on('resize orientationchange', function () {
            if (window.innerWidth < 599) {
                plugins.tooltip.tooltip('destroy');
                plugins.tooltip.attr('data-placement', 'bottom');
                plugins.tooltip.tooltip();
            }
            else {
                plugins.tooltip.attr('data-placement');
                plugins.tooltip.tooltip();
            }
        })
    }

    /**
	 * @module     RD Audio Player
	 * @author     Rafael Shayvolodyan
	 * @see        https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version    1.0.0
	 * @License    under dual CC By-SA 4.0 and GPLv3
	 */
    if (plugins.audioPlayer.length > 0) {
        for (i = 0; i < plugins.audioPlayer.length; i++) {
            var audioPlayerItem = plugins.audioPlayer[i];
            $(audioPlayerItem).RDAudio({
            });
        }
    }

    /**
	 * @module       RD Validator
	 * @author       Aleksey Patsurkovskiy
	 * @version      1.0.0
	 * @license      MIT License
	 * @link         http://cms.devoffice.com/coding-demo/mnemon1k/rd-validation/demo/
	 */
    if (plugins.mailForm.length) {
        if ("RDValidator" in jQuery.fn) {

            [].slice.call(plugins.mailForm).forEach(function (item) {
                var $currentForm = $(item),
                        mailFormSettings = {
                            formType: $currentForm.data("form-type"),
                            resultPanelClass: $currentForm.data("result-class"),
                            msg: {
                                'MF000': 'Successfully sent!',
                                'MF001': 'Recipients are not set!',
                                'MF002': 'Form will not work locally!',
                                'MF003': 'Please, define email field in your form!',
                                'MF004': 'Please, define type of your form!',
                                'MF254': 'Something went wrong with PHPMailer!',
                                'MF255': 'Aw, snap! Something went wrong.'
                            }
                        },
                        resultPanel = $('.' + mailFormSettings.resultPanelClass),
                        mailFormOptions = {
                            data: {
                                "form-type": mailFormSettings.formType
                            },
                            error: function (result) {
                                resultPanel.text(mailFormSettings.msg[result]);
                            },
                            success: function (result) {
                                result = result.length == 5 ? result : 'MF255';
                                resultPanel.text(mailFormSettings.msg[result]);
                                if (result === "MF000") {
                                    resultPanel[0].classList.add("success");
                                    setTimeout(function () {
                                        resultPanel[0].classList.remove("success");
                                        $currentForm.clearForm();
                                    }, 2500);
                                } else {
                                    resultPanel[0].classList.add("error");
                                    setTimeout(function () {
                                        resultPanel[0].classList.remove("error");
                                    }, 4000);
                                }
                            }
                        };

                $currentForm.RDValidator({
                    constraints: {
                        "@Time": {
                            rule: /^(1[012]|[1-9]):[0-5]\d\s[ap]\.?m\.?$/i,
                            message: 'Enter valid time format!'
                        }
                    }
                });
                $currentForm.ajaxForm(mailFormOptions);
            });
        }
    }

    /**
	 * @module       Text rotator
	 * @version      1.0.0
	 * @license      MIT license
	 */
    if (plugins.textRotator.length) {
        for (i = 0; i < plugins.textRotator.length; i++) {
            var textRotatorItem = plugins.textRotator[i];
            $(textRotatorItem).rotator();
        }
    }

    /**
	 * @module       Magnific Popup
	 * @author       Dmitry Semenov
	 * @see          http://dimsemenov.com/plugins/magnific-popup/
	 * @version      v1.0.0
	 */
    if (plugins.mfp.length > 0 || plugins.mfpGallery.length > 0) {
        if (plugins.mfp.length) {
            for (i = 0; i < plugins.mfp.length; i++) {
                var mfpItem = plugins.mfp[i];

                $(mfpItem).magnificPopup({
                    type: mfpItem.getAttribute("data-lightbox")
                });
            }
        }
        if (plugins.mfpGallery.length) {
            for (i = 0; i < plugins.mfpGallery.length; i++) {
                var mfpGalleryItem = $(plugins.mfpGallery[i]).find('[data-lightbox]');

                for (var c = 0; c < mfpGalleryItem.length; c++) {
                    $(mfpGalleryItem).addClass("mfp-" + $(mfpGalleryItem).attr("data-lightbox"));
                }

                mfpGalleryItem.end()
                        .magnificPopup({
                            delegate: '[data-lightbox]',
                            type: "image",
                            gallery: {
                                enabled: true
                            }
                        });
            }
        }
    }

    /**
	 * @module       RD-Google Map
	 * @author       Evgeniy Gusarov
	 * @see          https://ua.linkedin.com/pub/evgeniy-gusarov/8a/a40/54a
	 * @version      0.1.4
	 */
    if (plugins.googleMap.length) {
        $.getScript(plugins.googleMapLibraries)
                .done(function () {
                    var head = document.getElementsByTagName('head')[0],
                            insertBefore = head.insertBefore;

                    head.insertBefore = function (newElement, referenceElement) {
                        if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') != -1 || newElement.innerHTML.indexOf('gm-style') != -1) {
                            return;
                        }
                        insertBefore.call(head, newElement, referenceElement);
                    };

                    lazyInit(plugins.googleMap, function () {
                        plugins.googleMap.googleMap({
                            styles: []
                        });

                    });
                });
    }
    /**
	 *
	 *  @module Google Map Search
	 *
	 */
    if (plugins.googleSearch.length) {
        $.getScript(plugins.googleMapLibraries)
                .done(function () {

                    var map = new google.maps.Map(document.getElementById('map'), {
                        center: {
                            lat: -33.8688, lng: 151.2195
                        },
                        zoom: 13,
                        icon: image,
                        styles: [{
                            "featureType": "administrative",
                            "elementType": "labels.text.fill",
                            "stylers": [
                                {
                                    "color": "#444444"
                                }
                            ]
                        },
                            {
                                "featureType": "landscape",
                                "elementType": "all",
                                "stylers": [
                                    {
                                        "color": "#f2f2f2"
                                    }
                                ]
                            },
                            {
                                "featureType": "poi",
                                "elementType": "all",
                                "stylers": [
                                    {
                                        "visibility": "off"
                                    }
                                ]
                            },
                            {
                                "featureType": "poi.business",
                                "elementType": "geometry.fill",
                                "stylers": [
                                    {
                                        "visibility": "on"
                                    }
                                ]
                            },
                            {
                                "featureType": "road",
                                "elementType": "all",
                                "stylers": [
                                    {
                                        "saturation": -100
                                    },
                                    {
                                        "lightness": 45
                                    }
                                ]
                            },
                            {
                                "featureType": "road.highway",
                                "elementType": "all",
                                "stylers": [
                                    {
                                        "visibility": "simplified"
                                    }
                                ]
                            },
                            {
                                "featureType": "road.arterial",
                                "elementType": "labels.icon",
                                "stylers": [
                                    {
                                        "visibility": "off"
                                    }
                                ]
                            },
                            {
                                "featureType": "transit",
                                "elementType": "all",
                                "stylers": [
                                    {
                                        "visibility": "off"
                                    }
                                ]
                            },
                            {
                                "featureType": "water",
                                "elementType": "all",
                                "stylers": [
                                    {
                                        "color": "#b4d4e1"
                                    },
                                    {
                                        "visibility": "on"
                                    }
                                ]
                            }]
                    });
                    var image = 'images/gmap_marker.png';
                    var beachMarker = new google.maps.Marker({
                        position: {
                            lat: -33.8688, lng: 151.2195
                        },
                        map: map,
                        icon: image
                    });

                    var markers = [];

                    // Create the search box and link it to the UI element.
                    var input = document.getElementById('address');
                    var searchBox = new google.maps.places.SearchBox(input);
                    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

                    // Bias the SearchBox results towards current map's viewport.
                    map.addListener('bounds_changed', function () {
                        searchBox.setBounds(map.getBounds());
                    });

                    // [START region_getplaces]
                    // Listen for the event fired when the user selects a prediction and retrieve
                    // more details for that place.
                    searchBox.addListener('places_changed', function () {
                        var places = searchBox.getPlaces();
                        if (places.length == 0) {
                            return;
                        }
                        // Clear out the old markers.

                        for (i = 0; i < markers.length ; i++) {
                            markers[i].setMap(null);
                        }
                        markers = [];

                        // For each place, get the icon, name and location.
                        var bounds = new google.maps.LatLngBounds();

                        for (i = 0; i < places.length ; i++) {
                            var icon = {
                                url: places[i].icon,
                                size: new google.maps.Size(71, 71),
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(17, 34),
                                scaledSize: new google.maps.Size(25, 25)
                            };

                            // Create a marker for each place.
                            markers.push(new google.maps.Marker({
                                map: map,
                                icon: image,
                                title: places[i].name,
                                position: places[i].geometry.location
                            }));

                            if (places[i].geometry.viewport) {
                                // Only geocodes have viewport.
                                bounds.union(places[i].geometry.viewport);
                            } else {
                                bounds.extend(places[i].geometry.location);
                            }
                        }

                        map.fitBounds(bounds);
                    });

                    // [END region_getplaces]
                    // Trigger search on button click
                    $('trigger-search').on("click", function () {
                        var input = document.getElementById('address');
                        google.maps.event.trigger(input, 'focus');
                        google.maps.event.trigger(input, 'keydown', {
                            keyCode: 13
                        });
                    });

                });
    }



    /**
	 * @module       RD Timepicker
	 * @author       Aleksey Patsurkovskiy
	 * @version      1.0.2
	 * @license      MIT License
	 * @link         http://cms.devoffice.com/coding-demo/mnemon1k/rd-timepicker/demo/
	 */
    if (plugins.timePicker.length) {
        for (i = 0; i < plugins.timePicker.length; i++) {
            var timePickerItem = plugins.timePicker[i];
            $(timePickerItem).RDTimePicker();
        }
    }

    /**
	 * @module       Easy Responsive Tabs Plugin
	 * @author       Samson.Onna (samson3d@gmail.com)
	 * @license      MIT License
	 */
    if (plugins.responsiveTabs.length > 0) {
        for (i = 0; i < plugins.responsiveTabs.length; i++) {
            var responsiveTabsItem = $(plugins.responsiveTabs[i]);

            responsiveTabsItem.easyResponsiveTabs({
                type: responsiveTabsItem.attr("data-type") === "accordion" ? "accordion" : "default"
            });
        }
    }

    /**
	 * @module       RD Instafeed
	 * @author       Rafael Shayvolodyan(raffa)
	 * @see          https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version      1.0.1
	 * @License      under dual CC By-SA 4.0 and GPLv3
	 */
    if (plugins.instafeed.length > 0) {
        for (i = 0; i < plugins.instafeed.length; i++) {
            var instafeedItem = plugins.instafeed[i];
            $(instafeedItem).RDInstafeed({
            });
        }
    }

    /**
	 * @module       RD Twitter Feed
	 * @author       Rafael Shayvolodyan(raffa)
	 * @see          https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version      1.0.0
	 * @License      under dual CC By-SA 4.0 and GPLv3
	 */
    if (plugins.twitterfeed.length > 0) {
        for (i = 0; i < plugins.twitterfeed.length; i++) {
            var twitterfeedItem = plugins.twitterfeed[i];
            $(twitterfeedItem).RDTwitter({
            });
        }
    }

    /**
	 * @module       RD MaterialTabs
	 * @author       Rafael Shayvolodyan
	 * @see          https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version      1.0.2
	 * @License      under dual CC By-SA 4.0 and GPLv3
	 */
    if (plugins.materialTabs.length) {
        for (i = 0; i < plugins.materialTabs.length; i++) {
            var materialTabsItem = plugins.materialTabs[i];
            $(materialTabsItem).RDMaterialTabs({
            });
        }
    }

    /**
	 * @module       RD FacebookFeed
	 * @author       Rafael Shayvolodyan
	 * @see          https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version      1.0.0
	 */
    if (plugins.facebookfeed.length > 0) {
        for (i = 0; i < plugins.facebookfeed.length; i++) {
            var facebookfeedItem = plugins.facebookfeed[i];
            $(facebookfeedItem).RDFacebookFeed({
            });
        }
    }

    /**
	 * @module       Official Faceboock iframe
	 */
    if (plugins.facebookplugin.length) {
        for (i = 0; i < plugins.facebookplugin.length; i++) {

            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.5";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    }

    /**
	 * @module       RD Flickr Gallery
	 * @author       Rafael Shayvolodyan
	 * @see          https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version      1.0.0
	 * @License      under dual CC By-SA 4.0 and GPLv3
	 */
    if (plugins.flickrfeed.length > 0) {
        for (i = 0; i < plugins.flickrfeed.length; i++) {
            var flickrfeedItem = plugins.flickrfeed[i];
            $(flickrfeedItem).RDFlickr({
            });
        }
    }

    /**
	 * @module       RD SelectMenu
	 * @author       Evgeniy Gusarov
	 * @version      1.0.2
	 * @license      MIT License
	 * @link         http://cms.devoffice.com/coding-dev/rd-selectmenu/demo/
	 */
    if (plugins.dropdownSelect.length) {
        for (i = 0; i < plugins.dropdownSelect.length; i++) {
            var dropdownSelectItem = plugins.dropdownSelect[i];
            $(dropdownSelectItem).RDSelectMenu();
        }
    }

    /**
	 * @module       RD Toggles
	 * @author       Aleksey Patsurvkoskiy
	 * @version      0.2.1
	 * @license      MIT License
	 * @link         http://cms.devoffice.com/coding-demo/mnemon1k/rd-toggle/demo/
	 */
    if ($.length) {
        $.RDToggles();
    }

    /**
	 * @module       RD DatePicker
	 * @author       Evgeniy Gusarov
	 * @version      1.0.2
	 * @license      MIT License
	 * @link         http://cms.devoffice.com/coding-dev/rd-datepicker/demo/
	 */
    if (plugins.datePicker.length) {
        for (i = 0; i < plugins.datePicker.length; i++) {
            var datePickerItem = plugins.datePicker[i];
            $(datePickerItem).RDDatePicker();
        }
    }

    /**
	 * @module       RD Filepicker
	 * @author       Aleksey Patsurkovskiy
	 * @version      1.0.2
	 * @license      MIT License
	 * @link         http://cms.devoffice.com/coding-demo/mnemon1k/rd-filepicker/demo/
	 */
    if (plugins.filePicker.length || plugins.fileDrop.length) {
        for (i = 0; i < plugins.filePicker.length; i++) {
            var filePickerItem = plugins.filePicker[i];

            $(filePickerItem).RDFilepicker({
                metaFieldClass: "rd-file-picker-meta"
            });
        }

        for (i = 0; i < plugins.fileDrop.length; i++) {
            var fileDropItem = plugins.fileDrop[i];

            $(fileDropItem).RDFilepicker({
                metaFieldClass: "rd-file-drop-meta",
                buttonClass: "rd-file-drop-btn",
                dropZoneClass: "rd-file-drop"
            });
        }
    }

    /**
	 * @module       Popovers
	 * @author       Twitter, Inc.
	 * @version      2.0.1
	 * @link         https://gist.github.com/1930277
	 * @license      MIT License
	 */
    if (plugins.popover.length) {
        if (window.innerWidth < 767) {
            plugins.popover.attr('data-placement', 'bottom');
            plugins.popover.popover();
        }
        else {
            plugins.popover.popover();
        }
    }

    /**
	 * @module       Countdown
	 * @author       Keith Wood
	 * @see          http://keith-wood.name/countdown.html
	 * @license      MIT License
	 */
    if (plugins.countDown.length) {
        for (i = 0; i < plugins.countDown.length; i++) {
            var countDownItem = plugins.countDown[i],
                    d = new Date(),
                    type = countDownItem.getAttribute('data-type'),
                    time = countDownItem.getAttribute('data-time'),
                    format = countDownItem.getAttribute('data-format'),
                    settings = [];

            d.setTime(Date.parse(time)).toLocaleString();
            settings[type] = d;
            settings['format'] = format;
            $(countDownItem).countdown(settings);
        }
    }

    /**
	 * @module     TimeCircles
	 * @author     Wim Barelds
	 * @version    1.5.3
	 * @see        http://www.wimbarelds.nl/
	 * @license    MIT License
	 */
    if (plugins.dateCountdown.length) {
        for (i = 0; i < plugins.dateCountdown.length; i++) {
            var dateCountdownItem = $(plugins.dateCountdown[i]),
                    time = {
                        "Days": {
                            "text": "Days",
                            "color": "#FFF",
                            "show": true
                        },
                        "Hours": {
                            "text": "Hours",
                            "color": "#fff",
                            "show": true
                        },
                        "Minutes": {
                            "text": "Minutes",
                            "color": "#fff",
                            "show": true
                        },
                        "Seconds": {
                            "text": "Seconds",
                            "color": "#fff",
                            "show": true
                        }
                    };
            dateCountdownItem.TimeCircles({
            });
            $(window).on('load resize orientationchange', function () {
                if (window.innerWidth < 479) {
                    dateCountdownItem.TimeCircles({
                        time: {
                            Minutes: {
                                show: true
                            },
                            Seconds: {
                                show: false
                            }
                        }
                    }).rebuild();
                } else if (window.innerWidth < 767) {
                    dateCountdownItem.TimeCircles({
                        time: {
                            Seconds: {
                                show: false
                            }
                        }
                    }).rebuild();
                } else {
                    dateCountdownItem.TimeCircles({ time: time }).rebuild();
                }
            });
        }
    }

    /**
	 * @module      Buttons
	 * @author      Twitter, Inc.
	 * @version     3.3.6
	 * @link        https://github.com/twbs/bootstrap/blob/master/js/button.js
	 * @license     MIT License
	 */
    if (plugins.statefulButton.length) {
        $(plugins.statefulButton).on('click', function () {
            var statefulButtonLoading = $(this).button('loading');

            setTimeout(function () {
                statefulButtonLoading.button('reset')
            }, 2000);
        })
    }

    /**
	 * @module       RD Calendar
	 * @author       Evgeniy Gusarov
	 * @see          https://ua.linkedin.com/pub/evgeniy-gusarov/8a/a40/54a
	 * @version      1.0.0
	 */
    if (plugins.calendar.length) {
        for (i = 0; i < plugins.calendar.length; i++) {
            var calendarItem = $(plugins.calendar[i]);

            calendarItem.rdCalendar({
                days: calendarItem.attr("data-days") ? calendarItem.attr("data-days").split(/\s?,\s?/i) : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                month: calendarItem.attr("data-months") ? calendarItem.attr("data-months").split(/\s?,\s?/i) : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            });
        }
    }

    /**
	 * @module      ProgressBar.js
	 * @see         https://kimmobrunfeldt.github.io/progressbar.js
	 * @license:    MIT License
	 * @version     0.9.0
	 */
    if (plugins.progressBar.length) {
        var bar,
                type;
        for (i = 0; i < plugins.progressBar.length; i++) {
            var progressItem = plugins.progressBar[i];
            bar = null;
            if (
                    progressItem.className.indexOf("progress-bar-horizontal") > -1
            ) {
                type = 'Line';
            }

            if (
                    progressItem.className.indexOf("progress-bar-radial") > -1
            ) {
                type = 'Circle';
            }

            if (progressItem.getAttribute("data-stroke") && progressItem.getAttribute("data-value") && type) {
                bar = new ProgressBar[type](progressItem, {
                    strokeWidth: Math.round(parseFloat(progressItem.getAttribute("data-stroke")) / progressItem.offsetWidth * 100)
                    ,
                    trailWidth: progressItem.getAttribute("data-trail") ? Math.round(parseFloat(progressItem.getAttribute("data-trail")) / progressItem.offsetWidth * 100) : 0
                    ,
                    text: {
                        value: progressItem.getAttribute("data-counter") === "true" ? '0' : null
                        , className: 'progress-bar__body'
                        , style: null
                    }
                });
                bar.svg.setAttribute('preserveAspectRatio', "none meet");
                if (type === 'Line') {
                    bar.svg.setAttributeNS(null, "height", progressItem.getAttribute("data-stroke"));
                }

                bar.path.removeAttribute("stroke");
                bar.path.className.baseVal = "progress-bar__stroke";
                if (bar.trail) {
                    bar.trail.removeAttribute("stroke");
                    bar.trail.className.baseVal = "progress-bar__trail";
                }

                if (progressItem.getAttribute("data-easing") && !isIE) {
                    $(document)
                            .on("scroll", {
                                "barItem": bar
                            }, $.proxy(function (event) {
                                var bar = event.data.barItem;
                                if (isScrolledIntoView($(this)) && this.className.indexOf("progress-bar--animated") === -1) {
                                    this.className += " progress-bar--animated";
                                    bar.animate(parseInt(this.getAttribute("data-value")) / 100.0, {
                                        easing: this.getAttribute("data-easing")
                                        ,
                                        duration: this.getAttribute("data-duration") ? parseInt(this.getAttribute("data-duration")) : 800
                                        ,
                                        step: function (state, b) {
                                            if (b._container.className.indexOf("progress-bar-horizontal") > -1 ||
                                                    b._container.className.indexOf("progress-bar-vertical") > -1) {
                                                b.text.style.width = Math.abs(b.value() * 100).toFixed(0) + "%"
                                            }
                                            b.setText(Math.abs(b.value() * 100).toFixed(0));
                                        }
                                    });
                                }
                            }, progressItem))
                            .trigger("scroll");
                } else {
                    bar.set(parseInt(this.getAttribute("data-value")) / 100.0);
                    bar.setText(this.getAttribute("data-value"));
                    if (type === 'Line') {
                        bar.text.style.width = parseInt(this.getAttribute("data-value")) + "%";
                    }
                }
            } else {
                console.error(progressItem.className + ": progress bar type is not defined");
            }
        }
    }

    /**
	 * @module       UIToTop
	 * @author       Matt Varone
	 * @see          http://www.mattvarone.com/web-design/uitotop-jquery-plugin/
	 * @license      MIT License
	 */
    if (isDesktop) {
        $().UItoTop({
            easingType: 'easeOutQuart',
            containerClass: 'ui-to-top fa fa-angle-up'
        });
    }

    /**
	 * @module       RD Navbar
	 * @author       Evgeniy Gusarov
	 * @see          https://ua.linkedin.com/pub/evgeniy-gusarov/8a/a40/54a
	 * @version      2.1.3
	 */
    if (plugins.navbar.length) {
        plugins.navbar.RDNavbar({
            stickUpClone: plugins.navbar.data("stick-up-clone") || false,
            stickUpOffset: plugins.navbar.data("stick-up-offset") || 1
        });
    }

    /**
	 * @module      ViewPort Universal
	 * @description Add class in viewport
	 */
    if (plugins.viewAnimate.length) {
        for (i = 0; i < plugins.viewAnimate.length; i++) {
            var $view = $(plugins.viewAnimate[i]).not('.active');
            $document.on("scroll", $.proxy(function () {

                if (isScrolledIntoView(this)) {
                    this.addClass("active");
                }
            }, $view))
                    .trigger("scroll");
        }
    }

    /**
	 * @module       Swiper 3.1.7
	 * @description  Most modern mobile touch slider and framework with
	 *               hardware accelerated transitions
	 * @author       Vladimir Kharlampidi
	 * @see          http://www.idangero.us/swiper/
	 * @licesne      MIT License
	 */
    if (plugins.swiper.length) {
        for (i = 0; i < plugins.swiper.length; i++) {
            var s = $(plugins.swiper[i]);
            var pag = s.find(".swiper-pagination"),
                    next = s.find(".swiper-button-next"),
                    prev = s.find(".swiper-button-prev"),
                    bar = s.find(".swiper-scrollbar"),
                    parallax = s.parents('.rd-parallax').length,
                    swiperSlide = s.find(".swiper-slide");

            for (j = 0; j < swiperSlide.length; j++) {
                var $this = $(swiperSlide[j]),
                        url;

                if (url = $this.attr("data-slide-bg")) {
                    $this.css({
                        "background-image": "url(" + url + ")",
                        "background-size": "cover"
                    })
                }
            }

            swiperSlide.end()
                    .find("[data-caption-animate]")
                    .addClass("not-animated")
                    .end()
                    .swiper({
                        autoplay: s.attr('data-autoplay') ? s.attr('data-autoplay') === "false" ? undefined : s.attr('data-autoplay') : 5000,
                        direction: s.attr('data-direction') ? s.attr('data-direction') : "horizontal",
                        effect: s.attr('data-slide-effect') ? s.attr('data-slide-effect') : "slide",
                        speed: s.attr('data-slide-speed') ? s.attr('data-slide-speed') : 600,
                        keyboardControl: s.attr('data-keyboard') === "true",
                        mousewheelControl: s.attr('data-mousewheel') === "true",
                        mousewheelReleaseOnEdges: s.attr('data-mousewheel-release') === "true",
                        nextButton: next.length ? next.get(0) : null,
                        prevButton: prev.length ? prev.get(0) : null,
                        pagination: pag.length ? pag.get(0) : null,
                        paginationClickable: pag.length ? pag.attr("data-clickable") !== "false" : false,
                        paginationBulletRender: pag.length ? pag.attr("data-index-bullet") === "true" ? function (index, className) {
                            return '<span class="' + className + '">' + (index + 1) + '</span>';
                        } : null : null,
                        scrollbar: bar.length ? bar.get(0) : null,
                        scrollbarDraggable: bar.length ? bar.attr("data-draggable") !== "false" : true,
                        scrollbarHide: bar.length ? bar.attr("data-draggable") === "false" : false,
                        loop: s.attr('data-loop') !== "false",
                        onTransitionStart: function (swiper) {
                            toggleSwiperInnerVideos(swiper);
                        },
                        onTransitionEnd: function (swiper) {
                            toggleSwiperCaptionAnimation(swiper);
                        },
                        onInit: function (swiper) {
                            toggleSwiperInnerVideos(swiper);
                            toggleSwiperCaptionAnimation(swiper);
                            var swiperParalax = s.find(".swiper-parallax");

                            for (var k = 0; k < swiperParalax.length; k++) {
                                var $this = $(swiperParalax[k]),
                                        speed;

                                if (parallax && !isIEBrows && !isMobile) {
                                    if (speed = $this.attr("data-speed")) {
                                        makeParallax($this, speed, s, false);
                                    }
                                }
                            }
                            $(window).on('resize', function () {
                                swiper.update(true);
                            })
                        }
                    });

            $(window)
                    .on("resize", function () {
                        var mh = getSwiperHeight(s, "min-height"),
                                h = getSwiperHeight(s, "height");
                        if (h) {
                            s.css("height", mh ? mh > h ? mh : h : h);
                        }
                    })
                    .trigger("resize");
        }
    }

    /**
	 * @module       RD Video
	 * @author       Rafael Shayvolodyan
	 * @see          https://ua.linkedin.com/in/rafael-shayvolodyan-3a297b96
	 * @version      1.0.0
	 */
    if (plugins.video.length) {
        for (i = 0; i < plugins.video.length; i++) {
            var videoItem = plugins.video[i];
            $(videoItem).RDVideo({
            });
        }
    }

    /**
	 * @module       RD Parallax
	 * @author       Evgeniy Gusarov
	 * @see          https://ua.linkedin.com/pub/evgeniy-gusarov/8a/a40/54a
	 * @version      3.6.0
	 */
    if (plugins.parallax.length) {
        $.RDParallax();
        $("a[href='#']").on("click", function (event) {
            setTimeout(function () {
                $(window).trigger("resize");
            }, 300);
        });
    }

    /**
	 * @module       Search Plugin
	 * @version      1.0.0
	 * @author       Evgeniy Gusarov (Stmechanus | Diversant)
	 * @license      The MIT License (MIT)
	 */
    if (plugins.search.length) {
        plugins.search.RDSearch({
        });
    }

    /**
	 * @module       Slick carousel
	 * @version      1.5.9
	 * @author       Ken Wheeler
	 * @license      The MIT License (MIT)
	 */
    if (plugins.slick.length) {
        for (i = 0; i < plugins.slick.length; i++) {
            var $slickItem = $(plugins.slick[i]);

            $slickItem.slick({
            });
        }
    }

    /**
	 * @module       Owl carousel
	 * @version      2.0.0
	 * @author       Bartosz Wojciechowski
	 * @license      The MIT License (MIT)
	 */
    if (plugins.owl.length) {
        for (i = 0; i < plugins.owl.length; i++) {
            var c = $(plugins.owl[i]),
                    responsive = {
                    };

            var aliaces = ["-", "-xs-", "-sm-", "-md-", "-lg-"],
                    values = [0, 480, 768, 992, 1200],
                    j, k;

            for (j = 0; j < values.length; j++) {
                responsive[values[j]] = {
                };
                for (k = j; k >= -1; k--) {
                    if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
                        responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"));
                    }
                    if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
                        responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"));
                    }
                    if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
                        responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"));
                    }
                }
            }

            c.owlCarousel({
                autoplay: c.attr("data-autoplay") === "true",
                loop: c.attr("data-loop") !== "false",
                items: 1,
                dotsContainer: c.attr("data-pagination-class") || false,
                navContainer: c.attr("data-navigation-class") || false,
                mouseDrag: c.attr("data-mouse-drag") !== "false",
                nav: c.attr("data-nav") === "true",
                dots: c.attr("data-dots") === "true",
                dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each")) : false,
                responsive: responsive,
                navText: [],
                onInitialized: function () {
                    if ($.fn.magnificPopup) {
                        var o = this.$element.attr('data-lightbox') !== undefined && this.$element.attr("data-lightbox") !== "gallery",
                                g = this.$element.attr('data-lightbox') === "gallery";
                        if (o) {
                            for (var m = 0; m < (this.$element).length; m++) {
                                var $this = $(this.$element[m]);
                                $this.magnificPopup({
                                    type: $this.attr("data-lightbox"),
                                    callbacks: {
                                        open: function () {
                                            if (isTouch) {
                                                $document.on("touchmove", preventScroll);
                                                $document.swipe({
                                                    swipeDown: function () {
                                                        $.magnificPopup.close();
                                                    }
                                                });
                                            }
                                        },
                                        close: function () {
                                            if (isTouch) {
                                                $document.off("touchmove", preventScroll);
                                                $document.swipe("destroy");
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        if (g) {
                            for (var k = 0; k < (this.$element).length; k++) {
                                var $gallery = $(this.$element[k]).find('[data-lightbox]');
                                for (var j = 0; j < $gallery.length; j++) {
                                    var $item = $gallery[j];
                                    $item.addClass("mfp-" + $item.attr("data-lightbox"));
                                }
                                $gallery.end()
                                        .magnificPopup({
                                            delegate: '.owl-item [data-lightbox]',
                                            type: "image",
                                            gallery: {
                                                enabled: true
                                            },
                                            callbacks: {
                                                open: function () {
                                                    if (isTouch) {
                                                        $document.on("touchmove", preventScroll);
                                                        $document.swipe({
                                                            swipeDown: function () {
                                                                $.magnificPopup.close();
                                                            }
                                                        });
                                                    }
                                                },
                                                close: function () {
                                                    if (isTouch) {
                                                        $document.off("touchmove", preventScroll);
                                                        $document.swipe("destroy");
                                                    }
                                                }
                                            }
                                        });
                            }
                        }
                    }
                    if (c.attr("data-active")) {
                        c.trigger("to.owl.carousel", c.attr("data-active") - 1);
                    }
                }
            });
        }
    }

    /**
	 * @module     jQuery Count To
	 * @author     Matt Huggins
	 * @see        https://github.com/mhuggins/jquery-countTo
	 * @license    MIT License
	 */
    if (plugins.counter.length) {
        for (i = 0; i < plugins.counter.length; i++) {
            var counterNotAnimated = plugins.counter.not(".animated");

            $document.on("scroll", function () {
                for (i = 0; i < counterNotAnimated.length; i++) {
                    var counterNotAnimatedItem = $(counterNotAnimated[i]);
                    if ((!counterNotAnimatedItem.hasClass("animated")) && (isScrolledIntoView(counterNotAnimatedItem))) {
                        counterNotAnimatedItem.countTo({
                            refreshInterval: 40,
                            speed: counterNotAnimatedItem.attr("data-speed") || 1000
                        });
                        counterNotAnimatedItem.addClass('animated');
                    }
                }
            });
            $document.trigger("scroll");
        }
    }

    /**
	 * @module     Isotope PACKAGED
	 * @version v2.2.2
	 * @license GPLv3
	 * @see http://isotope.metafizzy.co
	 */
    if (plugins.isotope.length) {
        $(window).load(function () {
            if (plugins.isotope.length) {
                for (i = 0; i < plugins.isotope.length; i++) {
                    var isotopeItem = plugins.isotope[i]
                            , iso = new Isotope(isotopeItem, {
                                itemSelector: '[class*="col-"], .isotope-item',
                                layoutMode: isotopeItem.getAttribute('data-isotope-layout') ? isotopeItem.getAttribute('data-isotope-layout') : 'masonry'
                            });
                    iso.layout();
                    isotopeItem.className += " isotope--loaded";
                }
            }

            $('.btn-group-isotope .active').trigger('click');
        });
        $(".isotope-filters-trigger").on("click", function () {
            $(this).parents(".isotope-filters").toggleClass("active");
        });

        $('.isotope').magnificPopup({
            delegate: ' > :visible .thumb',
            type: "image",
            gallery: {
                enabled: true
            }
        });

        $("[data-isotope-filter]").on("click", function () {
            $('[data-isotope-filter][data-isotope-group="' + this.getAttribute("data-isotope-group") + '"]').removeClass("active");
            $(this).addClass("active");
            $(this).parents(".isotope-filters").removeClass("active");
            var iso = $('.isotope[data-isotope-group="' + this.getAttribute("data-isotope-group") + '"]');
            iso.isotope({
                itemSelector: '[class*="col-"], .isotope-item',
                layoutMode: iso.attr('data-isotope-layout') ? iso.attr('data-isotope-layout') : 'masonry',
                filter: this.getAttribute("data-isotope-filter") == '*' ? '*' : '[data-filter="' + this.getAttribute("data-isotope-filter") + '"]'
            })
        })
    }

    /**
	 * @module       WOW
	 * @author       Matthieu Aussaguel
	 * @license      MIT License
	 * @version      1.1.2
	 * @link         https://github.com/matthieua/WOW
	 */
    if (isDesktop && $html.hasClass("wow-animation") && $(".wow").length) {
        new WOW().init();
    }

    /**
	 * @module       Bootstrap tabs
	 * @author       Twitter, Inc.
	 * @license      MIT License
	 * @version      3.3.6
	 * @link         https://github.com/twbs/bootstrap/blob/master/js/tab.js
	 */
    if (plugins.navTabs.length) {
        for (i = 0; i < plugins.navTabs.length; i++) {
            var navTabsItem = $(plugins.navTabs[i]);

            navTabsItem.on("click", "a", function (event) {
                event.preventDefault();
                $(this).tab('show');
            });
        }
    }
    /**
	 * @module       jquery mousewheel plugin
	 * @description  Enables jquery mousewheel plugin
	 */
    if (plugins.scroller.length) {
        for (i = 0; i < plugins.scroller.length; i++) {
            var scrollerItem = $(plugins.scroller[i]);

            scrollerItem.mCustomScrollbar({
                scrollInertia: 200,
                scrollButtons: {
                    enable: true
                }
            });
        }
    }

    /**
	 * @module       Socialite v2
	 * @description  Enables Socialite v2 plugin
	 */
    if (plugins.socialite.length) {
        Socialite.load();
    }

    ///**
    // *Add class on Click at Search Form
    // */
    //$features.on("click", function (e) {
    //    var $listShare = $('ul.list-share');
    //
    //    $(this).toggleClass('active');
    //
    //    if ($listShare.is(":visible")) {
    //        $listShare.slideUp('slow');
    //    } else {
    //        $listShare.slideDown('slow');
    //    }
    //});

    if (plugins.twitter.length) {
        $(window).load(function () {
            // Define the style variables
            var $background_color = "#222222";
            var $background_color_2 = "#2B2B2B";
            var $padding = "0 15px";
            var $border_radius = "0px";

            // Apply the styles
            $("#twitter-widget-0, #twitter-widget-1").contents().find('head').append('<style> .timeline-TweetList-tweet{padding:' + $padding + '!important} .timeline-Widget{border-radius: ' + $border_radius + ' !important;} .timeline-TweetList-tweet:nth-child(odd){ background-color:' + $background_color_2 + ' !important} .timeline-TweetList-tweet:nth-child(even){ background-color:' + $background_color + ' !important} .timeline-Tweet:hover {background-color: inherit;} </style>');
        });

        window.twttr = (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
                    t = window.twttr || {
                    };
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.async = true;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function (f) {
                t._e.push(f);
            };

            return t;
        }(document, "script", "twitter-wjs"));
    }

});
function loading(text) {
    webcalloutCount--;
    if (webcalloutCount < 0) webcalloutCount = 0; // should never happen
    if (webcalloutCount == 0) {
        $(".loading-text").text(text);
        $(".loading-dialog").modal();
    }

}
function doneLoading() {
    webcalloutCount--;
    if (webcalloutCount < 0) webcalloutCount = 0; // should never happen
    if (webcalloutCount == 0) {
        $(".loading-dialog").modal("hide");
    }
}

function showMessage(text) {
    webcalloutCount--;
    if (webcalloutCount < 0) webcalloutCount = 0; // should never happen
    if (webcalloutCount == 0) {
        $(".message-text").text(text);
        $(".message-dialog").modal();
    }

}
function hideMessage() {
    webcalloutCount--;
    if (webcalloutCount < 0) webcalloutCount = 0; // should never happen
    if (webcalloutCount == 0) {
        $(".message-dialog").modal("hide");
    }
}

//4LL functions
function getUser() {

    var username = $("#username").val();
    var pass = $("#password").val();
    wallet.getPlayer(username, pass);
}
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
