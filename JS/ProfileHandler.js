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
    }

    //public methods

    /*
        calls all of the full population methods of the relevant handlers. 
        Passes the functions that populate the profile with the relevant information as callbacks.
    */
    var generateNewProfile = function () {
        CookieManager.getFullScrubbedCookieObject(populateProfileCookies);
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