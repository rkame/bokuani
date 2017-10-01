
function preventInnerHref() {
    $("a").on("click", function (e) {
        if (this.hash.indexOf("#") != -1) {
            e.preventDefault();
            var targetOffset = $("#section-" + this.hash.substr(1)).offset().top - 50;
            $("html,body").animate({ scrollTop: targetOffset }, "fast");
        } else if (this.href.slice(-1) == "#") {
            e.preventDefault();
        }
    });
}

function twcount() {
    //var max = $("#attendShareImage").css("display") == "none" ? 140 : 116;
    var max = 140;
    $("#shareBody").val().length;
    var c = max - twttr.txt.getTweetLength($("#shareBody").val());
    $("#twcounter").text(c);
    if (c < 0) {
        $("#twcounter").removeClass("twcount-valid");
        $("#twcounter").addClass("twcount-over");
        $("#attendShareButton").prop("disabled", true);
        $("#attendShareButton").addClass("disabled");
    } else {
        $("#twcounter").removeClass("twcount-over");
        $("#attendShareButton").prop("disabled", false);
        $("#attendShareButton").removeClass("disabled");
        $("#twcounter").addClass("twcount-valid");
    }
}

function initEditor() {
    $(".btn-share").addClass("disabled");
    $('#contentBodyEditor').summernote({
        height: 300,
        fontNames: ["YuGothic", "Yu Gothic", "Hiragino Kaku Gothic Pro", "Meiryo", "sans-serif", "Arial", "Arial Black", "Comic Sans MS", "Courier New", "Helvetica Neue", "Helvetica", "Impact", "Lucida Grande", "Tahoma", "Times New Roman", "Verdana"],
        fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '40', '48', '56', '64', '72'],
        lang: "ja-JP",
        callbacks: {
            onImageUpload: function (files) {
                uploadImage(files[0]);
            },
            onChange: function () {
                fc = true;
            }
        },
        toolbar: [
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'picture', 'video', 'table']],
            ['misc', ['fullscreen', 'codeview', 'undo', 'redo']],
        ],
        placeholder: "本文を入力。20分でタイムアウトするためこまめに保存してください"
    });
    $('#contentBodyEditor').summernote('code', bodyhtml);
    $('input').on('change', function () {
        fc = true;
    });
    $('#bgimagepicker').on("change", function (e) {
        var file = this.files[0];
        var formData = new FormData();
        formData.append("file", file);
        $.ajax({
            data: formData,
            type: "POST",
            url: "/rsc/upload",
            dataType: "json",
            cache: false,
            contentType: false,
            processData: false,
            success: function (json) {
                if (json.ErrorMessage != "") {
                    alert(json.ErrorMessage);
                } else {
                    $("body").css("background-image", "url('" + json.UploadedUrl + "')");
                    $("#bgpreview").css("background-image", "url('" + json.UploadedUrl + "')");
                }
            },
            error: function (e) {
                alert("通信またはサーバーでエラーが発生しました。画像はアップロードされていません");
            },
            complete: function () {
            }
        });
    });
    $('.colorpicker').each(function () {
        $(this).minicolors({
            control: $(this).attr('data-control') || 'hue',
            defaultValue: $(this).attr('data-defaultValue') || '',
            format: $(this).attr('data-format') || 'hex',
            keywords: $(this).attr('data-keywords') || '',
            inline: $(this).attr('data-inline') === 'true',
            letterCase: $(this).attr('data-letterCase') || 'lowercase',
            opacity: $(this).attr('data-opacity'),
            position: $(this).attr('data-position') || 'bottom left',
            swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
            change: function (value, opacity) {
                if (!value) return;
                if (this.id == "bgcolorpicker") {
                    $("body").css("background-color", value);
                } else if (this.id == "sidecolorpicker") {
                    $(".section-guests").css("background-color", value);
                }
            },
            theme: 'bootstrap'
        });
    });
    $("#jsonpicker").on("change", function (e) {
        var reader = new FileReader();
        reader.readAsText(this.files[0], "utf-8");
        reader.onload = function (evt) {
            var json = $.parseJSON(evt.target.result)
            importJson(json.Event);
            $("#fileDialog").modal("hide");
        }
        reader.onerror = function (evt) {
            alert("バックアップデータの読み込みに失敗しました：" + evt.target.error.code);
        }
    });

    var localBackup = localStorage.getItem("backup_" + $("#EventId").val());
    if (localBackup) {
        var j = JSON.parse(localBackup);
        if (j.Id && j.Id != "") {
            confirmDialog("未保存の下書きがあります。編集を再開しますか？", "確認", "下書きの編集を再開", "下書きを破棄",
                function () {
                    loadLocal($("#EventId").val());
                    localStorage.removeItem("backup_" + $("#EventId").val());
                },
                function () {
                    localStorage.removeItem("backup_" + $("#EventId").val());
            });
        }
    }

    fc = false;
}

