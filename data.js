document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("back-button").addEventListener("click", back); // Back to main pop-up
});

function back(){
    location.href = "popup.html";
}