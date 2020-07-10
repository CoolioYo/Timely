var websites = [];

document.addEventListener("DOMContentLoaded", function() {
    loadWebsites();

    document.getElementById("reset").addEventListener("click", clearStorage);
    document.getElementById("add-website").addEventListener("click", addWebsite);
});

// Clears saved websites
function clearStorage(){
    chrome.storage.sync.clear();
    websites = [];

    const myNode = document.getElementById("websites-tracked");
    myNode.innerHTML = '';

    document.getElementById("input-error").innerHTML = "";

    saveWebsites();
}

// Loads saved websites
function loadWebsites(){
    chrome.storage.local.get({websites:[]},function(data){
        websites = data.websites;
        console.log(websites);

        // Display all loaded websites
        for(var i = 0; i < websites.length; i++){
            displayWebsite(websites[i]);
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
        displayWebsite(url);

        websites.push(url);

        saveWebsites();
    
        // Send URL to background.js
        chrome.runtime.sendMessage({
            msg: url
        });
    
        console.log(url + " was added");
        document.getElementById("input-error").innerHTML = ""; 
    }else{
        document.getElementById("input-error").innerHTML = "You are already tracking this site";
    }
}

// Displays website in pop-up
function displayWebsite(url){
    var container = document.createElement("div"); // Div for website elements
    container.classList.add("flex");

    var favicon = document.createElement("img"); // Favicon
    favicon.src = "https://www.google.com/s2/favicons?domain="+url;

    var name = document.createElement("p"); // Website name
    name.appendChild(document.createTextNode(url));
    name.id = "website-name";

    var time = document.createElement("p"); // Time spent
    time.appendChild(document.createTextNode("0"));
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
                websites.splice(i, 1);
                saveWebsites();
            }
        }

        this.parentNode.remove();
    });

    var websitesTracked = document.getElementById("websites-tracked");
    websitesTracked.appendChild(container);
}

// Saves websites array with chrome.storage
function saveWebsites(callback){
    chrome.storage.local.set({websites}, function(){
        if(typeof callback === 'function'){
            //If there was no callback provided, don't try to call it.
            callback();
        }
    });
}