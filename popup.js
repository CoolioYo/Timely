var websites = [];

document.addEventListener("DOMContentLoaded", function() {
    var addWebsite = document.getElementById("add-website"); // Add website button

    // Add a website to track
    addWebsite.addEventListener("click", function() {
        // Parse URL
        var websiteInput = document.getElementById("website-input").value;
        websiteInput = new URL(websiteInput).host;

        // Check if the website is already being tracked
        if(!websites.includes(websiteInput)){
            var newWebsite = document.createElement("p");
            var websiteText = document.createTextNode(websiteInput);
            newWebsite.appendChild(websiteText);
    
            var websitesTracked = document.getElementById("websites-tracked");
            websitesTracked.appendChild(newWebsite);
            
            websites.push(websiteInput);

            chrome.runtime.sendMessage({
                msg: websiteInput
            });

            console.log(websiteInput + " was added");
            document.getElementById("website-input-error").innerHTML = ""; 

        }else{
            document.getElementById("website-input-error").innerHTML = "You are already tracking this site";
        }
    });
});