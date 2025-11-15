// Trophy Manager - handles trophy data, unlocking, and persistence

import { audioManager } from "./audio-manager.js";

// Trophy definitions
const TROPHIES = [
  {
    id: "just-checking",
    name: "Just Checking",
    icon: "images/plasma.png",
    requirement: 'Open and close the "How to Play" modal 3 times',
    flavorText: "Triple-checking the manual. A true professional.",
    unlocked: false,
  },
  {
    id: "is-this-thing-on",
    name: "Is This Thing On?",
    icon: "images/icon-musicnote.png",
    requirement: "Toggle the audio on and off 5 times.",
    flavorText: "Testing, testing... 1, 2, 3.",
    unlocked: false,
  },
];

// Local storage key
const STORAGE_KEY = "hotairbaloon_trophies";
const STATS_KEY = "hotairbaloon_trophyStats";

// Trophy progress tracking
let trophyStats = {
  htpOpens: 0,
  audioToggles: 0,
  logoClicked: false,
  pausedDuringTimewarp: false,
  eyeballShowerSeen: false,
  timeWarpsCompleted: 0,
  viewedFullStory: false,
  fight1Completed: false,
  crystalDepleted: false,
  level1NoHits: false,
  storyModeNoHits: false,
  robotSpinsDuringTimewarpPause: 0,
  pausedOnWinScreen: false,
  pausedOnLoseScreen: false,
  selectedTryAgain: false,
};

// Initialize trophy system
export function initTrophyManager() {
  loadTrophyData();
  loadTrophyStats();
}

// Load trophy unlock status from localStorage
function loadTrophyData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const unlockedIds = JSON.parse(saved);
      TROPHIES.forEach((trophy) => {
        trophy.unlocked = unlockedIds.includes(trophy.id);
      });
    }
  } catch (e) {
    console.error("Failed to load trophy data:", e);
  }
}

// Save trophy unlock status to localStorage
function saveTrophyData() {
  try {
    const unlockedIds = TROPHIES.filter((t) => t.unlocked).map((t) => t.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
  } catch (e) {
    console.error("Failed to save trophy data:", e);
  }
}

// Load trophy stats from localStorage
function loadTrophyStats() {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      trophyStats = { ...trophyStats, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load trophy stats:", e);
  }
}

// Save trophy stats to localStorage
function saveTrophyStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(trophyStats));
  } catch (e) {
    console.error("Failed to save trophy stats:", e);
  }
}

// Get all trophies
export function getTrophies() {
  return TROPHIES;
}

// Unlock a trophy by ID
function unlockTrophy(trophyId) {
  const trophy = TROPHIES.find((t) => t.id === trophyId);
  if (trophy && !trophy.unlocked) {
    trophy.unlocked = true;
    saveTrophyData();
    showTrophyUnlockedNotification(trophy);
    return true;
  }
  return false;
}

// Show trophy unlocked notification
function showTrophyUnlockedNotification(trophy) {
  // Play trophy award sound
  audioManager.playSoundEffect("trophyAward");

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "trophy-notification";
  notification.innerHTML = `
    <div class="trophy-notification-content">
      <div class="trophy-notification-header">TROPHY UNLOCKED!</div>
      <div class="trophy-notification-body">
        <img src="${trophy.icon}" alt="${trophy.name}" class="trophy-notification-icon" />
        <div class="trophy-notification-text">
          <div class="trophy-notification-name">${trophy.name}</div>
          <div class="trophy-notification-flavor">${trophy.flavorText}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Animate out after 4 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 4000);
}

// Trophy tracking functions

// Track How to Play modal opens
export function trackHTPOpen() {
  trophyStats.htpOpens++;
  saveTrophyStats();

  if (trophyStats.htpOpens >= 3) {
    unlockTrophy("just-checking");
  }
}

// Track audio toggles
export function trackAudioToggle() {
  trophyStats.audioToggles++;
  saveTrophyStats();

  if (trophyStats.audioToggles >= 5) {
    unlockTrophy("is-this-thing-on");
  }
}

// Get trophy stats (for debugging)
export function getTrophyStats() {
  return trophyStats;
}
