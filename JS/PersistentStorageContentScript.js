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

    chrome.runtime.sendMessage({"script-type" : "persistent-storage", "data" : "storage-data", "items" : JSON.stringify(localStorageData)}, function (err) {
        console.log("error in setting persistent storage " + err);
    });
}

document.addEventListener("DOMContentLoaded", function () {

    chrome.runtime.sendMessage({"script-type" : "persistent-storage", "data" : "gather-storage-data"}, function (response) {
        gatherDataStorage = response.data;
    
        if (!gatherDataStorage) {
            clearLocalStorageData();
            queryAndLoadStorageData();
        } else {
            gatherAndSendStorageData();
        }
    });
});