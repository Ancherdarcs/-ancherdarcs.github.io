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
// ---------- Share buttons on the Arcs page ----------

const shareButtons = document.querySelectorAll(".share");

shareButtons.forEach(function (shareButton) {

  shareButton.addEventListener("click", function () {

    // Find the story this button belongs to
    const story = shareButton.closest("article");
    const title = story.querySelector("h3").textContent;

    // Build a link straight to that story, e.g. .../arcs.html#arc-grief
    const link = window.location.origin + window.location.pathname + "#" + story.id;

    if (navigator.share) {
      // Phones: open the built-in share menu
      navigator.share({
        title: title,
        text: "Read this arc on Ancherd Arcs",
        url: link
      }).catch(function () {
        // They closed the share menu without sharing. That's fine, do nothing.
      });
    } else {
      // Computers without a share menu: copy the link instead
      navigator.clipboard.writeText(link);
      shareButton.textContent = "✓ Link copied";

      // After 2 seconds, change the words back
      setTimeout(function () {
        shareButton.textContent = "↗ Share";
      }, 2000);
    }

  });

});

// ---------- Comment boxes on the Arcs page ----------

const commentForms = document.querySelectorAll(".comment-form");

commentForms.forEach(function (form) {

  const input = form.querySelector(".comment-input");
  const commentsBox = form.closest(".comments");
  const errorMessage = commentsBox.querySelector(".comment-error");
  const commentList = commentsBox.querySelector(".comment-list");

  form.addEventListener("submit", function (event) {

    // Stop the browser from reloading the page (what forms do by default)
    event.preventDefault();

    // What did they type? .trim() removes extra spaces at the ends
    const text = input.value.trim();

    // Nothing typed? Show the message and stop here
    if (text === "") {
      errorMessage.classList.remove("hidden");
      return;
    }

    // Create a new list item and put the comment in it
    const newComment = document.createElement("li");
    newComment.textContent = text;
    commentList.appendChild(newComment);

    // Empty the box, ready for the next comment
    input.value = "";
  });

  // Hide the message as soon as they start typing
  input.addEventListener("input", function () {
    errorMessage.classList.add("hidden");
  });

});