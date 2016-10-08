var ProfileHandler = (function () {

    var profile = {};

    //private methods
    
    // should this be public?
    // might make this a more general method, and curry in all of the known parameters through an anonymous function 
    var populateProfileCookies = function (cookieSet) {
        //TODO: implement profile population code
    }

    //public methods

    /*
        calls all of the full population methods of the relevant handlers. Passes the functions that populate the profile with the relevant information as callbacks
    */
    var generateNewProfile = function () {
        CookieManager.getFullTrimmedCookieObject(populateProfileCookies);
    };

    return {
        generateNewProfile: generateNewProfile 
    };

})();