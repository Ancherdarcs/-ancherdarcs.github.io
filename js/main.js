console.log("main.js is connected");
// Find every "Praying for you" button on the page
const praybuttons = document.querySelectorAll(".pray");

//Give each button its own click listener
praybuttons.forEach(function(button) {
  button.addEventListener("click", function() {

    if (button.classList.contains("prayed")) {
      // Already prayed: undo it
        button.classList.remove("prayed");
        button.textContent = "Praying for you";
    } else {
        // Not yet prayed: mark it as prayed
        button.classList.add("prayed");
        button.textContent = "Prayed for you";
    }
    });
    
});