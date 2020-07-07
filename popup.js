var websites = [];

document.addEventListener("DOMContentLoaded", function() {
    var addWebsite = document.getElementById("add-website"); // Add website button

    // Add a website to track
    addWebsite.addEventListener("click", function() {
        // Parse URL
        var url = document.getElementById("search-bar").value;
        url = new URL(url).host;

        // Check if the website is already being tracked
        if(!websites.includes(url)){
            var container = document.createElement("div"); // Div for website elements
            container.classList.add("flex");

            var favicon = document.createElement("img"); // Favicon
            favicon.src = "https://www.google.com/s2/favicons?domain="+url;

            var name = document.createElement("p"); // Website name
            name.appendChild(document.createTextNode(url));
            name.id = "website-name";

            var remove = document.createElement("button"); // Remove button
            remove.appendChild(document.createTextNode("x"));
            remove.id = "remove-website";

            container.appendChild(favicon);
            container.appendChild(name);
            container.appendChild(remove);

            // Remove website from tracking list
            remove.addEventListener("click", function () {
                var toBeRemoved = this.parentElement.children[1].textContent;

                for(var i = 0; i < websites.length; i++){
                    if(websites[i] == toBeRemoved){
                        websites.splice(i, 1);
                    }
                }

                this.parentNode.remove();
            });
    
            var websitesTracked = document.getElementById("websites-tracked");
            websitesTracked.appendChild(container);
            
            websites.push(url);

            // Send URL to background.js
            chrome.runtime.sendMessage({
                msg: url
            });

            console.log(url + " was added");
            document.getElementById("input-error").innerHTML = ""; 

        }else{
            // If the website is already being tracked
            document.getElementById("input-error").innerHTML = "You are already tracking this site";
        }
    });
});