function shareService() {
    var sharebody = "twinvite - イベント告知・参加表明サービス。専用URL、REST API、アクセス解析など多彩な機能をシンプルなUIで。 http://twvt.me/ #twvt";
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(sharebody));
}
function shareCheckout(IsAuthorized, hasImage) {
    var sharebody = "Check out" + shareBodyBase + " ";
    if (IsAuthorized) {
        $("#shareBody").val(sharebody);
        if (hasImage) {
            $("#attendShareImage").css("display", "");
        }
        twcount();
        $("#div-modal").modal("show");
    } else {
        window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(sharebody));
    }
}
function share() {
    var sharedata = {};
    sharedata.Body = $("#shareBody").val();
    sharedata.Image = $("#attendShareImage").css("display") != "none" ? $("#attendShareImage").css("background-image") : "";
    $.ajax({
        type: "post",
        url: "./rsc/share",
        data: JSON.stringify(sharedata),
        contentType: "application/json",
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                alert(json.ErrorMessage);
            }
        },
        error: function (e) {
            alert("通信またはサーバーでエラーが発生したためツイートできませんでした");
        }
    });
    $("#div-modal").modal("hide");
    $("#shareBody").val("");
}

function deleteAttending(eventName) {
    var msg = $("h3", "." + eventName + ":first").text() + "の参加表明を削除します。よろしいですか？";
    confirmDialog(msg, "確認", "削除", "キャンセル", function () {
        var joindata = {};
        joindata.Name = eventName;
        joindata.Attend = 9;
        $.ajax({
            type: "post",
            url: "./rsc/join",
            data: JSON.stringify(joindata),
            contentType: "application/json",
            dataType: "json",
            success: function (json) {
                if (json.ErrorMessage) {
                    alert(json.ErrorMessage);
                } else {
                    $("." + eventName).remove();
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

function removeAttending(eventname, IsAuthorized) {
    if (!IsAuthorized) {
        var msg = "参加表明を削除する前にサインイン（ツイッターのアプリ連携）してください。今すぐサインインしますか？";
        confirmDialog(msg, "確認", "サインイン", "キャンセル", function () {
            window.location.href = signinUrl;
        })
        return;
    }

    confirmDialog("このイベントの参加表明を取り消します。よろしいですか？", "参加表明の取り消し", "参加表明の取り消し", "キャンセル", function () {
        var joindata = {};
        joindata.Name = eventname;
        joindata.Attend = 9;
        joindata.GuestScreenName = "";
        $.ajax({
            type: "post",
            url: "./rsc/join",
            data: JSON.stringify(joindata),
            contentType: "application/json",
            dataType: "json",
            success: function (json) {
                if (json.ErrorMessage) {
                    alert(json.ErrorMessage);
                } else {
                    twvt.appendGuest(json, 9);
                }
            },
            error: function (e) {
                alert("通信またはサーバーでエラーが発生しました。参加は完了していません");
            },
            complete: function () {
            }
        });
    })
}

function updateAttending(attend, eventname, IsAuthorized, hasImage, guestname) {
    if (!IsAuthorized) {
        var msg = "参加表明する前にサインイン（ツイッターのアプリ連携）してください。今すぐサインインしますか？";
        confirmDialog(msg, "確認", "サインイン", "キャンセル", function () {
            window.location.href = signinUrl;
        })
        return;
    }
    var joindata = {};
    joindata.Name = eventname;
    joindata.Attend = attend;
    joindata.GuestScreenName = guestname ? guestname : "";
    $.ajax({
        type: "post",
        url: "./rsc/join",
        data: JSON.stringify(joindata),
        contentType: "application/json",
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                alert(json.ErrorMessage);
            } else {
                twvt.appendGuest(json, attend);
                if (guestname != "") {
                    $("#shareBody").val("Join me at" + shareBodyBase + " ");
                    if (hasImage) {
                        $("#attendShareImage").css("display", "");
                    }
                    twcount();
                    $("#div-modal").modal("show");
                } else {
                    $("#guestName").val("");
                }
            }
        },
        error: function (e) {
            alert("通信またはサーバーでエラーが発生しました。参加は完了していません");
        },
        complete: function () {
        }
    });
}

function manageAttending(attend, eventname, guestname) {
    if (guestname && guestname != "") {
        if (attend == 9) {
            confirmDialog("Are you sure to remove @" + guestname + " from the guest list?", "Confirmation", "Remove", "Cancel", function () {
                updateAttending(attend, eventname, true, false, guestname);
            });
        } else {
            updateAttending(attend, eventname, true, false, guestname);
        }
    }
}


function showMyAttendings(target, showall, callback) {
    $("#loading_attend").css("display", "block");
    var reqdata = {};
    reqdata.include_body = "false";
    if (showall) {
        reqdata.all = "true";
    }
    $.ajax({
        type: "post",
        url: "http://twvt.me/rsc/myattendings",
        data: reqdata,
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                target.prepend('※認証がタイムアウトしました');
            } else {
                if (json.Events.length == 0) {
                    $("#noevents").css("display", "block");
                } else {
                    $("#noevents").css("display", "none");
                    for (var i = 0; i < json.Events.length; i++) {
                        twvt.addEvent(target, json.Events[i]);
                    }
                }
            }
            $("#loading_attend").css("display", "none");
            if (callback) {
                callback();
            }
        },
        error: function (e) {
            alert("読み込み失敗");
            $("#loading_attend").css("display", "none");
        },
    });
}

function showFavorites(target) {
    $("#loading_favorite").css("display", "block");
    var reqdata = {};
    $.ajax({
        type: "post",
        url: "http://twvt.me/rsc/favorites",
        data: reqdata,
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                target.prepend('<div style="text-align:center;width:100%;"><p>※' + json.ErrorMessage + '</p></div>');
            }
            if (json.ErrorMessage && json.ErrorMessage.indexOf("Twitter") < 0) {
            } else {
                if (json.Events.length > 0) {
                    $("#nofavorites").css("display", "none");
                    for (var i = 0; i < json.Events.length; i++) {
                        if ($(".event_" + json.Events[i].Name, $("#MyAttendings")).length < 1) {
                            twvt.addEvent(target, json.Events[i]);
                        }
                    }
                } else {
                    $("#nofavorites").css("display", "block");
                }
            }
            $("#loading_favorite").css("display", "none");
        },
        error: function (e) {
            alert("読み込み失敗");
            $("#loading_favorite").css("display", "none");
        }
    });
}


function showMyInvitations(target, showall) {
    $("#loading_invitation").css("display", "block");
    var reqdata = {};
    reqdata.include_body = "false";
    if (showall) {
        reqdata.all = "true";
    }
    $.ajax({
        type: "post",
        url: "http://twvt.me/rsc/myinvitations",
        data: reqdata,
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                target.prepend('※認証がタイムアウトしました');
            } else {
                if (json.Events.length == 0) {
                    $("#noinvitations").css("display", "block");
                } else {
                    $("#noinvitations").css("display", "none");
                    for (var i = 0; i < json.Events.length; i++) {
                        twvt.addEvent(target, json.Events[i]);
                        $(".event_" + json.Events[i].Name, target).append('<div class="btn-container"></div>');
                        var bc = $(".btn-container", ".event_" + json.Events[i].Name, target);
                        bc.append('<a class="btn btn-default btn-views" style="margin-left:8px;"><span style="font-family:fontawesome;font-size:95%;">&#xf06e;</span> <span></span></a>');
                        bc.append('<a class="btn btn-default btn-guests" style="margin-left:8px;"><span style="font-family:fontawesome;font-size:95%;">&#xf118;</span> <span></span></a>');
                        bc.append('<a class="btn btn-default btn-edit" style="margin-left:8px;"><span style="font-family:fontawesome;font-size:95%;">&#xf044;</span> Edit</a>');
                        bc.css("z-index", "99");
                        bc.css("position", "absolute");
                        bc.css("bottom", "4px");
                        $(".btn-views span:last", bc).text(json.Views[json.Events[i].Id]);
                        $(".btn-guests span:last", bc).text(json.Events[i].Guests.Yes.length.toString());
                        $(".btn-views", bc).prop("href", "./rsc/access?format=html&eventname=" + json.Events[i].Name);
                        $(".btn-guests", bc).prop("href", "./rsc/guests?format=html&eventname=" + json.Events[i].Name);
                        $(".btn-edit", bc).prop("href", "./" + json.Events[i].Name + "?edit=1");
                    }
                }
            }
            $("#loading_invitation").css("display", "none");
        },
        error: function (e) {
            alert("読み込み失敗");
            $("#loading_invitation").css("display", "none");
        }
    });
}

