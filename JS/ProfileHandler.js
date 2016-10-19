var ProfileHandler = (function () {

    var profile = {};
    var reader = new FileReader();

    //private methods
    
    // should this be public?
    // might make this a more general method, and curry in all of the known parameters through an anonymous function

    /*
        This function takes an array of JSON cookie bundles (format in the design doc) and adds them to the current profile.
        This function will OVERWRITE the existing cookie bundles in the profile. If you want to insert or remove cookies, please use
        the relevant functions.
    */ 
    var populateProfileCookies = function (cookieSet) {

        var profileKeySet = Object.keys(cookieSet);
        for (var i = 0; i < profileKeySet.length; i++) {

            var domainKey = profileKeySet[i];
            var currentCookieBundle = cookieSet[domainKey];

            //if exists, just add it. If not, need to create it
            if (!(domainKey in profile)) {
                profile[domainKey] = {}; // create a field for the domain in the profile
            }  
            profile[domainKey]["Cookies"] = currentCookieBundle;

        }
    };

    //using my user agent as base - should initialize
    var initializeBaseValues = function () {
        profile["ALLDOMAINS"] = {};

        profile["ALLDOMAINS"]["useragent"] = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36";
        
    };

    //public methods

    /*
        Takes a list of values. The value retrieved from this path is returned 
    */
    var get = function(val) {
        var currentVal = profile;
        for (var i = 0; i < val.length; i++) {
            currentVal = currentVal[val[i]];
        }

        return currentVal;
    }

    /*
        calls all of the full population methods of the relevant handlers. 
        Passes the functions that populate the profile with the relevant information as callbacks.
    */
    var generateNewProfile = function () {
        CookieManager.getFullScrubbedCookieObject(populateProfileCookies);
        initializeBaseValues();
    };

    /*
        adds the file 
    */
    var storeProfile = function () {
        // TODO - implement storing logic
        var blob = new Blob([JSON.stringify(profile)]);
        showProfileFile(blob);
    };

    /*
        recieves the uploaded file and overwrites the profile class with it
        TODO acutally put loaded data into browser - why wasn't this already implemented
    */
    var loadProfile = function (profile) {
        reader.onload = function (e) {
            var res = reader.result;
            profile = JSON.parse(res);
        };

        reader.readAsText(profile); // this will execute the above code - it happens first
    };


    return {
        generateNewProfile: generateNewProfile,
        storeProfile: storeProfile, 
        loadProfile: loadProfile
    };

})();