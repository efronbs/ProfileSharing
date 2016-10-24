/*
    This content script will clear the local storage data of the page, and overwrite it with the profile data 
*/

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
        var responseObj = JSON.parse(response);
        var responseKeyset = Object.getOwnPropertyNames(responseObj);

        for (var i = 0; i < responseKeyset.length; i++) {
            window.localStorage[responseKeyset[i]] = responseObj[responseKeyset[i]];
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    clearLocalStorageData();

    queryAndLoadStorageData();
});