let dictionary = []; // will be loaded from dictionary.txt

const scrambledDiv = document.getElementById("scrambled");
const input = document.getElementById("userInput");
const submitBtn = document.getElementById("submitBtn");
const startBtn = document.getElementById("startBtn");
const resultsDiv = document.getElementById("results");
const messageDiv = document.getElementById("message");

let gameLetters = [];
let gameOriginalWord = "";
let foundWords = new Set();
let timerId;

// Load dictionary.txt
async function loadDictionary() {
    try {
        const response = await fetch("dictionary.txt");
        const text = await response.text();
        dictionary = text
            .split(/\r?\n/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length > 0);

        console.log("Dictionary loaded:", dictionary.length, "words");
    } catch (err) {
        console.error("Error loading dictionary:", err);
    }
}

// Pick and scramble a 6-letter word
function pickLettersFromWord() {
    const sixLetterWords = dictionary.filter(w => w.length === 6);
    const randomIndex = Math.floor(Math.random() * sixLetterWords.length);
    gameOriginalWord = sixLetterWords[randomIndex];
    const letters = gameOriginalWord.split('');

    // Shuffle letters
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    gameLetters = letters;
    scrambledDiv.textContent = "Scrambled letters: " + letters.join(" ");
}

// Check if a word can be formed with the letters
function canFormWord(word, letters) {
    const available = [...letters];
    for (let char of word) {
        const index = available.indexOf(char);
        if (index === -1) return false;
        available.splice(index, 1);
    }
    return true;
}

// Start game
function startGame() {
    if (!dictionary.length) {
        messageDiv.textContent = "Dictionary not loaded yet!";
        return;
    }

    foundWords.clear();
    messageDiv.textContent = "";
    resultsDiv.textContent = "";

    pickLettersFromWord();

    input.disabled = false;
    submitBtn.disabled = false;
    input.value = "";
    input.focus();

    startBtn.disabled = true;

    timerId = setTimeout(() => {
        endGame();
    }, 30000);
}

// End game
function endGame() {
    input.disabled = true;
    submitBtn.disabled = true;
    startBtn.disabled = false;

    // Count words by length
    const counts = {};
    for (let word of foundWords) {
        const len = word.length;
        counts[len] = (counts[len] || 0) + 1;
    }

    // All possible words
    const possibleWords = dictionary
        .filter(w => canFormWord(w, gameLetters))
        .sort((a, b) => b.length - a.length || a.localeCompare(b));

    // Display results
    let output = "Time's up!\n\n";
    output += "Word counts by length:\n";
    for (let i = 1; i <= 6; i++) {
        output += `length ${i}: ${counts[i] || 0}\n`;
    }

    output += `\nYour words:\n${[...foundWords].join(', ') || 'None'}\n\n`;
    output += "All possible words:\n" + possibleWords.join(', ');

    resultsDiv.textContent = output;
    messageDiv.textContent = "Game over!";
}

// Allow Enter key to submit
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        submitBtn.click();
    }
});

// Handle submit
submitBtn.addEventListener("click", () => {
    const word = input.value.trim().toUpperCase();
    if (!word) return;

    // Word already entered
    if (foundWords.has(word)) {
        messageDiv.textContent = "Already entered that word!";
        input.value = "";
        input.focus();
        return;
    }

    // Uses letters incorrectly
    if (!canFormWord(word, gameLetters)) {
        messageDiv.textContent = "Invalid word (uses letters incorrectly)!";
        input.value = "";
        input.focus();
        return;
    }

    // Not in dictionary
    if (!dictionary.includes(word)) {
        messageDiv.textContent = "Not a valid dictionary word!";
        input.value = "";
        input.focus();
        return;
    }

    // Valid
    foundWords.add(word);
    messageDiv.textContent = "Accepted: " + word;

    input.value = "";
    input.focus();
});

// Start button event
startBtn.addEventListener("click", startGame);

// Load dictionary when page loads
window.addEventListener("load", loadDictionary);