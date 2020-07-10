var websites = []; // Array of website URLS being tracked

document.addEventListener("DOMContentLoaded", function() {
    loadWebsites();

    document.getElementById("reset").addEventListener("click", clearStorage); // Reset button
    document.getElementById("add-website").addEventListener("click", addWebsite); // Add website button
});

// Clears saved websites
function clearStorage(){
    chrome.storage.sync.clear();
    websites = [];

    chrome.runtime.sendMessage({
        message: "reset"
    });

    document.getElementById("websites-tracked").innerHTML = '';
    document.getElementById("input-error").innerHTML = "";
}

// Loads saved websites
function loadWebsites(){
    chrome.runtime.sendMessage({
        message: "load"
    });

    chrome.storage.local.get({websiteObjects:[]},function(data){
        websiteObjects = data.websiteObjects;

        // Display all loaded websites
        for(var i = 0; i < websiteObjects.length; i++){
            displayWebsite(websiteObjects[i].url, websiteObjects[i].formattedTime);
        }
    });
}

// Add a website to be tracked
function addWebsite(){
    // Parse URL
    var url = document.getElementById("search-bar").value;
    url = new URL(url).host;

    // Check if the website is already being tracked
    if(!websites.includes(url)){
        websites.push(url);

        displayWebsite(url, 0);
    
        // Send URL to background.js
        chrome.runtime.sendMessage({
            message: "add",
            sentURL: url
        });
    
        console.log(url + " was added");
        document.getElementById("input-error").innerHTML = ""; 
    }else{
        document.getElementById("input-error").innerHTML = "You are already tracking this site";
    }
}

// Displays website in pop-up
function displayWebsite(url, formattedTime){
    var container = document.createElement("div"); // Div for website elements
    container.id = url;
    container.classList.add("flex");

    var favicon = document.createElement("img"); // Favicon
    favicon.src = "https://www.google.com/s2/favicons?domain="+url;

    var name = document.createElement("p"); // Website name
    name.appendChild(document.createTextNode(url));
    name.id = "website-name";

    var time = document.createElement("p"); // Time spent
    time.appendChild(document.createTextNode(formattedTime));
    time.id = "website-time";

    var remove = document.createElement("button"); // Remove button
    remove.appendChild(document.createTextNode("x"));
    remove.id = "remove-website";

    container.appendChild(favicon);
    container.appendChild(name);
    container.appendChild(time);
    container.appendChild(remove);

    // Remove website from tracking list
    remove.addEventListener("click", function () {
        var toBeRemoved = this.parentElement.children[1].textContent;

        for(var i = 0; i < websites.length; i++){
            if(websites[i] == toBeRemoved){
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

    var websitesTracked = document.getElementById("websites-tracked");
    websitesTracked.appendChild(container);
}