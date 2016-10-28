var ProfileHandler = (function () {

    var profile = {};
    var reader = new FileReader();

    //private methods

    /*
        This actually starts the process of taking a profile and putting the data it contains into the browser. 
    */
    var startProfileSync = function () {
        CookieManager.setBrowserCookies(extractCookiesFromProfile());
        WebRequestManager.registerRequestListeners();
    };
    
    // should this be public?
    // might make this a more general method, and curry in all of the known parameters through an anonymous function

    /*
        This function takes an array of JSON cookie bundles (format in the design doc) and adds them to the current profile.
        This function will OVERWRITE the existing cookie bundles in the profile. If you want to insert or remove cookies, please use
        the relevant functions.
    */ 
    //TODO update this to use chrome.storage API
    var populateProfileCookies = function (cookieSet) {

        var profileKeySet = Object.keys(cookieSet);

        if (!("Cookies" in profile)) {
            profile["Cookies"] = {};
        }

        for (var i = 0; i < profileKeySet.length; i++) {

            var domainKey = profileKeySet[i];
            var currentCookieBundle = cookieSet[domainKey];

            //if exists, just add it. If not, need to create it
            if (!(domainKey in profile["Cookies"])) {
                profile["Cookies"][domainKey] = {"keyset" : []}; // create a field for the domain in the profile
            } 

            var cookieBundleKeyset = Object.keys(currentCookieBundle);
            // keyset added to profile, now need to set the data in chrome.storage
            profile["Cookies"][domainKey]["keyset"] = cookieBundleKeyset;

            for (var j = 0; j < cookieBundleKeyset.length; j++) {
                var newObj = {};
                newObj[cookieBundleKeyset[j]] = currentCookieBundle[cookieBundleKeyset[j]];
                console.log(newObj);
                console.log(JSON.stringify(newObj));
                chrome.storage.local.set(
                    JSON.stringify(newObj), function () {
                        if (chrome.extension.lastError) {
                            console.log('error occured setting profile cookies: ' + chrome.extension.lastError.message);
                        }
                });
            }

        }
    };

    // using my user agent as base
    var initializeBaseValues = function () {
        profile["SINGLEVALUE"] = [];

        profile["SINGLEVALUE"].push("useragent");

        chrome.local.storage.set({"useragent" : "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36"},
            function () {
                if (chrome.extension.lastError) {
                    console.log('error occured settings useragent: ' + chrome.extension.lastError.message);
                }
            });
    };

    // TODO update to chrome.storage format
    var extractCookiesFromProfile = function() {
        var keyset = Object.getOwnPropertyNames(profile);
        keyset.splice(keyset.indexOf("ALLDOMAINS"), 1);

        var cookieArray = [];
        for (var i = 0; i < keyset.length; i++){
            var currentKey = keyset[i];

            // console.log("DOMAIN KEY: " + currentKey);

            var cookieKeyset = Object.getOwnPropertyNames(profile[currentKey]["Cookies"]);
            
            // console.log("DOMAIN COOKIE KEYS: " + cookieKeyset);

            for (var j = 0; j < cookieKeyset.length; j++) {
                var currentCookieKey = cookieKeyset[j]

                // console.log("CURRENT COOKIE KEY: " + currentCookieKey);
                // console.log("CURRENT COOKIE VALUE: " + profile[currentKey]["Cookies"][currentCookieKey]);

                cookieArray.push(profile[currentKey]["Cookies"][currentCookieKey]);
            }
        }

        return cookieArray;
    }

    //public methods

    /*
        Takes a list of values. The value retrieved from this path is returned 
    */
    // TODO update to new chrome.storage format
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
        cookiesPopulated = false;

        initializeBaseValues();

        CookieManager.getFullScrubbedCookieObject( function(cookieObj) {
            populateProfileCookies(cookieObj);
            startProfileSync();
        });
    };

    /*
        adds the file 
    */
    var storeProfile = function () {
        // TODO - implement storing logic
        var blob = new Blob([JSON.stringify(profile)]);
        showProfileFile(blobr);
    };

    /*
        recieves the uploaded file and overwrites the profile class with it
        TODO acutally put loaded data into browser - why wasn't this already implemented
    */
    var loadProfile = function (profileFile) {
        reader.onload = function (e) {
            var res = reader.result;
            profile = JSON.parse(res);

            // last thing to happen - starts the profile sync
            startProfileSync();
        };

        reader.readAsText(profileFile); // this will execute the above code - it happens first
    };


    return {
        generateNewProfile: generateNewProfile,
        storeProfile: storeProfile, 
        loadProfile: loadProfile,
        get: get
    };

})();