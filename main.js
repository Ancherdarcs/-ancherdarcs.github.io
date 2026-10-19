console.log("main.js is connected");
// Find every "Praying for you" button on the page
const praybuttons = document.querySelectorAll(".pray");

//Give each button its own click listener
praybuttons.forEach(function(button) {
  button.addEventListener("click", function() {

    if (button.classList.contains("prayed")) {
      // Already prayed: undo it
        button.classList.remove("prayed");
        button.textContent = "🙏Praying for you";
    } else {
        // Not yet prayed: mark it as prayed
        button.classList.add("prayed");
        button.textContent = "🙏Prayed for you";
    }
    });
    
});
// ---------- Topic filters on the Arcs page ----------

// Find the filter buttons and the community stories
const filterButtons = document.querySelectorAll(".filter");
const communityArcs = document.querySelectorAll(".community .arc");

filterButtons.forEach(function (filterButton) {

  filterButton.addEventListener("click", function () {

    // Which topic did they pick? Read the button's sticky note
    const chosenTopic = filterButton.dataset.topic;

    // Highlight only the button that was clicked
    filterButtons.forEach(function (otherButton) {
      otherButton.classList.remove("is-active");
    });
    filterButton.classList.add("is-active");

    // Show matching stories, hide the rest
    communityArcs.forEach(function (arc) {
      if (chosenTopic === "all" || arc.dataset.topic === chosenTopic) {
        arc.classList.remove("hidden");
      } else {
        arc.classList.add("hidden");
      }
    });

  });
});
