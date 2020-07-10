var websiteObjects = [];

var currentTab = "empty url";
var previousTab = "empty url";

var windowActive = true;

function Website(url, time, formattedTime, start) {
    this.url = url;
    this.time = time;
    this.formattedTime = formattedTime;
    this.start = start;
}

// Saves websites array with chrome.storage
function saveWebsites(callback){
    chrome.storage.local.set({websiteObjects}, function(){
        if(typeof callback === 'function'){
            //If there was no callback provided, don't try to call it.
            callback();
        }
    });
}

function startTimer(Website){
    Website.start = new Date();
    console.log("*" + Website.url + " timer started");
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

    Website.formattedTime = time;
    console.log("*" + Website.url + ": " + time);

    saveWebsites();
}

// Handle messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.message == "add"){
        websiteObjects.push(new Website(request.sentURL, 0, "0s", 0));
        console.log(request.sentURL, "was added");
        checkTab();
    }else if(request.message == "remove"){
        for(var i = 0; i < websiteObjects.length; i++){
            if(websiteObjects[i].url = request.sentURL){
                websiteObjects.splice(i, 1);
                break;
            }
        }
    }else if(request.message == "reset"){
        websiteObjects = [];
    }

    saveWebsites();
});

checkTab();

// Get the URL of the current tab
function getTabURL(callback){
    chrome.tabs.query({
        currentWindow: true,
        active: true
    
    }, function(tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url).host;

        callback(url);
    });
}

// Check if the tab is being tracked
function checkTab(){
    getTabURL(function(url) {
        // If the current tab is different from the previous tab
        if(currentTab != url){
            previousTab = currentTab;
            console.log("Previous tab: " + previousTab);

            // Stop timer if previous tab is being tracked
            for(var i = 0; i < websiteObjects.length; i++){
                if(websiteObjects[i].url == previousTab){
                    stopTimer(websiteObjects[i]);
                }
            }
        }

        // Start timer if current tab is being tracked
        for(var i = 0; i < websiteObjects.length; i++){
            if(websiteObjects[i].url == url){
                startTimer(websiteObjects[i]);
                break;
            }
        }

        currentTab = url;
        console.log("Current tab: " + currentTab);
    });
}

// Get URL of clicked tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    getTabURL(function(url) {
        if(url != currentTab){
            console.log("Tab switched");
            checkTab();
        }
    });
});

// Get URL if tab changes sites
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
    getTabURL(function(url) {
        if(url != currentTab && changeinfo.status == "complete"){
            console.log("Tab updated");
            checkTab();
        }
    });
});

// Check focus of window
chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId === -1) {
        windowActive = false;
        console.log("window minimized");
    } else {
        chrome.windows.get(windowId, function(chromeWindow) {
            if (chromeWindow.state === "minimized") {
                windowActive = false;
                console.log("window minimized");
            } else {
                windowActive = true;
                console.log("window active");
            }
        });
    }

    getTabURL(function(url) {
        if(url == currentTab){
            var currentWebsite;

            // Finds website object with currenTab URL
            for(var i = 0; i < websiteObjects.length; i++){
                if(websiteObjects[i].url == currentTab){
                    currentWebsite = websiteObjects[i];
                    break;
                }
            }

            // Updates timer based on window state
            if(!windowActive){
                console.log("STOPPING TIMER");
                stopTimer(currentWebsite);
            }else{
                console.log("STARTING TIMER");
                startTimer(currentWebsite);
            }
        }
    });
});