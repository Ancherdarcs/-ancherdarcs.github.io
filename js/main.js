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
  const postButton = form.querySelector("button");
  const commentsBox = form.closest(".comments");
  const message = commentsBox.querySelector(".comment-error");
  const anonymousBox = commentsBox.querySelector(".comment-anon");

  // Show a message under the box: red for problems, gold for success
  function showMessage(text, isError) {
    message.textContent = text;
    message.classList.remove("hidden");
    message.classList.toggle("is-success", !isError);
  }

  form.addEventListener("submit", async function (event) {

    // Stop the page from reloading
    event.preventDefault();

    const text = input.value.trim();

    if (text === "") {
      showMessage("Write something before posting.", true);
      return;
    }

    if (!db) {
      showMessage("Comments aren't connected right now. Please try again later.", true);
      return;
    }

    // Only signed-in people can post
    const sessionResult = await db.auth.getSession();

    if (!sessionResult.data.session) {
      showMessage("Please sign in to comment. Use the Sign in link at the top of this page.", true);
      return;
    }

    // Which story is this for, and did they tick "Post anonymously"?
    const arcId = form.closest("article").id;
    const postAnonymously = anonymousBox ? anonymousBox.checked : false;

    // Stop double-taps while we wait for the database
    postButton.disabled = true;
    postButton.textContent = "Posting…";

    // Save it. The database adds their name (or "Anonymous") by itself
    const { error } = await db
      .from("comments")
      .insert({ arc_id: arcId, body: text, anonymous: postAnonymously });

    postButton.disabled = false;
    postButton.textContent = "Post";

    if (error) {
      console.error("Couldn't post comment:", error.message);
      showMessage("Something went wrong. Please try again.", true);
      return;
    }

    input.value = "";
    showMessage("Thanks! Your comment will appear once it's reviewed.", false);
  });

  // Hide the message as soon as they start typing again
  input.addEventListener("input", function () {
    message.classList.add("hidden");
  });

});
// ---------- Database: load saved comments (Arcs page) ----------

const SUPABASE_URL = "https://qbehfkxbncxkkwyihpqh.supabase.co";
const SUPABASE_KEY = "sb_publishable_Lg0Y1qhgdlNd8WtCm04PwA_PJUKqI7_";

// Only connect on pages that loaded the Supabase library
let db = null;
if (window.supabase) {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function loadComments() {
  if (!db) {
    return;
  }

  // Ask the database for every approved comment, oldest first
  const { data, error } = await db
    .from("comments")
    .select("arc_id, body")
    .order("created_at");

  if (error) {
    console.error("Couldn't load comments:", error.message);
    return;
  }

  // Put each comment under the story it belongs to
  data.forEach(function (comment) {
    const story = document.getElementById(comment.arc_id);
    if (!story) {
      return;
    }

    const item = document.createElement("li");
    item.textContent = comment.body;
    story.querySelector(".comment-list").appendChild(item);
  });
}

loadComments();
async function loadComments() {
  if (!db) {
    return;
  }

  // Ask the database for every approved comment, oldest first
  const { data, error } = await db
    .from("comments")
    .select("arc_id, body, author_name")
    .order("created_at");

  if (error) {
    console.error("Couldn't load comments:", error.message);
    return;
  }

  // Put each comment under the story it belongs to
  data.forEach(function (comment) {
    const story = document.getElementById(comment.arc_id);
    if (!story) {
      return;
    }

    // The name, in gold
    const name = document.createElement("span");
    name.className = "comment-author";
    name.textContent = comment.author_name || "Member";

    // The comment itself
    const words = document.createElement("p");
    words.className = "comment-body";
    words.textContent = comment.body;

    const item = document.createElement("li");
    item.appendChild(name);
    item.appendChild(words);
    story.querySelector(".comment-list").appendChild(item);
  });
}

// Show "Signed in as ___" at the top of the Arcs page
async function showAccountStatus() {
  const status = document.getElementById("account-status");

  if (!status || !db) {
    return;
  }

  const sessionResult = await db.auth.getSession();
  const session = sessionResult.data.session;

  // Not signed in: leave the "Sign in to comment" link as it is
  if (!session) {
    return;
  }

  const profileResult = await db
    .from("profiles")
    .select("display_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileResult.data;
  const link = document.createElement("a");
  link.href = "account.html";

  if (profile) {
    status.textContent = "Signed in as " + profile.display_name + " · ";
    link.textContent = "Account";
  } else {
    status.textContent = "You're signed in. ";
    link.textContent = "Choose your display name";
  }

  status.appendChild(link);
}

loadComments();
showAccountStatus();
