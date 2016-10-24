var PersistentStorageManager = (function () {

    //private methods

    //public methods

    /*
        Registers the tab created event listener to inject the persistent storage overwrite content script
    */
    var registerTabCreateEventToPersistentStorageScript = function() {
        chrome.tabs.onCreated.addListener( function (tab) {
            chrome.tabs.executeScript(tab.id, {file: "PersistentStorageContentScript.js"});
        });
    }

    return {
        registerTabCreateEventToPersistentStorageScript : registerTabCreateEventToPersistentStorageScript 
    };

})();