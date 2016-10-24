var PersistentStorageManager = (function () {

    var tabIdToUrl= {};

    //private methods

    /*
        Gets the full domain of this webpage
    */
    function getFullDomain(url) {
        var startLoc = url.indexOf("//");   // should parse off http:// and https:// , leaving subdomain + endpoints
        url = url.substring(startLoc + 2); 
        var endLoc = url.indexOf("/");      // should parse off endpoints, leaving only full domain.
        if (endLoc != -1) {
            url.substring(0, endLoc);
        }

        return url;
    }

    /*
        Parses off subdomains of the webpage's full domain.
        DON'T USE THIS ON A RAW URL
        it assumes you have already used getFullDomain to parse off some unnecessary parts
    */
    function getMainDomain(url) {
        var dotLocations = [];

        for (var i = 0; i < url.length; i++) {
            if (url[i] == ".") {
                dotLocations.push(i);
            }
        }
        
        // remove all but last website domain and top level domain 
        // eg: a.b.c.google.com -> google.com
        // eg: www.google.com -> google.com
        
        if (dotLocations.length > 1) {
            url = url.substring(dotLocations[dotLocations.length - 2]);
        }

        return url;
    }

    /*
        Takes a domain (can be parsed from URL with above methods), and retrieves the storage data associate with it. Just a wrapper for the ProfileHandler.get method
    */
    function getLocalStorageData(mainDomain, subdomain) {
        ProfileHandler.get(["LocalStorage"])
    }

    //public methods

    /*
        Registers all of the tab listeners.
    */
    var registerPersistentStorageListeners = function() {

        /*
            New tab is created. Simply add the tab id to my dict of tabs to urls. No URL will be loaded at this point, so init with empty string

            probably redudant because of onUpdated logic, but still nice to have
        */
        chrome.tabs.onCreated.addListener( function (tab) {
            tabIdToUrl[tab.id] = "";
        });

        /*
            Whenever an existing tab is updated. Checks if the URL has changed, and if it has parse out the domain of the URL and see if the domain is different than the stored one.
            If so, updates the stored domain and injects the storage handler content script.
            Also checks if the tab has been closed, then remove that tab from the dict.
        */
        chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
            
            if (changeInfo.url) {   // url has been changed
                var domainOfNewUrl = getFullDomain(tab.url);
                var tabIdKeyset = Object.getOwnPropertyNames(tabIdToUrl);

                 // either changed to a new domain or for whatever reason this tab isn't being tracked. either way, update the tab to domain mapping and inject content script
                if (!(tab.id in tabIdKeyset) || (tabIdKeyset[tab.id]) !== domainOfNewUrl) {
                    chrome.tabs.executeScript(tab.id, {file: "PersistentStorageContentScript.js"});
                    tabIdToUrl[tab.id] = domainOfNewUrl;
                }
            }
        });

        /*
            remove entry from dict when that tab is closed.
            Important because if tab is closed, then reopened to same domain, no existing persistent storage data will be overwritten
        */
        chrome.tabs.onRemoved.addListener( function (tabId, removedInfo) {
            var tabIdKeyset = Object.getOwnPropertyNames(tabIdToUrl);

            if (tabId in tabIdKeyset) {
                delete tabIdToUrl[tabId]; 
            }
        });

        chrome.runtime.onMessage.addListener( function (message, sender, sendResponse) {
            if (message.script-type != "persistent-storage") {  // this message isn't for us - don't handle it.
                return;
            }
            
            if (message.data == "ready-for-data") {
                var senderId = sender.tab.id;
                var mainDomain = getMainDomain(tabIdToUrl[senderId]);

                profile.get()
            }
        });
    }

    

    return {
        registerPersistentStorageListeners : registerPersistentStorageListeners
    };

})();