
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

    popupView.document.getElementById("store-button").addEventListener("click", ProfileHandler.storeProfile);

    popupView.document.getElementById("load-input").addEventListener("change", function () {
        var profileFile = popupView.document.getElementById("load-input").files[0];
        ProfileHandler.loadProfile(profileFile);
    });
};

/*
    creates a URL to the blob and 
*/
var showProfileFile = function (blob) {
    console.log("here");

    var popupView = chrome.extension.getViews({type: "popup"})[0];

    // the window was closed before this function could finish - or at least that's what this should mean.
    if (popupView == null) {
        return;
    }

    var downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", window.webkitURL.createObjectURL(blob));
    downloadLink.setAttribute("download", "profile.txt");
    downloadLink.innerHTML = "Your Browser Profile";
    popupView.document.getElementById("maindiv").appendChild(downloadLink);
}