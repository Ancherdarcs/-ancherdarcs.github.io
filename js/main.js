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
// ---------- Phone menu: slide-out drawer (every page) ----------

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

// Our own reusable instructions: one to open, one to close
function openMenu() {
  siteNav.classList.add("open");
  document.body.classList.add("menu-open");
  menuToggle.textContent = "✕";
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
}

function closeMenu() {
  siteNav.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuToggle.textContent = "☰";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
}

if (menuToggle) {

  // Tap ☰ to open, tap ✕ to close
  menuToggle.addEventListener("click", function () {
    if (siteNav.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Tapping any link in the drawer closes it
  siteNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Tapping the dimmed page outside the drawer closes it
  document.addEventListener("click", function (event) {
    const tappedMenu = siteNav.contains(event.target);
    const tappedButton = menuToggle.contains(event.target);

    if (siteNav.classList.contains("open") && !tappedMenu && !tappedButton) {
      closeMenu();
    }
  });

}
