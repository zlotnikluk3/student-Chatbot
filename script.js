$(document).ready(function () {

    //---------------------------------- Add dynamic html bot content(Widget style) ----------------------------
    // You can also add the html content in html page and still it will work!
    var mybot = '<div class="chatCont" id="chatCont">' +
            '<div class="bot_profile">' +
            '<img src="https://xxx/bot2.svg" class="bot_p_img">' +
            '<div class="close">' +
            '<i class="fa fa-times" aria-hidden="true"></i>' +
            '</div>' +
            '</div><!--bot_profile end-->' +
            '<div id="result_div" class="resultDiv"></div>' +
            '<div class="chatForm" id="chat-div">' +
            '<div class="spinner">' +
            '<div class="bounce1"></div>' +
            '<div class="bounce2"></div>' +
            '<div class="bounce3"></div>' +
            '</div>' +
            '<input type="text" id="chat-input" maxlength="150" autocomplete="off" placeholder="Wprowadź pytanie (max. 150 znaków.)"' + 'class="form-control bot-txt"/>' +
            '</div>' +
            '</div><!--chatCont end-->' +
            '<div class="profile_div">' +
            '<div class="row">' +
            '<div class="col-hgt">' +
            '<img src="https://xxx/bot2.svg" class="img-circle img-profile">' +
            '</div><!--col-hgt end-->' +
            '<div class="col-hgt">' +
            '<div style="background-color: #fff"   class="chat-txt">' +
            'Czatuj z nami!' +
            '</div>' +
            '</div><!--col-hgt end-->' +
            '</div><!--row end-->' +
            '</div><!--profile_div end-->';

    $("mybot").html(mybot);

    var hello = {
        result: {
            action: "hello",
            fulfillment: {
                speech: "Witaj! Nazywam się Bot Florek. Mogę odpowiedzieć na Twoje pytania związane z rekrutacją do SGSP."
            }
        }
    };
    main(hello);

    var data = [{
            result: {
                action: " ",
                maybe: " ",
                fulfillment: {
                    speech: " ",
                    messages: []
                }
            }
        }];

    $.getJSON("bazaPyt/bazaPyt.json", function (json) {
        data = [];
        for (var i = 0; i < json.length; i++) {
            data.push({
                result: {
                    action: _no_pl(json[i].slowklu),
                    maybe: json[i].pytanie.trim(),
                    fulfillment: {
                        speech: json[i].odpowiedz,
                        messages: []
                    }
                }
            })
        }
    });


    let checker = (arr, target) => target.every(v => arr.includes(v));
    var pow = "dzien dobry czesc hej witaj";
    var poz = "zaegnaj do widzenia zobaczenia nara bywaj dziekuje";

    // ------------------------------------------ Toggle chatbot -----------------------------------------------
    $('.profile_div').click(function () {
        $('.profile_div').toggle();
        $('.chatCont').toggle();
        $('.bot_profile').toggle();
        $('.chatForm').toggle();
        document.getElementById('chat-input').focus();
    });

    $('.close').click(function () {
        $('.profile_div').toggle();
        $('.chatCont').toggle();
        $('.bot_profile').toggle();
        $('.chatForm').toggle();
    });


    // Session Init (is important so that each user interaction is unique)--------------------------------------
    var session = function () {
        // Retrieve the object from storage
        if (sessionStorage.getItem('session')) {
            var retrievedSession = sessionStorage.getItem('session');
        } else {
            // Random Number Generator
            var randomNo = Math.floor((Math.random() * 1000) + 1);
            // get Timestamp
            var timestamp = Date.now();
            // get Day
            var date = new Date();
            var weekday = new Array(7);
            weekday[0] = "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";
            var day = weekday[date.getDay()];
            // Join random number+day+timestamp
            var session_id = randomNo + day + timestamp;
            // Put the object into storage
            sessionStorage.setItem('session', session_id);
            var retrievedSession = sessionStorage.getItem('session');
        }
        return retrievedSession;
        // console.log('session: ', retrievedSession);
    }

    // Call Session init
    var mysession = session();


    // on input/text enter--------------------------------------------------------------------------------------
    $('#chat-input').on('keyup keypress', function (e) {
        var keyCode = e.keyCode || e.which;
        var text = $("#chat-input").val();
        if (keyCode === 13) {
            if (text == "" || $.trim(text) == '') {
                e.preventDefault();
                return false;
            } else {
                $("#chat-input").blur();
                setUserResponse(text);
                send(text);
                $.post("https://xxx/chbt/chbt.php", {mess: text});
                e.preventDefault();
                document.getElementById('chat-input').focus();
                return false;
            }
        }
    });


    //------------------------------------------- Send request to API.AI ---------------------------------------
    function send(text) {

        var txt = _no_pl(text);
        var rdata = [];
        var f = false;

        for (var i = 0; i < data.length; i++) {

            if (txt.split(" ").length < 3 && zlicz(txt, pow) == txt.split(" ").length) {
                rdata.push({
                    result: {
                        action: "hej",
                        fulfillment: {
                            speech: "Hej ;)"
                        }
                    }
                });
                f = true;
                break;
            } else if (txt.split(" ").length < 3 && zlicz(txt, poz) == txt.split(" ").length && !txt.split(" ").includes("dom")) {
                rdata.push({
                    result: {
                        action: "bywaj",
                        fulfillment: {
                            speech: "Bywaj ;)"
                        }
                    }
                });
                f = true;
                break;
            } else if (data.map(d => d.result.maybe).includes(text)) {
                rdata.push(data.find(x => x.result.maybe === text));
                f = true;
                break;
            } else if (checker(txt.split(" "), data[i].result.action.toLowerCase().split(" "))) {
                rdata.push(data[i]);
                f = true;
            } else if (checker(data[i].result.action.toLowerCase().split(" "), txt.split(" "))) {
                rdata.push(data[i]);
            } else if (podob(txt, data[i].result.action)) {
                rdata.push(data[i]);
            }
        }

        if (rdata.length == 1 && f) {
            main(rdata[0]);
        } else if (rdata.length == 1 && zlicz(txt, rdata[0].result.action) > Math.floor(rdata[0].result.action.split(" ").length / 4)) {
            main(rdata[0]);
        } else if (rdata.length > 0) {
            mess = [];
            var mx = 0;

            for (var i = 0; i < rdata.length; i++) {
                if (zlicz(txt, rdata[i].result.action) > mx) {
                    mx = zlicz(txt, rdata[i].result.action);
                }
            }

            for (var i = 0; i < rdata.length; i++) {
                if (!mess.includes(rdata[i].result.maybe) && zlicz(txt, rdata[i].result.action) >= mx - Math.floor(mx / 4)) {
                    mess.push(rdata[i].result.maybe);
                }
            }

            if (mess.length == 1 && zlicz(txt, data.find(x => x.result.maybe === mess[0]).result.action) > Math.floor(data.find(x => x.result.maybe === mess[0]).result.action.split(" ").length / 2)) {
                main(data.find(x => x.result.maybe === mess[0]));
            } else {
                main({
                    result: {
                        action: "moze",
                        fulfillment: {
                            speech: "Czy miałeś na myśli pytanie? :",
                            messages: mess
                        }
                    }
                });
            }
        } else {
            main({
                result: {
                    action: "brak",
                    fulfillment: {
                        speech: "Zredaguj proszę pytanie w inny sposób lub zadaj je za pośrednictwem systemu <a href='https://irk.sgsp.edu.pl/pl/profile/messages/' style='text-decoration:underline;'>IRK</a>. </a>"
                    }
                }
            });
            $.post("https://xxx/chbt/chbt.php", {unknow: text});
        }
    }

    //------------------------------------------- Main function ------------------------------------------------
    function main(data) {
        var action = data.result.action;
        var speech = data.result.fulfillment.speech;
        // use incomplete if u use required in api.ai questions in intent
        // check if actionIncomplete = false
        var incomplete = data.result.actionIncomplete;
        if (data.result.fulfillment.messages) { // check if messages are there
            if (data.result.fulfillment.messages.length > 0) { //check if quick replies are there
                var suggestions = data.result.fulfillment.messages;
            }
        }
        switch (action) {
            // case 'your.action': // set in api.ai
            // Perform operation/json api call based on action
            // Also check if (incomplete = false) if there are many required parameters in an intent
            // if(suggestions) { // check if quick replies are there in api.ai
            //   addSuggestion(suggestions);
            // }
            // break;
            default:
                setBotResponse(speech);
                if (suggestions) { // check if quick replies are there in api.ai
                    addSuggestion(suggestions);
                }
                break;
        }
    }


    //------------------------------------ Set bot response in result_div -------------------------------------
    function setBotResponse(val) {
        setTimeout(function () {
            if ($.trim(val) == '') {
                val = 'Nie jestem w stanie podać odpowiedzi.'
                var BotResponse = '<p class="botResult">' + val + '</p><div class="clearfix"></div>';
                $(BotResponse).appendTo('#result_div');
            } else {
                val = val.replace(new RegExp('\r?\n', 'g'), '<br />');
                var BotResponse = '<p class="botResult">' + val + '</p><div class="clearfix"></div>';
                $(BotResponse).appendTo('#result_div');
            }
            scrollToBottomOfResults();
            hideSpinner();
        }, 500);
    }


    //------------------------------------- Set user response in result_div ------------------------------------
    function setUserResponse(val) {
        var UserResponse = '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>';
        $(UserResponse).appendTo('#result_div');
        $("#chat-input").val('');
        scrollToBottomOfResults();
        showSpinner();
        $('.suggestion').remove();
    }


    //---------------------------------- Scroll to the bottom of the results div -------------------------------
    function scrollToBottomOfResults() {
        var terminalResultsDiv = document.getElementById('result_div');
        terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
    }


    //---------------------------------------- Ascii Spinner ---------------------------------------------------
    function showSpinner() {
        $('.spinner').show();
    }
    function hideSpinner() {
        $('.spinner').hide();
    }


    //------------------------------------------- Suggestions --------------------------------------------------
    function addSuggestion(textToAdd) {
        setTimeout(function () {
            var suggestions = textToAdd;
            var suggLength = textToAdd.length;
            $('<p class="suggestion"></p>').appendTo('#result_div');
            $('<div class="sugg-title">Propozycje: </div>').appendTo('.suggestion');
            // Loop through suggestions
            for (i = 0; i < suggLength; i++) {
                $('<span class="sugg-options">' + suggestions[i] + '</span>').appendTo('.suggestion');
            }
            scrollToBottomOfResults();
        }, 1000);
    }

    // on click of suggestions get value and send to API.AI
    $(document).on("click", ".suggestion span", function () {
        var text = this.innerText;
        setUserResponse(text);
        send(text);
        $('.suggestion').remove();
        document.getElementById('chat-input').focus();
    });
    // Suggestions end -----------------------------------------------------------------------------------------
});

