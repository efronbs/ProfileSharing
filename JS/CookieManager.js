var CookieManager = (function () {
    
    //private methods
    var trimCookies = function (cookieArray) {
        //TODO: implement trimming logic
        return cookieArray;
    }

    var JSONifyCookies = function (cookieArray) {
        //TODO: implement JSONification logic
        return {};
    }

    //public methods

    /*
        gets all cookies from the particular browser, and trims them to eliminate all private information
        returns a JS object representing the trimmed list of cookies. May 
    */
    var getFullTrimmedCookieObject = function (callback) {
        chrome.cookies.getAll(function (cookieArray) {
            cookieArray = trimCookies(cookieArray);
            var cookieObject = JSONifyCookies(cookieArray);
            callback(cookieObject);
        });
    }

    return {

    };

})();