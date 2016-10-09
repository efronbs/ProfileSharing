
/*
    Uses the chrome.extension.getViews call to grab the popup page, and then registers event listeners to the various buttons on that popup.
    While the getViews() call returns an array, since I will ever only be using one popup I can just grab the first element of the array.
*/
var registerPopupListeners = function() {
    var popupView = chrome.extension.getViews({type: "popup"})[0];

    // the window was closed before this function could finish - or at least that's what this should mean.
    if (popupView == null) {
        return;
    }

    popupView.document.getElementById("generation-button").addEventListener("click", ProfileHandler.generateNewProfile);

    popupView.document.getElementById("store-button").addEventListener("click", function () {
        //TODO: implement profile storing logic
        alert()
    });

    popupView.document.getElementById("load-button").addEventListener("click", function () {
        //TODO: implement profile loading logic
    });
};