var ProfileHandler = (function () {

    var profile = {};
    var reader = new FileReader();

    //private methods

    /*
        This actually starts the process of taking a profile and putting the data it contains into the browser. 
    */
    var startProfileSync = function () {
        extractCookiesFromProfile(CookieManager.setBrowserCookies);
        WebRequestManager.registerRequestListeners();
        PersistenStorageManager.setGatherStorageData(false);
    };
    
    // should this be public?
    // might make this a more general method, and curry in all of the known parameters through an anonymous function

    /*
        This function takes an array of JSON cookie bundles (format in the design doc) and adds them to the current profile.
        This function will OVERWRITE the existing cookie bundles in the profile. If you want to insert or remove cookies, please use
        the relevant functions.
    */ 
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
                //TODO: ensure this properly stringifies everything - very possible that it fucks up
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

        var spoofedUA = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.85 Safari/537.36";
        // var spoofedUA = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36";

        chrome.storage.local.set({"useragent" :spoofedUA},
            function () {
                if (chrome.extension.lastError) {
                    console.log('error occured settings useragent: ' + chrome.extension.lastError.message);
                }
            });
    };

    /*
        Asynchronously grabs all cookies in the profile (stored in chrome.storage.local), and sends them to the cookie manager
        to bet set as browser cookies.

        only calls callback once it has sent all cookies.

    */
    var extractCookiesFromProfile = function(callback) {
        var allCookies = Profile["Cookies"];
        var domainSet = Object.getOwnPropertyNames(allCookies);

        var allKeys = [];
        for (var i = 0; i < domainSet.length; i++) {
            var currentDomain = domainSet[i];
            var currentDomainKeyset = currentDomain["keyset"];
            allKeys.concat(currentDomainKeyset);
        }

        chrome.storage.local.get(allKeys, (function (callback) {
            return function (items) {
                    if (chrome.extension.lastError) {
                        console.log('error getting all cookies' + chrome.extension.lastError.message);
                    } else {
                        var resKeys = Object.getOwnPropertyNames(items);
                        var allCookieData = [];
                        for (var i = 0; i < resKeys.length; i++) {
                            allCookieData.push(items[resKeys[i]]);
                        }

                        callback(allCookieData);
                    }
                }
            })(callback));
    }

    //public methods

    /*
        Takes a list of keys, and the value associated with that key should be returned.

        If the last value in the list is keyset, chrome.storage will be queried for all items in the keyset

        If the second to last value in the list is 'keyset', the next value should be the key to get from the keyset, and google.storage.local
        will be querried for the object associated with that key.

        For example:
        ["Cookies", "somedomain.com"] -> the object { "keyset" : [<key> , ... ] } will sent to the callback
        
        ["Cookies", "somedomain.com", "keyset"] -> chrome.storage will be queried for all of the keys in the keyset, and the object containing them
                                                    will be returned.

        ["Cookies", "somedomain.com", "keyset", "acookiekey"] -> the value in chrome.storage associated with "acookiekey" will be returned.

        This will return the items return from storage, so in the case:

        storage:
            "hello" : "world"

        and you ask for the key "hello", the array of Objects

        [
            {
                hello : "world" 
            }
        ]

        will be returned
    */
    var get = function(getList, callback) {
        var currentVal = profile;
        var getFromStorage = (getList.indexOf("keyset") > -1);
        var i = 0;
        for (i; i < getList.length - 1; i++) {
            currentVal = currentVal[getList[i]];
        } 
        // just get the last element of the list
        if (!getFromStorage) {
            currentVal = currentVal[getList[i]];
        } else {
            chrome.storage.local.get(currentVal[currentVal.indexOf(getList[i])], (function (callback) {
                return function (items) {
                    if (chrome.extension.lastError) {
                        console.log('error getting all cookies' + chrome.extension.lastError.message);
                    } else {
                       callback(items);
                    }
                };
            })(callback));
        }
        callback(currentVal);
    }
    
    /*
        takes local storage data and sends it to the chrome.local.storage
    */
    var setProfileLocalStorage = function(items) {
        var keyset = Object.getOwnPropertyNames(items);
        for (var i = 0; i < keyset.length; i++ ) {
            var key = keyset[i];
            chrome.storage.local.set({ key : JSON.stringify(items[key]) }, function (data) {
                if (chrome.extension.lastError) {
                    console.log("error storing local storage to " + chrome.extension.lastError.message);
                }
            });
        }
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
            PersistenStorageManager.setGatherStorageData(true);
        });
    };

    /*
        generates a file representing the profile 
    */
    var exportProfile = function () {

        chrome.storage.local.get(null, function (items) {
            var exportFormat = {}
            exportForm["TableOfContents"] = profile;
            exportForm["Storage"] = items;

            var blob = new Blob([JSON.stringify(exportForm)]);
            showProfileFile(blob);
        });
    };

    /*
        recieves the uploaded file and overwrites the profile class with it
        TODO acutally put loaded data into browser - why wasn't this already implemented
    */
    var loadProfile = function (profileFile) {
        reader.onload = function (e) {
            var res = reader.result;
            var exportForm = JSON.parse(res);
            profile = exportForm["TableOfContents"];
            var data = exportForm["Storage"];
            
            chrome.storage.local.set(data, function () {
                if (chrome.extension.lastError) {
                        console.log('error populating storage from imported profile' + chrome.extension.lastError.message);
                    } else {
                       startProfileSync();
                    }
            });
        };

        reader.readAsText(profileFile); // this will execute the above code - it happens first
    };


    return {
        generateNewProfile: generateNewProfile,
        storeProfile: exportProfile, 
        loadProfile: loadProfile,
        get: get
    };

})();
