function Website(url, time, start) {
    this.url = url;
    this.time = time;
    this.start = start;
}

function startTimer(Website){
    Website.start = new Date();
    console.log(Website.url + " timer started");
}

function stopTimer(Website){
    Website.time += new Date() - Website.start;

    // Format time
    var seconds = Math.round(Website.time / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    minutes %= 60;
    seconds %= 60;

    var time = "";

    if(hours > 0){
        time += hours + "hr "
    }
    if(minutes > 0){
        time += minutes + "min "
    }
    if(seconds > 0){
        time += seconds + "s"
    } 

    console.log(Website.url + ": " + time);
}

var websites = [];
var currentTab = "empty url";
var previousTab = "empty url";

// Get tracked websites from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    websites.push(new Website(request.msg, 0, 0));
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
        console.log("URL: " + tab.url);
        var url = new URL(tab.url).host;

        // If the current tab is different from the previous tab
        if(currentTab != url){
            previousTab = currentTab;
            console.log("Previous tab: " + previousTab);

            // Stop timer if previous tab is being tracked
            for(var i = 0; i < websites.length; i++){
                if(websites[i].url == previousTab){
                    stopTimer(websites[i]);
                }
            }
        }
        currentTab = url;
        console.log("Current tab: " + currentTab);

        // Start timer if current tab is being tracked
        for(var i = 0; i < websites.length; i++){
            if(websites[i].url == currentTab){
                startTimer(websites[i]);
            }
        }
    });
}

// Get URL of clicked tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    getTabURL();
});

// Get URL if tab changes sites
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // console.log(tabId);
    // console.log(changeInfo);
    getTabURL();
});