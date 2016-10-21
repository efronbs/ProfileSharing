var WebRequestManager = (function () {

    var useragent = "";

    //private methods
    var initializedHeaderValues = function() {
        getUserAgent();
    };

    var getUserAgent = function() {
        useragent = ProfileHandler.get(["ALLDOMAINS", "useragent"]);
    };

    var setupHeaderListeners = function () {
        var extraInfo = ['blocking', 'requestHeaders'];
        var filter = {urls: ["<all_urls>"]};

        chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
            for (var i = 0; i < details.requestHeaders.length; i++) {
                if (details.requestHeaders[i].name == "User-Agent") {

                    console.log("setting useragent as " + useragent);

                    details.requestHeaders[i].value = useragent;
                }
            }

            return { requestHeaders: details.requestHeaders }
        }, filter, extraInfo);
    };``

    //public methods

    var registerRequestListeners = function () {
        initializedHeaderValues();

        setupHeaderListeners();
    };

    return {
        registerRequestListeners: registerRequestListeners
    };

})();