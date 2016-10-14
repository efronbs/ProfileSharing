var CookieManager = (function () {
    
    //private methods
    var scrubCookies = function (cookieArray) {
        //TODO: implement scrubbing logic
        return cookieArray;
    };

    /*
        Gathers all of the data chrome provides on cookies and puts it in a JS object
    */
    function getSingleCookieJSON (cookie) {
        var cookieJSON = {};

        cookieJSON.name = cookie.name;
        cookieJSON.value = cookie.value;
        cookieJSON.domain = cookie.domain;
        cookieJSON.hostOnly = cookie.hostOnly;
        cookieJSON.path = cookie.path;
        cookieJSON.secure = cookie.secure;
        cookieJSON.httpOnly = cookie.httpOnly;
        cookieJSON.sameSite = cookie.sameSite;
        cookieJSON.session = cookie.session;
        cookieJSON.storeId = cookie.storeId;

        if (cookie.expirationDate == null) {
            cookieJSON.expirationDate == "";
        } else {
            cookieJSON.expirationDate = cookie.expirationDate;
        }

        return cookieJSON;
    }

    /*
        Iterates through the array of cookie objects, stringifies them, and stores it in the format described in my design doc
        I might have just been able to directly stringify the google cookie objects, but since I don't have control over those I decided not to.
    */
    var JSONifyCookies = function (cookieArray) {
        var originToCookieDict = {};
    
        for (var i = 0; i < cookieArray.length; i++) {
            var currentCookie = cookieArray[i];
            var cookieJSON = getSingleCookieJSON(currentCookie);
            var cookieID = cookieJSON.name + "," + cookieJSON.path;

            if (!(cookieJSON.domain in originToCookieDict)) {   //first cookie for this domain, make a new JS Object for it
                var newDomain = {};
                newDomain[cookieID] = cookieJSON;
                originToCookieDict[cookieJSON.domain] = newDomain;
            } else {
                if (cookieID in originToCookieDict[cookieJSON.domain]) { //make sure it doesn't already exist for whatever reason
                    console.log("CookieID " + cookieID + " already in cookie list");
                    continue; //Maybe throw a warning?
                } else {
                    originToCookieDict[cookieJSON.domain][cookieID] = cookieJSON;
                }
            }
        }

        return originToCookieDict;

    };

    //public methods

    /*
        gets all cookies from the particular browser, and scrubs them to eliminate all private information
        returns a JS object representing thescrubbed list of cookies. May 
    */
    var getFullScrubbedCookieObject = function (callback) {
        chrome.cookies.getAll({}, function (cookieArray) {
            var scrubbedCookieArray = scrubCookies(cookieArray);
            var cookieObject = JSONifyCookies(scrubbedCookieArray);
            callback(cookieObject);
        });
    };

    return {
        getFullScrubbedCookieObject: getFullScrubbedCookieObject
    };

})();