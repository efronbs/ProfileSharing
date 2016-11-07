/*
    This content script will clear the local storage data of the page, and overwrite it with the profile data 
*/

var gatherDataStorage = false;

/*
    Clears existing local storage data to prep for profile data. 
    May need to remove this if it fucks up too many websites
*/
function clearLocalStorageData() {
    var storageKeys = Object.getOwnPropertyNames(window.localStorage);
    for (var i = 0; i < storageKeys.length; i++) {
        delete window.localStorage[storageKeys[i]];
    }
}

/*
    sends the extension a message that this script is ready to accept the local storage data and set it. The response will be a json string in the form
    {
        key : value,
        ... 
        ...
    }
*/
function queryAndLoadStorageData() {
    
    chrome.runtime.sendMessage({"script-type" : "persistent-storage", "data" : "ready-for-data"}, function (response) {
        var responseKeyset = Object.getOwnPropertyNames(responseObj);

        for (var i = 0; i < responseKeyset.length; i++) {
            window.localStorage[responseKeyset[i]] = response[responseKeyset[i]];
        }
    });
}

function gatherAndSendStorageData() {
    localStorageData = {}
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        localStorageData[key] = localStorage.getItem(key);
    }

    chrome.runtime.sendMessage({"script-type" : "persistent-storage", "data" : "storage-data", "items" : JSON.stringify(localStorageData)}, function (response) {
        //console.log("error in setting persistent storage " + err);
    });
}

function sendStartupMessage() {
    chrome.runtime.sendMessage({"script-type" : "persistent-storage", "data" : "gather-storage-data"}, function (response) {
        gatherDataStorage = JSON.parse(response.data);
    
        // console.log(response);
        // console.log("gathering storage data: " + gatherDataStorage);

        if (gatherDataStorage) {
            gatherAndSendStorageData();
        } else {
            clearLocalStorageData();
            queryAndLoadStorageData();
        }
    });
}

/*
    Execution starts here - I can't guarantee that when I inject the content script whether the page will be loaded or not, so I do a check to see, and if so I run the kick off code, if not 
    I add an event listener.
*/

if (document.readyState == "complete") {
    
    //console.log("document loaded when script injected");
    
    sendStartupMessage();
} else {

    //console.log("document loaded when script injected");
    
    document.addEventListener("DOMContentLoaded", function () {
        sendStartupMessage();
    });
}