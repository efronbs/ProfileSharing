var CookieManager = (function () {
    
    //private methods
    var trimCookies = function (cookieArray) {
        //TODO: implement trimming logic
        return cookieArray;
    };

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
        var currentCookie = cookieArray[0];

        var cookieJSON = getSingleCookieJSON(currentCookie);

        alert(JSON.stringify(cookieJSON));
        // for (var i = 0; i < cookieArray.length; i++) {
            
        // }
    };

    //public methods

    /*
        gets all cookies from the particular browser, and trims them to eliminate all private information
        returns a JS object representing the trimmed list of cookies. May 
    */
    var getFullTrimmedCookieObject = function (callback) {
        chrome.cookies.getAll({}, function (cookieArray) {
            var trimmedCookieArray = trimCookies(cookieArray);
            var cookieObject = JSONifyCookies(trimmedCookieArray);
            callback(cookieObject);
        });
    };

    return {
        getFullTrimmedCookieObject: getFullTrimmedCookieObject
    };

})();