function showEvent() {
    removeUrlError();
    var req = $("#urlquery").val();
    if (req == "") {
        return;
    }
    $.ajax({
        type: "post",
        url: "http://twvt.me/rsc/event",
        data: { "eventname": req, "include_body": "false" },
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                $("#urlquery_message").text(json.ErrorMessage);
                $("#urlquery").css("border-color", "#ff3333");
            } else {
                window.location.href
                location.href = "./" + json.Event.Name;
            }
        },
        error: function (e) {
        }
    });
}

function removeUrlError() {
    $("#urlquery").css("border-color", "#dee1e5");
    $("#urlquery_message").text("　");
}


function setBackgroundRepeat(repeat)
{
    if (repeat) {
        $("body").css("background-size", "auto");
    }else{
        $("body").css("background-size", "cover");
    }
}
function setBackgroundScroll(scroll){
    if(scroll){
        $("body").css("background-attachment", "scroll");
    }else{
        $("body").css("background-attachment", "fixed");
    }
}
function importJson(json) {
    $("#Name").val(json.Name);
    $("#Title").val(json.Title);
    $("#Hashtag").val(json.Hashtag);
    $("#contentBodyEditor").summernote("code", json.Body);
    if (json.StartDate.indexOf("/Date(") === 0) {
        var sd = new Date(Number(json.StartDate.replace("/Date(", "").replace(")/", "")));
        $("#StartDate").val(sd.getFullYear() + "/" + ("0" + (sd.getMonth() + 1)).slice(-2) + "/" + ("0" + sd.getDate()).slice(-2));
    } else {
        $("#StartDate").val(json.StartDate);
    }
    $("#StartTime").val(json.StartTime);
    $("#DateDesc").val(json.DateDesc);
    $("#LocationName").val(json.LocationName);
    $("#Address1").val(json.Address1);
    $("#Address2").val(json.Address2);
    $("#LocationDesc").val(json.LocationDesc);
    $("#Capacity").val(json.Capacity);
    $("#bgcolorpicker").val(json.BGColor);
    $("#sidecolorpicker").val(json.SBColor);
    $(".minicolors-input").trigger("paste.minicolors");
    $("#bgpreview").css("background-image", json.BGImage);
    $("body").css("background-image", json.BGImage);
    $("#BGRepeat").prop("checked", json.BGRepeat == 1 ? "checked" : "");
    $("#BGScroll").prop("checked", json.BGScroll == 1 ? "checked" : "");
}

