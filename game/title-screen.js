// Title Screen Module - manages the main menu

import { initGame } from "./combat.js";
import { audioManager } from "./audio-manager.js";
import { HowToPlay } from "./how-to-play.js";
import {
  initTrophyManager,
  getTrophies,
  trackHTPOpen,
  trackAudioToggle,
} from "./trophy-manager.js";

// Cache DOM elements
const elements = {
  titleScreen: document.getElementById("title-screen"),
  game: document.getElementById("game"),
  startBtn: document.getElementById("start-btn"),
  htpBtn: document.getElementById("htp-btn"),
  trophyBtn: document.getElementById("trophy-btn"),
  title: document.getElementById("title"),
  audioToggleTitle: document.getElementById("audio-toggle-title"),
};

// Initialize How to Play modal
let howToPlayModal;

// Helper function to add both click and touch event listeners
function addTouchAndClickListener(element, handler) {
  let touchHandled = false;

  // Add touchstart listener to track touch events
  element.addEventListener("touchstart", () => {
    touchHandled = true;
  });

  // Add touchend listener for touch devices
  element.addEventListener("touchend", (e) => {
    if (touchHandled) {
      e.preventDefault(); // Prevent ghost click
      handler(e);
      // Reset flag after a short delay
      setTimeout(() => {
        touchHandled = false;
      }, 500);
    }
  });

  // Add click listener for mouse/desktop
  element.addEventListener("click", (e) => {
    // Only handle click if it wasn't preceded by a touch
    if (!touchHandled) {
      handler(e);
    }
  });
}

// Reset title screen to initial state - call before initTitleScreen when returning from game
export function resetTitleScreen() {
  // Reset the title element to its original state
  elements.title.innerHTML = "HOT AIR BALLOON ESCAPES TO SPACE";
  elements.title.style.animation = "none";
  elements.title.style.marginBottom = "";
  elements.title.style.cursor = "";

  // Remove any existing event listeners from title
  elements.title.replaceWith(elements.title.cloneNode(true));
  // Update the cached reference after cloning
  elements.title = document.getElementById("title");
}

// Initialize title screen
export function initTitleScreen() {
  // Initialize How to Play modal
  howToPlayModal = new HowToPlay();

  // Initialize trophy system
  initTrophyManager();
  setupTrophyPopup();

  setupEventListeners();
  // Activate colorful background for title screen
  document.body.classList.add("title-active");

  // Play the intro audio immediately
  audioManager.play("titleIntro");
}

// Setup event listeners
function setupEventListeners() {
  // Add click and touch listeners with sound effects
  addTouchAndClickListener(elements.startBtn, onStartGame);
  addTouchAndClickListener(elements.htpBtn, onHowToPlay);
  addTouchAndClickListener(elements.trophyBtn, onTrophyClick);
  addTouchAndClickListener(elements.audioToggleTitle, () => {
    audioManager.playSoundEffect("btnClick");
    toggleAudio();
  });

  // Add hover sound effects to all clickable buttons
  [
    elements.startBtn,
    elements.htpBtn,
    elements.trophyBtn,
    elements.audioToggleTitle,
  ].forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      audioManager.playSoundEffect("btnHover");
    });
  });
}

// Handle start game button
function onStartGame() {
  audioManager.playSoundEffect("btnClick");
  elements.titleScreen.style.display = "none";
  elements.game.style.display = "block";
  // Remove colorful background when entering game
  document.body.classList.remove("combat-active"); // Clean up just in case
  document.body.classList.remove("title-active");
  initGame(false);
  // Show pause button on game start
  document.getElementById("pause").style.display = "block";
}

// Handle how to play button
function onHowToPlay() {
  audioManager.playSoundEffect("btnHover");
  howToPlayModal.open();
  trackHTPOpen();
}

// Handle trophy button
function onTrophyClick() {
  audioManager.playSoundEffect("btnClick");
  openTrophyPopup();
}

// Toggle audio on/off
function toggleAudio() {
  const isMuted = audioManager.toggleMute();
  // Update button visual state
  elements.audioToggleTitle.style.opacity = isMuted ? "0.5" : "1";
  trackAudioToggle();
}

// Setup trophy popup
function setupTrophyPopup() {
  const trophyPopup = document.getElementById("trophy-popup");
  const trophyDetailPopup = document.getElementById("trophy-detail-popup");
  const overlay = document.getElementById("overlay");
  const closeTrophy = document.getElementById("close-trophy");
  const closeTrophyDetail = document.getElementById("close-trophy-detail");

  // Close trophy popup
  addTouchAndClickListener(closeTrophy, () => {
    audioManager.playSoundEffect("btnClick");
    trophyDetailPopup.style.display = "none"; // Also close detail popup
    trophyPopup.style.display = "none";
    overlay.style.display = "none";
  });

  // Close trophy detail popup
  addTouchAndClickListener(closeTrophyDetail, () => {
    audioManager.playSoundEffect("btnClick");
    trophyDetailPopup.style.display = "none";
  });

  // Close on overlay click
  addTouchAndClickListener(overlay, () => {
    if (trophyPopup.style.display === "block") {
      audioManager.playSoundEffect("btnClick");
      trophyDetailPopup.style.display = "none"; // Also close detail popup
      trophyPopup.style.display = "none";
      overlay.style.display = "none";
    }
  });
}

// Open trophy popup
function openTrophyPopup() {
  const trophyPopup = document.getElementById("trophy-popup");
  const overlay = document.getElementById("overlay");
  const trophyGrid = document.getElementById("trophy-grid");

  // Clear existing trophies
  trophyGrid.innerHTML = "";

  // Get all trophies
  const trophies = getTrophies();

  // Create trophy items
  trophies.forEach((trophy) => {
    const trophyItem = document.createElement("div");
    trophyItem.className = `trophy-item ${
      trophy.unlocked ? "unlocked" : "locked"
    }`;

    const icon = trophy.unlocked ? trophy.icon : "images/icon-questionmark.png";

    trophyItem.innerHTML = `
      <img src="${icon}" alt="${trophy.unlocked ? trophy.name : "Locked"}" />
    `;

    addTouchAndClickListener(trophyItem, () => {
      audioManager.playSoundEffect("btnClick");
      showTrophyDetail(trophy);
    });

    trophyGrid.appendChild(trophyItem);
  });

  // Show popup
  audioManager.playSoundEffect("popupAppear");
  trophyPopup.style.display = "block";
  overlay.style.display = "block";
}

// Show trophy detail popup
function showTrophyDetail(trophy) {
  const detailPopup = document.getElementById("trophy-detail-popup");
  const detailIcon = document.getElementById("trophy-detail-icon");
  const detailName = document.getElementById("trophy-detail-name");
  const detailRequirement = document.getElementById(
    "trophy-detail-requirement"
  );
  const detailFlavor = document.getElementById("trophy-detail-flavor");

  // Set content
  detailIcon.src = trophy.unlocked
    ? trophy.icon
    : "images/icon-questionmark.png";
  detailName.textContent = trophy.unlocked ? trophy.name : "???";
  detailRequirement.textContent = trophy.requirement;

  if (trophy.unlocked) {
    detailFlavor.textContent = trophy.flavorText;
    detailFlavor.classList.remove("locked");
  } else {
    detailFlavor.textContent = "";
    detailFlavor.classList.add("locked");
  }

  // Show detail popup
  detailPopup.style.display = "block";
}
