var PersistentStorageManager = (function () {

    var tabIdToUrl= {};
    var gatherStorageData = false;

    //private methods

    /*
        Gets the full domain of this webpage. Parses off the http(s):// and the path of the url.
    */
    function getFullDomain(url) {
        var startLoc = url.indexOf("//");   // should parse off http:// and https:// , leaving subdomain + endpoints
        url = url.substring(startLoc + 2); 
        var endLoc = url.indexOf("/");      // should parse off endpoints, leaving only full domain.
        if (endLoc > -1) {
            url = url.substring(0, endLoc);
        }

        return url;
    }

    /*
        Takes a domain (can be parsed from URL with above methods), and retrieves the storage data associate with it.
        Just a wrapper for the ProfileHandler.get method
    */
    function getLocalStorageData(domain, callback) {
        ProfileHandler.get(["LocalStorage", domain, "keyset"], function (items) { 
            if (chrome.extension.lastError) {
                console.log('error getting all cookies' + chrome.extension.lastError.message);
            } else {
                callback(items);
            }
        });
    }

    /*
        pushes gethered local storage data to the ProfileHandler

        domain is the key for local storage data
    */
     var setLocalStorageData = function(domain, data, callback) {
        ProfileHandler.set(["LocalStorage", "keyset", getFullDomain(domain)], data, callback);
    }

    //public methods

    var setGatherStorageData = function(bool) {
        gatherStorageData = bool;
    }

    /*
        Registers all of the tab listeners.
    */
    var registerPersistentStorageListeners = function() {

        /*
            How we handle messages from the content script. If it messages us and says it is ready for data to be populated, 
            we grab the data from local storage and send it back 
        */
        chrome.runtime.onMessage.addListener( function (message, sender, sendResponse) {

            console.log("message occured.");
            console.log(message);

            if (message["script-type"] != "persistent-storage") {  // this message isn't for us - don't handle it.
                return;
            }

            var senderId = sender.tab.id;
            
            if (message.data == "ready-for-data") {
                getLocalStorageData(tabIdToUrl[senderId], sendResponse);

            } else if (message.data == "gather-storage-data") {
                sendResponse( { "data" : gatherStorageData } );

            } else if (message.data == "storage-data") {
                localStorageData = JSON.parse(message.items);
                setLocalStorageData(tabIdToUrl[senderId], localStorageData, function (items) {});
            }
        });

        /*
            New tab is created. Simply add the tab id to my dict of tabs to urls. No URL will be loaded at this point, so init with empty string

           pretty sure onUpdated makes this redundant. I don't want to accidentally introduce any race conditions where i could feasibly wipe out the url.
        */

        // chrome.tabs.onCreated.addListener( function (tab) {
        //     tabIdToUrl[tab.id] = "";
        // });

        /*
            Whenever an existing tab is updated. Checks if the URL has changed, and if it has parse out the domain of the URL and see if the domain is 
            different than the stored one. If so, updates the stored domain and injects the storage handler content script.
            Also checks if the tab has been closed, then remove that tab from the dict.
        */
        chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
            
            if (changeInfo.url) {   // url has been changed
                var domainOfNewUrl = getFullDomain(tab.url);
                var tabIdKeyset = Object.getOwnPropertyNames(tabIdToUrl);

                 // either changed to a new domain or for whatever reason this tab isn't being tracked. either way, update the tab to domain mapping and inject content script
                if (!(tab.id in tabIdKeyset) || (tabIdKeyset[tab.id]) !== domainOfNewUrl) {
                    chrome.tabs.executeScript(tab.id, {file: "JS/PersistentStorageContentScript.js"});
                    tabIdToUrl[tab.id] = domainOfNewUrl;
                }
            }
        });

        /*
            remove entry from dict when that tab is closed.
            Important because without this, if tab is closed then reopened to same domain, no existing persistent storage data will be overwritten
        */
        chrome.tabs.onRemoved.addListener( function (tabId, removedInfo) {
            var tabIdKeyset = Object.getOwnPropertyNames(tabIdToUrl);

            if (tabId in tabIdKeyset) {
                delete tabIdToUrl[tabId]; 
            }
        });

    }

    

    return {
        setGatherStorageData : setGatherStorageData,
        registerPersistentStorageListeners : registerPersistentStorageListeners
    };

})();