function podob(txt, act) {
    var rob = txt.split(" ");
    var acar = act.toLowerCase().split(" ");
    var k = 0;


    for (var i = 0; i < rob.length; i++) {
        for (var j = 0; j < acar.length; j++) {

            if (acar[j].substring(0, Math.ceil(acar[j].length * 0.6)).length > 3 && (rob[i].includes(acar[j].substring(0, Math.ceil(acar[j].length * 0.6))) || levenshteinDistance(rob[i], acar[j]) < 3)) {
                k++;
            } else if (levenshteinDistance(rob[i], acar[j]) < 2) {
                k++;
            }
        }
    }

    if (k > 0) {
        return true;
    } else {
        return false;
    }
}

function zlicz(txt, act) {
    var rob = txt.split(" ");
    var acar = act.toLowerCase().split(" ");
    var k = 0;


    for (var i = 0; i < rob.length; i++) {
        for (var j = 0; j < acar.length; j++) {

            if (acar[j].substring(0, Math.ceil(acar[j].length * 0.6)).length > 3 && (rob[i].includes(acar[j].substring(0, Math.ceil(acar[j].length * 0.6))) || levenshteinDistance(rob[i], acar[j]) < 3)) {
                k++;
            } else if (levenshteinDistance(rob[i], acar[j]) < 2) {
                k++;
            }
        }
    }

    return k;

}

function _no_pl(val_p) {
    var val_p = val_p.toLowerCase();
    var count = val_p.length;
    var text = '';

    for (i = 0; i < count; ++i) {
        switch (val_p[i].charCodeAt()) {
            case 261:
                text += 'a';
                break;
            case 263:
                text += 'c';
                break;
            case 281:
                text += 'e';
                break;
            case 322:
                text += 'l';
                break;
            case 324:
                text += 'n';
                break;
            case 243:
                text += 'o';
                break;
            case 347:
                text += 's';
                break;
            case 378:
                text += 'z';
                break;
            case 380:
                text += 'z';
                break;
            default:
                text += val_p[i];
        }
    }
    val_p = text;

    val_p = val_p
            .replace(/^\s+|\s+$/g, "")
            .replace(/[_|\s]+/g, "-")
            .replace(/[^a-z0-9-]+/g, "")
            .replace(/[-]+/g, " ")
            .replace(/^-+|-+$/g, "")

    return val_p;
}

const levenshteinDistance = (str1 = '', str2 = '') => {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator, // substitution
                    );
        }
    }
    return track[str2.length][str1.length];
};
