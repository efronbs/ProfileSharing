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
        PersistentStorageManager.setGatherStorageData(false);
        PersistentStorageManager.registerPersistentStorageListeners();
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

                // console.log(newObj);
                // console.log(JSON.stringify(newObj));

                //TODO: ensure this properly stringifies everything - very possible that it fucks up
                chrome.storage.local.set(
                    newObj, function () {
                        if (chrome.extension.lastError) {
                            console.log('error occured setting profile cookies: ' + chrome.extension.lastError.message);
                        }
                });
            }

        }
    };

    // using my user agent as base
    var initializeBaseValues = function () {
        profile["SINGLEVALUE"] = { "keyset" : []};

        profile["SINGLEVALUE"]["keyset"].push("useragent");

        var spoofedUA = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36";

        chrome.storage.local.set({"useragent" : spoofedUA},
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
        var allCookies = profile["Cookies"];
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
        var prefix = "";

        if (getList[0] === "LocalStorage") {
            prefix = "localstorage,";
        }

        var i = 0;
        for (i; i < getList.length - 1; i++) {
            currentVal = currentVal[getList[i]];
        } 
        // just get the last element of the list
        if (!getFromStorage) {
            currentVal = currentVal[getList[i]];
            callback(currentVal);
        } else {
            chrome.storage.local.get(prefix + currentVal[currentVal.indexOf(getList[i])], (function (callback) {
                return function (items) {
                    if (chrome.extension.lastError) {
                        console.log('error getting all cookies' + chrome.extension.lastError.message);
                    } else {
                       callback(items);
                    }
                };
            })(callback));
        }
        // callback(currentVal);
    }

    /*
        Sets data in the profile. Takes in the full key path, the data to set in local storage, and a callback

        The setList parameter is an array that contains the full "path" of the key, and the key itself. Since every section has a 
        "keyset" field, which is an array of keys, the last item in setList is the key associated with the data to be stored. If that key
        is not already in the keyset array it will be added. If it is, nothing will be changed.

        The data should be the data to store. An object consisting of the key from setList associated with the data object passed in will be made,
        and that will be stored. 

        For example, if you want to store a cookie that is just {"hello" : "world" }, with the key "acookiekey" in local storage, you would call
        set like so:


        set ( ["Cookies", "somedomain.com", "keyset", "acookiekey"], {"hello" : "world" }, function () { ... } )

        The object to be stored that is made internally is:

        {
            "acookiekey" : 
                {
                    "hello" : "world"
                }
        }

    */
    var set = function(setList, data, callback) {
        var currentVal = profile;
        var i = 0;

        // console.log("setting data");
        // console.log(setList);
        // console.log(data);

        for (i; i < setList.length - 1; i++) {
            var key = setList[i];

            // console.log(currentVal);
            
            if (!(key in currentVal)) {
                if (key == "keyset") {
                    currentVal[key] = [];
                } else {
                    currentVal[key] = {};
                }
            }
            currentVal = currentVal[setList[i]];
        }

        // currentVal should now be the keyset
        var dataKey = "localstorage," + setList[i];

        if (currentVal.indexOf(dataKey) <= -1) { // key not in keyset
            currentVal.push(dataKey);
        }

        dataToSet = {};
        dataToSet[dataKey] = data;

        chrome.storage.local.set(dataToSet, (function (callback) {
            return function (items) {
                if (chrome.extension.lastError) {
                    console.log('error setting local storage data' + chrome.extension.lastError.message);
                } else {
                    console.log("set local storage items");
                    callback(items);
                }
            };
        }) (callback));
        
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
            PersistentStorageManager.setGatherStorageData(true);
            PersistentStorageManager.registerPersistentStorageListeners();
        });
    };

    /*
        generates a file representing the profile 
    */
    var exportProfile = function () {

        console.log("storing profile");

        chrome.storage.local.get(null, function (items) {
            var exportFormat = {}
            exportFormat["TableOfContents"] = profile;
            exportFormat["Storage"] = items;

            var blob = new Blob([JSON.stringify(exportFormat)]);
            showProfileFile(blob);
        });
    };

    /*
        recieves the uploaded file and overwrites the profile class with it
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

    /*
        debugging features - prints out the internal profile
    */
    var showProfile = function () {
        console.log(profile);
    }


    return {
        generateNewProfile : generateNewProfile,
        exportProfile : exportProfile, 
        loadProfile : loadProfile,
        get : get,
        set : set,
        showProfile : showProfile
    };

})();