function saveLocal(eventId) {
    var json = formToJson();
    var jsonString = JSON.stringify(json);
    localStorage.setItem("backup_" + eventId, jsonString);
}

function loadLocal(eventId) {
    var jsonString = localStorage.getItem("backup_" + eventId);
    var json = JSON.parse(jsonString);
    importJson(json);
}

function formToJson() {
    var json = {};
    json.Id = $("#EventId").val();
    json.Name = $("#Name").val();
    json.Title = $("#Title").val();
    json.Hashtag = $("#Hashtag").val();
    json.StartTime = $("#StartTime").val();
    json.DateDesc = $("#DateDesc").val();
    json.LocationName = $("#LocationName").val();
    json.Address1 = $("#Address1").val();
    json.Address2 = $("#Address2").val();
    json.LocationDesc = $("#LocationDesc").val();
    json.Capacity = $("#Capacity").val();
    json.BGColor = $("#bgcolorpicker").val();
    json.SBColor = $("#sidecolorpicker").val();
    json.Body = $("#contentBodyEditor").summernote("code");
    json.StartDate = $("#StartDate").val();
    json.BGImage = $("#bgpreview").css("background-image");
    json.BGRepeat = $("#BGRepeat").prop("checked") ? 1 : 0;
    json.BGScroll = $("#BGScroll").prop("checked") ? 1 : 0;
    return json;
}

