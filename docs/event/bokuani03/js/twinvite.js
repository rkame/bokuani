var twvt = {};
twvt.attends = [
    {},
    { "bgcolor": "#009900", "mark": 'Yes' },
    { "bgcolor": "#000099", "mark": 'Maybe' },
    { "bgcolor": "#990000", "mark": 'No' },
    { "bgcolor": "#ffcc00", "mark": "&#xf005;" }
];

twvt.event = function (eventName, target, callback) {
    $.ajax({
        type: "post",
        url: "http://twvt.me/rsc/event",
        data: { "eventname": eventName, "format": "jsonp" },
        dataType: "jsonp",
        jsonpCallback: 'eventCallback',
        success: function (json) {
            if (json.ErrorMessage) {
                alert(json.ErrorMessage);
            } else {
                twvt.addEvent(target, json.Event);
                if (callback) {
                    callback();
                }
            }
        },
        error: function (e) {
            alert("読み込み失敗");
        }
    });
}
twvt.addEvent = function (target, event, attend, favorited) {
    target.append("<div>");
    var ec = $("div:last", target);
    ec.addClass("evcard");
    ec.addClass("event_" + event.Name);
    var coverImageUrl = event.CoverImage != "" ? event.CoverImage : "http://twvt.me/rsc/img/indexcover.jpg";
    ec.css("background-image", "url(" + coverImageUrl + ")");
    ec.append('<a href="http://twvt.me/' + event.Name + '"><div class="card-click"></div></a>');
    ec.append('<div class="evcard-body"></div>');
    ec.append('<a href="#"><div class="attendtri"></div></a>');
    ec.append('<a href="#"><div class="attend"></div></a>');
    var body = $(".evcard-body", ec);
    if (event.Attend != 0) {
        $(".attendtri", ec).css("background-color", twvt.attends[event.Attend].bgcolor);
        $(".attend", ec).html(twvt.attends[event.Attend].mark);
        if (event.Attend == 4) {
            $(".attend", ec).addClass("attend-Fav");
            $(".attend", ec).on("click", function (e) {twvt.deleteFavorite(event.Name, event.Title, target); e.preventDefault();});
            $(".attendtri", ec).on("click", function (e) { twvt.deleteFavorite(event.Name, event.Title, target); e.preventDefault(); });
        } else {
            $(".attend", ec).addClass("attend-" + twvt.attends[event.Attend].mark);
            $(".attend", ec).on("click", function (e) { twvt.deleteAttending(event.Name, event.Title, target); e.preventDefault(); });
            $(".attendtri", ec).on("click", function (e) { twvt.deleteAttending(event.Name, event.Title, target); e.preventDefault(); });
        }
        body.append('<h3>&nbsp;&nbsp;' + event.Title + "</h3>");
    } else {
        body.append('<h3>' + event.Title + "</h3>");
    }
    var sd = new Date(Number(event.StartDate.replace("/Date(", "").replace(")/", "")));
    var startDate = sd.getFullYear() + "/" + ("0" + (sd.getMonth() + 1)).slice(-2) + "/" + ("0" + sd.getDate()).slice(-2);
    var startTime = event.StartTime != "" && event.StartTime != "未定" ? " " + event.StartTime : "";
    var locationName = event.LocationName != "未定" ? "<br />" + '@<a target="_blank" class="location">' + event.LocationName + "</a>" : "";
    body.append('<p>' + startDate + startTime + locationName + '</p>');
    $("a", body).prop("href", "https://maps.google.co.jp/maps?q=" + event.Address1);
}
twvt.guests = function (eventName, target, attendings, callback) {
    if (!attendings) {
        attendings = ["Yes", "Maybe", "No"];
    }
    $.ajax({
        type: "post",
        url: "http://twvt.me/rsc/guests",
        data: { "eventname": eventName, "format": "jsonp" },
        dataType: "jsonp",
        jsonpCallback: 'guestsCallback',
        success: function (json) {
            if (json.ErrorMessage) {
                alert(json.ErrorMessage);
            } else {
                $("head").append('<link rel="stylesheet" type="text/css" href="http://twvt.me/rsc/css/twinvite.css">');
                for (var i = 0; i < attendings.length; i++) {
                    twvt.addGuests(target, json.Guests[attendings[i]], attendings[i]);
                }
                if (callback) {
                    callback();
                }
            }
        },
        error: function (e) {
            alert("読み込み失敗");
        }
    });
}
twvt.addGuests = function (target, guests, label) {
    target.append("<div>");
    var gc = $("div:last", target);
    gc.addClass("guest-container");
    gc.append('<div class="guests-label"><span class="' + label + '"></span></div>');
    $("span:last", gc).addClass(label);
    $("span:last", gc).text(" " + label + " (" + guests.length.toString() + ")");
    gc.append('<ul class="' + label + '">');
    for (var i = 0; i < guests.length; i++) {
        $("ul", gc).append('<li><a target="_blank"><img><br><span></span></a></li>');        $("li:last", gc).prop("id", "attend_" + guests[i].UserId);
        $("a:last", gc).prop("href", "https://twitter.com/" + guests[i].ScreenName);
        $("img:last", gc).prop("src", "http://twvt.me/rsc/usericon/" + guests[i].UserId + ".png");
        $("span:last", gc).text(guests[i].ScreenName);
    }
}
twvt.appendGuest = function (guest, attending) {
    var attendings = ["", "Yes", "Maybe", "No"];
    var label = attendings[attending];
    $("#attend_" + guest.userId).remove();
    $("ul." + label).append('<li><a target="_blank"><img><br><span></span></a></li>');
    $("li:last", "ul." + label).prop("id", "attend_" + guest.userId);
    $("a:last", "ul." + label).prop("href", "https://twitter.com/" + guest.screenName);
    $("img:last", "ul." + label).prop("src", "http://twvt.me/rsc/usericon/" + guest.userId + ".png");
    $("span:last", "ul." + label).text(guest.screenName);
    for (var i = 1; i < attendings.length; i++) {
        $("span." + attendings[i], ".guests-label").text(" " + attendings[i] + "(" + $("li", "ul." + attendings[i]).length.toString() + ")");
    }
}
twvt.deleteAttending = function (eventName, eventTitle, target) {
    var msg = eventTitle + "の参加表明を削除します。よろしいですか？";
    confirmDialog(msg, "確認", "削除", "キャンセル", function () {
        var joindata = {};
        joindata.Name = eventName;
        joindata.Attend = 9;
        $.ajax({
            type: "post",
            url: "http://twvt.me/rsc/join",
            data: JSON.stringify(joindata),
            contentType: "application/json",
            dataType: "json",
            success: function (json) {
                if (json.ErrorMessage) {
                    alert(json.ErrorMessage);
                } else {
                    $(".event_" + eventName, target).remove();
                }
            },
            error: function (e) {
                alert("通信またはサーバーでエラーが発生しました。参加取り消しは完了していません");
            },
            complete: function () {
            }
        });
    })
}
twvt.deleteFavorite = function (eventName, eventTitle, target) {
    var msg = eventTitle + "を非表示にします。よろしいですか？";
    confirmDialog(msg, "確認", "非表示", "キャンセル", function () {
        var joindata = {};
        joindata.Name = eventName;
        $.ajax({
            type: "post",
            url: "http://twvt.me/rsc/deletefavorite",
            data: JSON.stringify(joindata),
            contentType: "application/json",
            dataType: "json",
            success: function (json) {
                if (json.ErrorMessage) {
                    alert(json.ErrorMessage);
                } else {
                    $(".event_" + eventName, target).remove();
                }
            },
            error: function (e) {
                alert("通信またはサーバーでエラーが発生しました。参加取り消しは完了していません");
            },
            complete: function () {
            }
        });
    })
}
