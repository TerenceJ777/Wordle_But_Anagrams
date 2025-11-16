// UI Elements
const scrambledEl = document.getElementById("scrambled");
const userInput = document.getElementById("userInput");
const submitBtn = document.getElementById("submitBtn");
const messageEl = document.getElementById("message");
const resultsEl = document.getElementById("results");

// When the host starts the game, lobby.js sends game data here
window.addEventListener("gameStateUpdate", (event) => {
    const { scrambled } = event.detail;

    scrambledEl.textContent = scrambled;
    userInput.disabled = false;
    submitBtn.disabled = false;
    messageEl.textContent = "";
    resultsEl.textContent = "Game started! Enter words.";
});

// Submit a word
submitBtn.addEventListener("click", () => {
    const word = userInput.value.trim().toUpperCase();
    userInput.value = "";

    if (!word) return;

    messageEl.textContent = "";
    resultsEl.textContent += `You submitted: ${word}\n`;
});

// Allow Enter key
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitBtn.click();
});

console.log("script.js loaded");
