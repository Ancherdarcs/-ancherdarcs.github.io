// ---------- Account page: sign in, choose a name, sign out ----------
// This file only runs on account.html. It uses "db" from main.js,
// so main.js must be loaded first.

const signedOutCard = document.getElementById("signed-out");
const chooseNameCard = document.getElementById("choose-name");
const signedInCard = document.getElementById("signed-in");

const emailForm = document.getElementById("email-form");
const emailInput = document.getElementById("email-input");
const emailMessage = document.getElementById("email-message");

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const nameMessage = document.getElementById("name-message");

const welcomeName = document.getElementById("welcome-name");
const signOutButton = document.getElementById("sign-out");

// Show exactly one of the three cards, hide the other two
function showCard(cardToShow) {
  const allCards = [signedOutCard, chooseNameCard, signedInCard];

  allCards.forEach(function (card) {
    card.classList.add("hidden");
  });

  cardToShow.classList.remove("hidden");
}

// Show a short message under a form: gold for good news, red for problems
function showNote(element, text, isError) {
  element.textContent = text;
  element.classList.remove("hidden");
  element.classList.toggle("is-error", isError);
}

// Work out which card to show
async function refreshAccount() {
  if (!db) {
    showNote(emailMessage, "Sign-in isn't connected right now. Please try again later.", true);
    return;
  }

  // 1. Are they signed in?
  const sessionResult = await db.auth.getSession();
  const session = sessionResult.data.session;

  if (!session) {
    showCard(signedOutCard);
    return;
  }

  // 2. Signed in. Have they chosen a name yet?
  const profileResult = await db
    .from("profiles")
    .select("display_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const profile = profileResult.data;

  if (!profile) {
    showCard(chooseNameCard);
    return;
  }

  // 3. All set
  welcomeName.textContent = profile.display_name;
  showCard(signedInCard);
}

// Card 1: email them a sign-in link
emailForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const button = emailForm.querySelector("button");

  button.disabled = true;
  button.textContent = "Sending…";

  const result = await db.auth.signInWithOtp({
    email: email,
    options: {
      // After they tap the link in their email, bring them back to this page
      emailRedirectTo: window.location.origin + window.location.pathname
    }
  });

  button.disabled = false;
  button.textContent = "Send me a link";

  if (result.error) {
    console.error("Couldn't send link:", result.error.message);
    showNote(emailMessage, "Couldn't send the link. Check your email address and try again.", true);
    return;
  }

  showNote(emailMessage, "Check your email and tap the link. It will bring you right back here, signed in.", false);
});

// Card 2: save the name they chose
nameForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();

  if (name === "") {
    showNote(nameMessage, "Please enter a name.", true);
    return;
  }

  const sessionResult = await db.auth.getSession();
  const session = sessionResult.data.session;

  const result = await db
    .from("profiles")
    .insert({ id: session.user.id, display_name: name });

  if (result.error) {
    console.error("Couldn't save name:", result.error.message);
    showNote(nameMessage, "Couldn't save your name. Please try again.", true);
    return;
  }

  refreshAccount();
});

// Card 3: sign out
signOutButton.addEventListener("click", async function () {
  await db.auth.signOut();
  refreshAccount();
});

// Run once when the page opens
refreshAccount();
