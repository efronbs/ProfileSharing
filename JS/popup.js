/*
    Most stuff will handled by the background page, this is just setting up the event listeners for it 
*/
document.addEventListener("DOMContentLoaded", function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.registerPopupListeners();
    });
});