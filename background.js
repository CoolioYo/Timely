function Website(url, time) {
    this.url = url;
    this.time = time;
}

function startTimer(Website){

}

function stopTimer(Website){

}

var websites = [];
var currentTab = new Website("null", 0);
var previousTab = new Website("null", 0);

// Get tracked websites from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    websites.push(new Website(request.msg, 0));
    console.log(request.msg, "was added");
    getTabURL();
});

getTabURL();

// Get URL of current tab and track time
function getTabURL(){
    chrome.tabs.query({
        currentWindow: true,
        active: true

    }, function(tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url).host;

        console.log(url);

        for(var i = 0; i < websites.length; i++){
            if(websites[i].url == url){
                if(currentTab.url != previousTab.url){
                    previousTab = currentTab;
                    console.log("Previous tab: " + previousTab.url);
                }

                currentTab = websites[i];
                console.log("Current tab: " + currentTab.url);
            }
        }
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