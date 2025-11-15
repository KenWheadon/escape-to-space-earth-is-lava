// Onboarding Module - handles first-time tutorial popups for the game

// Cache DOM elements - will be initialized on first use
let elements = null;

function getElements() {
  if (!elements) {
    elements = {
      overlay: document.getElementById("overlay"),
      popup: document.getElementById("onboarding-popup"),
      content: document.getElementById("onboarding-content"),
      title: document.getElementById("onboarding-title"),
      text: document.getElementById("onboarding-text"),
      closeBtn: document.getElementById("onboarding-close"),
    };
  }
  return elements;
}

// Storage keys for tracking which messages have been shown
const ONBOARDING_STORAGE_KEY = "hot-air-balloon-onboarding-flags";

// Onboarding message types
export const ONBOARDING_MESSAGES = {
  GOLDEN_BALLOONS: "goldenBalloons",
  FIRST_UPGRADE: "firstUpgrade",
  SHOP_OPENED: "shopOpened",
  ENERGY_REACHED: "energyReached",
  FIRST_ENEMY: "firstEnemy",
  SECOND_LAYER: "secondLayer",
  LAVA_WARNING: "lavaWarning",
};

// Message content
const MESSAGE_CONTENT = {
  [ONBOARDING_MESSAGES.GOLDEN_BALLOONS]: {
    title: "Collect Coins!",
    text: "Click on golden balloons to collect them",
  },
  [ONBOARDING_MESSAGES.FIRST_UPGRADE]: {
    title: "Upgrade Time!",
    text: "Spend your coins on upgrades for your balloon",
  },
  [ONBOARDING_MESSAGES.SHOP_OPENED]: {
    title: "Energy Building",
    text: "Buy the energy building to build up the energy needed to escape the lava",
  },
  [ONBOARDING_MESSAGES.ENERGY_REACHED]: {
    title: "Use Energy!",
    text: "Click and hold on your balloon to spend energy to go up!",
  },
  [ONBOARDING_MESSAGES.FIRST_ENEMY]: {
    title: "Enemy Spotted!",
    text: "Buy the auto-attack to fight back or use energy to escape",
  },
  [ONBOARDING_MESSAGES.SECOND_LAYER]: {
    title: "Journey to Space",
    text: "Travel through all 4 layers to reach space and escape",
  },
  [ONBOARDING_MESSAGES.LAVA_WARNING]: {
    title: "Lava Rising!",
    text: "Use energy to go up to avoid the lava",
  },
};

// Current callback for when popup closes
let onCloseCallback = null;

// Track if event listeners have been initialized
let eventListenersInitialized = false;

// Callback to pause/unpause game
let pauseGameCallback = null;

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

// Initialize onboarding system
export function initOnboarding(pauseCallback) {
  // Only add event listeners once to prevent duplicates
  if (eventListenersInitialized) return;

  pauseGameCallback = pauseCallback;

  const els = getElements();
  addTouchAndClickListener(els.closeBtn, closePopup);
  addTouchAndClickListener(els.overlay, closePopup);

  eventListenersInitialized = true;
}

// Get onboarding flags from localStorage
function getOnboardingFlags() {
  const flags = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  return flags ? JSON.parse(flags) : {};
}

// Mark an onboarding message as seen
function markMessageAsSeen(messageType) {
  const flags = getOnboardingFlags();
  flags[messageType] = true;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(flags));
}

// Check if a message has been seen
function hasSeenMessage(messageType) {
  const flags = getOnboardingFlags();
  return flags[messageType] === true;
}

// Show onboarding message if not seen before
export function showOnboardingMessage(messageType, callback) {
  // Check if this message has already been shown
  if (hasSeenMessage(messageType)) {
    if (callback) callback();
    return false;
  }

  const content = MESSAGE_CONTENT[messageType];
  if (!content) {
    console.warn(`Unknown onboarding message type: ${messageType}`);
    if (callback) callback();
    return false;
  }

  // Pause the game
  if (pauseGameCallback) {
    pauseGameCallback(true);
  }

  // Store the callback to run when popup closes
  onCloseCallback = callback;

  const els = getElements();

  // Set content
  els.title.textContent = content.title;
  els.text.textContent = content.text;

  // Show popup
  els.overlay.style.display = "block";
  els.popup.style.display = "block";

  // Mark as seen
  markMessageAsSeen(messageType);

  return true;
}

// Close popup
function closePopup() {
  const els = getElements();
  els.overlay.style.display = "none";
  els.popup.style.display = "none";

  // Resume the game
  if (pauseGameCallback) {
    pauseGameCallback(false);
  }

  // Run the callback if exists
  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }
}

// Reset all onboarding progress (for testing)
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