function uploadImage(file) {
    var formData = new FormData();
    formData.append("file", file);
    $.ajax({
        data: formData,
        type: "POST",
        url: "/rsc/upload",
        dataType: "json",
        cache: false,
        contentType: false,
        processData: false,
        success: function(json) {
            if(json.ErrorMessage != ""){
                alert(json.ErrorMessage);
            }else{
                var img = document.createElement("img");
                img.src = json.UploadedUrl;
                $('#contentBodyEditor').summernote('insertNode', img);
            }
        },
        error: function(e) {
            alert("通信またはサーバーでエラーが発生しました。画像はアップロードされていません");
        },
        complete: function() {
        }
    });
}
function update(currentEventName) {
    $("input.form-control").blur();
    if ($("input.invalid").length > 0) {
        alert("送信できません。エラーを訂正してください");
        return;
    }
    $("#savebutton").addClass("disabled");
    $("#savebutton").prop("disabled", true);
    var coverImage = $("img:not(.no-cover):first", ".note-editable");
    var coverImageUrl = coverImage.prop("src") ? coverImage.prop("src") : "";
    var eventdata = {
        Id: $("#EventId").val(),
        Name: $("#Name").val(),
        Title: $("#Title").val(),
        Hashtag: $("#Hashtag").val(),
        HostId: $("#HostId").val(),
        HostName: $("#HostName").val(),
        Body: $('#contentBodyEditor').summernote("code"),
        Publish: $("#Publish").prop("checked") ? "1" : "",
        StartDate: $("#StartDate").val(),
        StartTime: $("#StartTime").val(),
        DateDesc: $("#DateDesc").val(),
        LocationName: $("#LocationName").val(),
        Address1: $("#Address1").val(),
        Address2: $("#Address2").val(),
        LocationDesc: $("#LocationDesc").val(),
        Capacity: $("#Capacity").val(),
        Joinable: $("#Joinable").prop("checked") ? "1" : "",
        CoverImage: coverImageUrl,
        BGColor: $("#bgcolorpicker").val(),
        SBColor: $("#sidecolorpicker").val(),
        BGImage: $("#bgpreview").css("background-image").replace(/\"/g, ""),
        BGRepeat: $("#BGRepeat").prop("checked") ? "1" : "0",
        BGScroll: $("#BGScroll").prop("checked") ? "1" : "0",
    };
    $.ajax({
        type: "post",
        url: "./rsc/update",
        data: encodeURIComponent(JSON.stringify(eventdata)),
        contentType: "application/json",
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                if (json.ErrorMessage == "更新するにはサインインしてください。※入力内容は破棄されます") {
                    confirmDialog("サインインの有効期限が切れているため保存できません。下書きに保存しますか？編集内容をこのPCに保存して、あとで復元することができます", "確認", "下書きを保存", "キャンセル", function () {
                        saveLocal($("#EventId").val());
                        alertDialog("下書きに保存しました。サインインしてから再度このイベントの編集画面を開いてください");
                    });
                } else {
                    alert(json.ErrorMessage);
                }
            } else {
                $("#UpdateDate").text("更新 " + json.UpdateDate);
                alertDialog("保存しました", $("#Name").val() != currentEventName ? function () {
                    window.location.href = "./" + $("#Name").val() + "?edit=1";
                } : null);
            }
        },
        error: function(e) {
            alert("通信またはサーバーでエラーが発生しました。この内容は保存されていません");
        },
        complete: function() {
            $("#savebutton").prop("disabled", false);
            $("#savebutton").removeClass("disabled");
            fc = false;
        }
    });
}
function cancel(currentEventName) {
    if(fc){
        var msg = "内容を保存せずにトップページに戻ります。よろしいですか？";
        if (currentEventName) {
            msg = "内容を保存せずにイベントページに戻ります。よろしいですか？";
        }
        confirmDialog(msg, "確認", "Yes", "キャンセル", function () {
            window.location.href = "./" + currentEventName;
        })
    }else{
        window.location.href = "./" + currentEventName;
        }
    }

