// ------------------------------
// Firebase Setup
// ------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// TODO: replace with YOUR Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsE_KCyysfIURhNgZFfE1NtceofSk1FJs",
  authDomain: "wordleanagrams.firebaseapp.com",
  projectId: "wordleanagrams",
  databaseURL: "https://wordleanagrams-default-rtdb.firebaseio.com/",
  storageBucket: "wordleanagrams.firebasestorage.app",
  messagingSenderId: "1091340843484",
  appId: "1:1091340843484:web:21a9aae03ecbfb90fe7719",
  measurementId: "G-G89277TZWL"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// ------------------------------
// Lobby Globals
// ------------------------------
export let lobbyCode = null;
export let isHost = false;

// UI Elements
const createBtn = document.getElementById("createLobbyBtn");
const joinBtn = document.getElementById("joinLobbyBtn");
const lobbyInput = document.getElementById("lobbyInput");
const lobbyStatus = document.getElementById("lobbyStatus");
const startBtn = document.getElementById("startBtn");

// ------------------------------
// Create Lobby
// ------------------------------
createBtn.addEventListener("click", async () => {
    lobbyCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    isHost = true;

    await set(ref(db, "lobbies/" + lobbyCode), {
        host: true,
        players: {
            [crypto.randomUUID()]: { joined: Date.now() }
        },
        gameState: null
    });

    lobbyStatus.textContent = "Created lobby: " + lobbyCode;
    startBtn.disabled = false;

    subscribeToLobby();
});

// ------------------------------
// Join Lobby
// ------------------------------
joinBtn.addEventListener("click", async () => {
    const code = lobbyInput.value.trim().toUpperCase();
    if (!code) return;

    const lobbyRef = ref(db, "lobbies/" + code);
    const snapshot = await get(lobbyRef);

    if (!snapshot.exists()) {
        lobbyStatus.textContent = "Lobby does not exist!";
        return;
    }

    lobbyCode = code;
    isHost = false;

    // Add player
    const playerId = crypto.randomUUID();
    await update(ref(db, "lobbies/" + lobbyCode + "/players"), {
        [playerId]: { joined: Date.now() }
    });

    lobbyStatus.textContent = "Joined lobby: " + lobbyCode;
    startBtn.disabled = true;

    subscribeToLobby();
});

// ------------------------------
// Listen for game events
// ------------------------------
function subscribeToLobby() {
    const stateRef = ref(db, "lobbies/" + lobbyCode + "/gameState");

    onValue(stateRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Send gameState to the single-player script
        window.dispatchEvent(new CustomEvent("gameStateUpdate", { detail: data }));
    });
}

// ------------------------------
// Host: Start Game
// ------------------------------
startBtn.addEventListener("click", async () => {
    if (!isHost) return;

    const letters = generateScramble();

    await update(ref(db, "lobbies/" + lobbyCode), {
        gameState: {
            scrambled: letters,
        }
    });
});

// Scramble random 6 letters
function generateScramble() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
}

console.log("Lobby.js loaded");
