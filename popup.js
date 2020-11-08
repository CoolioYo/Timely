var websites = []; // Array of website URLS being tracked

document.addEventListener("DOMContentLoaded", function() {
    loadWebsites();

    document.getElementById("view-data").addEventListener("click", viewData); // View data button
    document.getElementById("reset").addEventListener("click", clearStorage); // Reset button
    document.getElementById("add-website").addEventListener("click", addWebsite); // Add website button
});

// Redirect to data.html
function viewData(){
    location.href = "data.html";
}

// Clear saved websites
function clearStorage(){
    chrome.storage.sync.clear();
    websites = [];

    chrome.runtime.sendMessage({
        message: "reset"
    });

    document.getElementById("total-time").innerHTML = "Total Time: 0s";
    document.getElementById("websites-tracked").innerHTML = "";
    document.getElementById("input-error").innerHTML = "";
}

// Tells background.js to start loading process
function loadWebsites(){
    chrome.runtime.sendMessage({
        message: "load"
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Loads saved websites
    if(request.message == "load"){
        chrome.storage.sync.get({websiteObjects:[]}, function(data){
            websiteObjects = data.websiteObjects;
            
            // Display all loaded websites
            for(var i = 0; i < websiteObjects.length; i++){
                displayWebsite(websiteObjects[i].url, websiteObjects[i].formattedTime);
                websites.push(websiteObjects[i].url);
            }
        });

        chrome.storage.sync.get(['key'], function(data) {
            totalTime = data.key;
            document.getElementById("total-time").innerHTML = "Total Time: " + totalTime;
        });
    }

    // Change the date shown
    if(request.message == "change date"){
        document.getElementById("today").innerHTML = "Today is " + request.date;
    }
});

// Add a website to be tracked
function addWebsite(){
    var errorMessage = document.getElementById("input-error");

    try {
        // Parse URL
        var searchBar = document.getElementById("search-bar");
        var url = searchBar.value;
        url = new URL(url).host;

        // Check if the website is already being tracked
        if(!websites.includes(url) && url){
            websites.push(url);

            displayWebsite(url, "0s");
        
            // Send URL to background.js
            chrome.runtime.sendMessage({
                message: "add",
                sentURL: url
            });
        
            searchBar.value = "";
            errorMessage.innerHTML = "";

            console.log(url + " was added");
        }else{
            errorMessage.innerHTML = "You are already tracking this site";
        }
    } catch (error) {
        errorMessage.innerHTML = "Invalid URL";
    }
}

// Displays website in pop-up
function displayWebsite(url, formattedTime){
    var container = document.createElement("div"); // Div for website elements
    container.classList.add("flex");

    var favicon = document.createElement("img"); // Favicon
    favicon.id = "favicon"+url;
    if(url != "Other"){
        favicon.src = "https://www.google.com/s2/favicons?domain="+url;
    }else{
        favicon.src = "icons/chrome-logo.svg";

        var iconSize = 16;
        favicon.setAttribute("width", iconSize);
        favicon.setAttribute("height", iconSize);
    }
    favicon.classList.add("website-favicon");
    container.appendChild(favicon);

    var name = document.createElement("p"); // Website name
    name.appendChild(document.createTextNode(url));
    name.classList.add("website-name");
    container.appendChild(name);

    var time = document.createElement("p"); // Time spent
    time.appendChild(document.createTextNode(formattedTime));
    time.classList.add("website-time");
    container.appendChild(time);

    if(url != "Other"){
        var remove = document.createElement("button"); // Remove button
        remove.appendChild(document.createTextNode("x"));
        remove.classList.add("remove-website");
        container.appendChild(remove);
    
        // Remove website from tracking list
        remove.addEventListener("click", function () {
            var toBeRemoved = this.parentElement.children[1].textContent; // Set to URL
    
            for(var i = 0; i < websites.length; i++){
                if(websites[i] == toBeRemoved){
                    console.log(toBeRemoved + " was removed");
                    chrome.runtime.sendMessage({
                        message: "remove",
                        sentURL: url
                    });
    
                    websites.splice(i, 1);
                    break;
                }
            }
    
            this.parentNode.remove();
        });
    }

    // Adding container to pop-up
    var websitesTracked = document.getElementById("websites-tracked");
    websitesTracked.appendChild(container);
}