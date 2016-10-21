var WebRequestManager = (function () {

    var useragent = "";

    //private methods
    var getUserAgent = function() {
        useragent = ProfileHandler.get(["ALLDOMAIN", "useragent"]);
    };

    var setupHeaderListeners = function () {
        var extraInfo = ['blocking', 'requestHeaders'];
        var filter = {urls: ["<all_urls>"]};

        chrome.webRequest.onBeforeSendHeaders(function (details) {
            for (var i = 0; i < details.requestHeaders.length; i++) {
                if (details.requestHeaders[i].name == "User-Agent") {
                    details.requestHeaders[i].value = useragent;
                }
            }

            return { requestHeaders: details.requestHeaders }
        }, filter, extraInfo);
    };

    //public methods
    var initializedHeaders = function() {
        getUserAgent();
    };

    var registerRequestListeners = function () {
        setupHeaderListeners();
    };

    return {
        initializedHeaders: initializedHeaders,
        registerRequestListeners: registerRequestListeners
    };

})();