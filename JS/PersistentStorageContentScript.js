/*
    This content script will clear the local storage data of the page, and overwrite it with the profile data 
*/

 function clearLocalStorageData() {
    var storageKeys = Object.getOwnPropertyNames(window.localStorage);
    for (var i = 0; i < storageKeys.length; i++) {
        delete window.localStorage[storageKeys[i]];
    }
}

function queryAndLoadStorageData() {

}

/*
    Gets the full domain of this webpage
*/
function getFullDomain() {
    var url = document.location.href;
    var startLoc = url.indexOf("//");   // should parse off http:// and https:// , leaving subdomain + endpoints
    url = url.substring(startLoc + 2); 
    var endLoc = url.indexOf("/");      // should parse off endpoints, leaving only full domain.
    if (endLoc != -1) {
        url.substring(0, endLoc);
    }
}

function getMainDomain() {

}

document.addEventListener("DOMContentLoaded", function () {
    clearLocalStorageData();

    queryAndLoadStorageData();
});