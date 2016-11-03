var WebRequestManager = (function () {

    var useragent = "";

    //private methods
    /*
        Grabs all headers from the profile and calls the relevent callbacks on them

        This may seem dumb as fuck and messy right now with only useragent, but I think this project has the potential to require setting
        A LOT of headers, so I think encapsulating all of the calls to Profile.get is the right way to go
    */

    //TODO: make this work with jquery.when or promises or whatever I decide to do
    var initializeHeaderValues = function() {
        getUserAgent();
    };

    /*
        gets the user agent header from the profile. Since Profile.get makes an async call to chrome.storage.local.get, this requires a callback

        I think items will be in the form 
    */

    //TODO: implement jquery.when or promises or whatever, so all async methods can be called at once and the the listener setup can be called
    var getUserAgent = function() {
        ProfileHandler.get(["SINGLEVALUE", "keyset", "useragent"], function (items) {
            useragent = items[0]["useragent"];

            setupHeaderListeners();
        });
    };

    var setupHeaderListeners = function () {
        var extraInfo = ['blocking', 'requestHeaders'];
        var filter = {urls: ["<all_urls>"]};

        chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
            for (var i = 0; i < details.requestHeaders.length; i++) {
                if (details.requestHeaders[i].name == "User-Agent") {
                    details.requestHeaders[i].value = useragent;
                }
            }

            return { requestHeaders: details.requestHeaders }
        }, filter, extraInfo);
    };

    //public methods

    /*
        Kicks off this modules stuff. Only one thing here now, but I could see this being pretty large in the future

        May also consider moving logic from initializeHeaderValues to here once my promises update is done
    */
    var registerRequestListeners = function () {
        initializeHeaderValues();
    };

    return {
        registerRequestListeners: registerRequestListeners
    };

})();