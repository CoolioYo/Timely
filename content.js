var websites = [];

document.addEventListener("DOMContentLoaded", function() {
    var addWebsite = document.getElementById("add-website");

    addWebsite.addEventListener("click", function() {
        var websiteInput = document.getElementById("website-input").value; 

        var newWebsite = document.createElement("p");
        var websiteText = document.createTextNode(websiteInput);
        newWebsite.appendChild(websiteText);

        var websitesTracked = document.getElementById("websites-tracked");
        websitesTracked.appendChild(newWebsite);

        websites.push(websiteInput);
        console.log(websiteInput + " was added");
    });
});