function deleteevent() {
    var msg = "イベントを削除します。この操作は取り消せません。よろしいですか？";
    confirmDialog(msg, "確認", "イベントを削除", "キャンセル", function () {
        var eventdata = {
            Id: $("#EventId").val(),
        };
        $.ajax({
            type: "post",
            url: "./rsc/delete",
            data: encodeURIComponent(JSON.stringify(eventdata)),
            contentType: "application/json",
            dataType: "json",
            success: function (json) {
                if (json.ErrorMessage) {
                    alert(json.ErrorMessage);
                } else {
                    alertDialog("削除しました");
                    window.location.href = "./";
                }
            },
            error: function (e) {
                alert("通信またはサーバーでエラーが発生しました。この内容は保存されていません");
            }
        });
    })
}
function validateForm(element, max, min, format, hasParent) {
    var errmsg = validate(element.value, max, min, format);
    setError(element, errmsg, hasParent);
    if(format == "twvturl" && !errmsg){
        checkUrl(element);
    }
}
function validate(val, max, min, format) {
    if (!val) {
        if (min > 0) {
            return "入力してください";
            } else {
            return "";
            }
            }
    if (val.length > max) {
        return max + "文字以内で入力してください";
        }
    if (val.length < min) {
        return min + "文字以上で入力してください";
        }
    if (format == "date") {
        try {
            var d = new Date(val);
            if (d == "Invalid Date") {
                return "日付の形式が不正です";
            }
        } catch (e) {
            return "日付の形式が不正です";
        }
    } else if (format == "twvturl") {
        if (val.match(/[^A-Za-z0-9_]+/)) {
            return "半角英数字とアンダーバー以外は使用できません";
        }
    } else if (format == "number") {
        if (val.match(/[^0-9]/g)) {
            return "数値を入力してください";
        }
    }
    return "";
}
function checkUrl(element){
    var d = {};
    d.Name = $(element).val();
    d.Id = $(element).data("eventid");
    $.ajax({
        type: "post",
        url: "./rsc/checkurl",
        data: JSON.stringify(d),
        contentType: "application/json",
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                setError(element, json.ErrorMessage, true)
            } else {
                setError(element, "", true)
            }
        },
        error: function (e) {
            setError(element, "URL確認のための通信でエラーが発生しました", true)
        }
    });
}
function setError(element, errmsg, hasParent){
    if ($("#" + element.id + "Error")) {
        $("#" + element.id + "Error").remove();
        }
    if (errmsg) {
        $("#" + element.id).addClass("invalid");
        if (hasParent) {
            $("#" + element.id).parent().after($(".invalid", "#templates").clone().prop("id", element.id + "Error").text(errmsg));
        } else {
            $("#" + element.id).after($(".invalid", "#templates").clone().prop("id", element.id + "Error").text(errmsg));
        }
    } else {
        $("#" + element.id).removeClass("invalid");
    }
}

