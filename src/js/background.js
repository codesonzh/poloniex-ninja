console.info("PoloNinja bg script loaded.");
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.executeScript(null, {file: "js/content.js"});
});
