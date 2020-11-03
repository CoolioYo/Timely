var websiteObjects = [];

var currentTab = "empty url";
var previousTab = "empty url";

// For displaying dates
var date;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// For all websites
class Website{
    constructor(url, time, formattedTime, start){
        this.url = url;
        this.time = time;
        this.formattedTime = formattedTime;
        this.start = start;
    }
}

// Tracks time for all websites not being tracked
var otherWebsites = new Website("Other", 0, "0s", 0);
websiteObjects.push(otherWebsites);

// Tracks total time spent on Chrome
var totalTime = formatTime(0);

// Save to chrome.storage
function saveWebsites(){
    chrome.storage.sync.set({websiteObjects});
}

function saveTotalTime(){
    findTotalTime();

    chrome.storage.sync.set({key: totalTime});
}

// Start timer for website
function startTimer(Website){
    Website.start = new Date();
    console.log("*" + Website.url + " timer started");
}

// Stop timer for website
function stopTimer(Website){
    Website.time += new Date() - Website.start;

    Website.formattedTime = formatTime(Website.time);
    console.log("*" + Website.url + ": " + Website.formattedTime);
}

// Find total time spent on Chrome
function findTotalTime(){
    var total = 0;
    for(var i = 0; i < websiteObjects.length; i++){
        total += websiteObjects[i].time;
    }

    totalTime = formatTime(total);
}

// Format time in hours : minutes : seconds
function formatTime(time){
        var seconds = Math.round(time / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        minutes %= 60;
        seconds %= 60;
    
        var fTime = "";
    
        if(hours > 0){
            fTime += hours + "hr "
        }
        if(minutes > 0){
            fTime += minutes + "min "
        }
        if(seconds > 0 && time / 1000 < 60){
            fTime += seconds + "s"
        }
    
        return fTime;
}

// Handle messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.message == "add"){
        // Add website
        websiteObjects.push(new Website(request.sentURL, 0, "0s", 0));
        console.log(request.sentURL, "was added");
        checkTab();
    }else if(request.message == "remove"){
        // Remove website
        for(var i = 0; i < websiteObjects.length; i++){
            if(websiteObjects[i].url = request.sentURL){
                websiteObjects.splice(i, 1);
                break;
            }
        }
    }else if (request.message == "load"){
        // Check the date
        if(date == null){
            date = new Date();
            date = days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();

            chrome.runtime.sendMessage({
                message: "change date",
                date: date
            });

        }else{
            var currentDate = new Date();
            currentDate = days[currentDate.getDay()] + ", " + months[currentDate.getMonth()] + " " + currentDate.getDate();

            if(currentDate != date){
                date = currentDate;
            }

            chrome.runtime.sendMessage({
                message: "change date",
                date: date
            });
        }

        // Updates times for load
        var currentWebsite = getCurrentWebsite();

        if(currentWebsite != null){
            stopTimer(currentWebsite);
            startTimer(currentWebsite);
        }else{
            if(otherTracked == true){
                stopTimer(otherWebsites);
                startTimer(otherWebsites);
            }
        }

    }else if(request.message == "reset"){
        // Reset data
        websiteObjects = [];

        otherWebsites = new Website("Other", 0, "0s", 0);
        websiteObjects.push(otherWebsites);
        otherTracked = false;

        checkTab();

        totalTime = formatTime(0);
    }

    saveWebsites();
    saveTotalTime();

    // Tells pop-up to start loading data
    if(request.message == "load" || request.message == "reset"){
        chrome.runtime.sendMessage({
            message: "load"
        })
    }
});

// Check current tab at the start of the program
checkTab();

// Get the URL of the current tab
function getTabURL(callback){
    chrome.tabs.query({
        currentWindow: true,
        active: true
    
    }, function(tabs) {
        try {
            var tab = tabs[0];
            var url = new URL(tab.url).host;
    
            callback(url);
        } catch (error) {
            console.log("Could not get tab url");
        }
    });
}

var otherTracked = false;

// Check if the tab is being tracked
function checkTab(){
    getTabURL(function(url) {
        var found = false;

        // If the current tab is different from the previous tab
        if(currentTab != url){
            previousTab = currentTab;
            //console.log("Previous tab: " + previousTab);

            // Stop timer if previous tab is being tracked
            for(var i = 0; i < websiteObjects.length; i++){
                if(websiteObjects[i].url == previousTab){
                    stopTimer(websiteObjects[i]);
                    found = true;
                }
            }
        }

        if(!found && otherTracked == true){
            stopTimer(otherWebsites);
        }

        // Start timer if current tab is being tracked
        found = false;

        for(var i = 0; i < websiteObjects.length; i++){
            if(websiteObjects[i].url == url){
                startTimer(websiteObjects[i]);
                found = true;
                break;
            }
        }

        if(!found){
            startTimer(otherWebsites);
            otherTracked = true;
        }

        currentTab = url;
        //console.log("Current tab: " + currentTab);
    });
}

// Returns website object from currentTab
function getCurrentWebsite(){
    var currentWebsite;

    for(var i = 0; i < websiteObjects.length; i++){
        if(websiteObjects[i].url == currentTab){
            console.log("Current tab: " + currentTab);
            currentWebsite = websiteObjects[i];
        }
    }

    return currentWebsite;
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
    var windowActive = true;

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

    // Checks if current tab is being tracked
    var currentWebsite = getCurrentWebsite();

    if(currentWebsite != null){
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