function signout() {
    confirmDialog("サインアウトします。よろしいですか？", "サインアウト", "サインアウト", "キャンセル", function () {
        window.location.href = "http://twvt.me/rsc/signout";
    })
}
function confirmDialog(msg, title, yescaption, nocaption, callback, cancelcallback) {
    $(".modal-title", "#confirmDialog").text(title);
    $(".btn-yes", "#confirmDialog").text(yescaption);
    $(".btn-no", "#confirmDialog").text(nocaption);
    $(".recipient", "#confirmDialog").text(msg);
    $(".btn-yes").off("click.confirm");
    $(".btn-yes", "#confirmDialog").on("click.confirm", function () {
        callback();
    });
    $(".btn-no").off("click.confirm");
    $(".btn-no", "#confirmDialog").on("click.confirm", function () {
        if (cancelcallback) {
            cancelcallback();
        }
    });
    $("#confirmDialog").modal();
}
function alertDialog(msg, callback) {
    $(".recipient", "#alertDialog").text(msg);
    $(".btn-alertok").off("click.alert");
    if (callback) {
        $(".btn-alertok", "#alertDialog").on("click.alert", function () {
            callback();
        });
        $("#alertDialog").data("backdrop", "static");
    } else {
        $("#alertDialog").data("backdrop", "true");
    }
    $("#alertDialog").modal();
}

function captureExternal(eventName, serviceName) {
    var d = {};
    d.eventname = eventName;
    d.target = serviceName;
    $.ajax({
        type: "post",
        url: "./rsc/external",
        data: d,
        dataType: "json",
        success: function (res) {
            if (res.ErrorMessage) {
                alert(res.ErrorMessage);
            } else {
                var json = res.Event;
                $("#Title").val(json.Title);
                $("#contentBodyEditor").summernote("code", json.Body);
                $("#StartTime").val(json.StartTime);
                if (json.LocationName != "") {
                    $("#LocationName").val(json.LocationName);
                }
                if (json.Address1 != "") {
                    $("#Address1").val(json.Address1);
                }
            }
        },
        error: function (e) {
            alert("データ取得元のサーバーが応答しないか、通信エラーが発生しました");
        }
    });
}

function drawChart(eventname, target) {
    $.ajax({
        type: "post",
        url: "./access",
        data: { "format": "chartdata", "eventname": eventname },
        dataType: "json",
        success: function (json) {
            if (json.ErrorMessage) {
                alert(json.ErrorMessage);
            } else {
                target.highcharts({
                    data: {
                        csv: json
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        tickInterval: 24 * 3600 * 1000,
                        tickWidth: 0,
                        gridLineWidth: 1,
                        labels: {
                            align: 'left',
                            x: 3,
                            y: -3
                        }
                    },
                    yAxis: [{
                        title: {
                            text: 'Views'
                        },
                        labels: {
                            align: 'left',
                            x: 3,
                            y: 16,
                            format: '{value:.,0f}'
                        },
                        allowDecimals: false,
                    }, {
                        opposite: true,
                        title: {
                            text: 'Attendings'
                        },
                        labels: {
                            align: 'right',
                            x: -3,
                            y: 16,
                            format: '{value:.,0f}'
                        },
                        id: 'joinaxis',
                        allowDecimals: false,
                    }],

                    legend: {
                        reversed: true,
                    },

                    tooltip: {
                        shared: false,
                    },

                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                                style: {
                                    textShadow: '0 0 3px black'
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'line',
                        name: 'View',
                        index: 10,
                    }, {
                        type: 'column',
                        name: 'Yes',
                        yAxis: 'joinaxis',
                        index: 3,
                        color: '#009900',
                    }, {
                        type: 'column',
                        name: 'Maybe',
                        yAxis: 'joinaxis',
                        index: 2,
                        color: '#000099',
                    }, {
                        type: 'column',
                        name: 'No',
                        yAxis: 'joinaxis',
                        index: 1,
                        color: '#990000',
                    }]

                });
            }
        },
        error: function (e) {
            alert("通信またはサーバーでエラーが発生しました");
        }
    });
}
