getTabURL();

function getTabURL(){
    
    chrome.tabs.query({
        currentWindow: true,
        active: true

    }, function(tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url).host;

        console.log(url);
    });
}

// Get URL of clicked tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    getTabURL();
});

// Get URL if tab is changed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // console.log(tabId);
    // console.log(changeInfo);
    getTabURL();
});