// Visual feedback effects for game juice

// Create particle explosion
export function createExplosion(x, y, color = "#ff0033", count = 12) {
  const container = document.getElementById("game-canvas");
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "explosion-particle";

    const angle = (Math.PI * 2 * i) / count;
    const distance = 50 + Math.random() * 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty("--tx", tx + "px");
    particle.style.setProperty("--ty", ty + "px");
    particle.style.setProperty("--color", color);

    container.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
  }
}

// Create coin sparkles
export function createCoinSparkles(x, y, count = 5) {
  const container = document.getElementById("game-canvas");
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "coin-sparkle";

    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 40;

    sparkle.style.left = (x + offsetX) + "px";
    sparkle.style.top = (y + offsetY) + "px";

    container.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 800);
  }
}

// Create rising text feedback
export function createRisingText(x, y, text, color = "#ffd700") {
  const container = document.getElementById("game-canvas");
  if (!container) return;

  const textElement = document.createElement("div");
  textElement.className = "rising-text";
  textElement.textContent = text;
  textElement.style.left = x + "px";
  textElement.style.top = y + "px";
  textElement.style.color = color;

  container.appendChild(textElement);

  setTimeout(() => textElement.remove(), 1000);
}

// Screen shake effect
export function screenShake() {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;

  canvas.classList.add("screen-shake");
  setTimeout(() => canvas.classList.remove("screen-shake"), 400);
}

// Damage flash
export function damageFlash() {
  let flash = document.getElementById("damage-flash");

  if (!flash) {
    flash = document.createElement("div");
    flash.id = "damage-flash";
    const canvas = document.getElementById("game-canvas");
    if (canvas) canvas.appendChild(flash);
  }

  flash.classList.remove("damage-flash-active");
  // Force reflow
  void flash.offsetWidth;
  flash.classList.add("damage-flash-active");

  setTimeout(() => flash.classList.remove("damage-flash-active"), 600);
}

// Success flash
export function successFlash() {
  let flash = document.getElementById("success-flash");

  if (!flash) {
    flash = document.createElement("div");
    flash.id = "success-flash";
    const canvas = document.getElementById("game-canvas");
    if (canvas) canvas.appendChild(flash);
  }

  flash.classList.remove("success-flash-active");
  // Force reflow
  void flash.offsetWidth;
  flash.classList.add("success-flash-active");

  setTimeout(() => flash.classList.remove("success-flash-active"), 500);
}

// Balloon pop animation
export function balloonPopAnimation(balloonElement) {
  if (!balloonElement) return;

  balloonElement.classList.add("balloon-pop");
  setTimeout(() => {
    if (balloonElement.parentNode) {
      balloonElement.remove();
    }
  }, 300);
}

// Enemy explosion animation
export function enemyExplosionAnimation(enemyElement, x, y) {
  if (!enemyElement) return;

  enemyElement.classList.add("enemy-explode");

  // Create colorful explosion particles
  createExplosion(x, y, "#ff0033", 16);
  createExplosion(x, y, "#ffff00", 12);
  createExplosion(x, y, "#00ff00", 8);

  setTimeout(() => {
    if (enemyElement.parentNode) {
      enemyElement.remove();
    }
  }, 600);
}

// Squash and stretch for player balloon
export function balloonSquash(balloonElement) {
  if (!balloonElement) return;

  balloonElement.classList.remove("balloon-squash");
  // Force reflow
  void balloonElement.offsetWidth;
  balloonElement.classList.add("balloon-squash");

  setTimeout(() => balloonElement.classList.remove("balloon-squash"), 300);
}

// Add rising class to player balloon and create particle trail
let risingParticleInterval = null;

export function setPlayerRising(isRising) {
  const playerBalloon = document.getElementById("player-balloon");
  if (!playerBalloon) return;

  if (isRising) {
    playerBalloon.classList.add("rising");

    // Create particle trail effect while rising
    if (!risingParticleInterval) {
      risingParticleInterval = setInterval(() => {
        const player = document.getElementById("player-balloon");
        if (player) {
          const rect = player.getBoundingClientRect();
          const canvas = document.getElementById("game-canvas");
          if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            const x = rect.left + rect.width / 2 - canvasRect.left;
            const y = rect.top + rect.height - canvasRect.top;

            // Create small sparkle particles below balloon
            for (let i = 0; i < 2; i++) {
              const particle = document.createElement("div");
              particle.className = "rising-particle";
              particle.style.left = (x + (Math.random() - 0.5) * 30) + "px";
              particle.style.top = y + "px";
              particle.style.width = (3 + Math.random() * 4) + "px";
              particle.style.height = (3 + Math.random() * 4) + "px";
              particle.style.background = `rgba(0, ${200 + Math.random() * 55}, 255, ${0.5 + Math.random() * 0.5})`;

              canvas.appendChild(particle);
              setTimeout(() => particle.remove(), 600);
            }
          }
        }
      }, 50);
    }
  } else {
    playerBalloon.classList.remove("rising");

    // Stop particle trail
    if (risingParticleInterval) {
      clearInterval(risingParticleInterval);
      risingParticleInterval = null;
    }
  }
}

// Coin counter bounce
export function coinBounce() {
  const coinCounter = document.querySelector(".resource-item");
  if (!coinCounter) return;

  coinCounter.classList.remove("coin-bounce");
  void coinCounter.offsetWidth;
  coinCounter.classList.add("coin-bounce");

  setTimeout(() => coinCounter.classList.remove("coin-bounce"), 300);
}

// Health display shake
export function healthShake() {
  const healthDisplay = document.querySelectorAll(".resource-item")[1]; // Second resource item is health
  if (!healthDisplay) return;

  healthDisplay.classList.remove("health-shake");
  void healthDisplay.offsetWidth;
  healthDisplay.classList.add("health-shake");

  setTimeout(() => healthDisplay.classList.remove("health-shake"), 200);
}

// Energy bar glow when full
export function updateEnergyGlow(isFull) {
  const energyBar = document.getElementById("energy-bar-fill");
  if (!energyBar) return;

  if (isFull) {
    energyBar.classList.add("full");
  } else {
    energyBar.classList.remove("full");
  }
}

// Shop button affordable animation
export function updateShopAffordable(canAfford) {
  const shopBtn = document.getElementById("shop-btn");
  if (!shopBtn) return;

  if (canAfford) {
    shopBtn.classList.add("affordable");
  } else {
    shopBtn.classList.remove("affordable");
  }
}

// Milestone celebration badge
export function showMilestoneBadge(text, duration = 2000) {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;

  const badge = document.createElement("div");
  badge.className = "milestone-badge";
  badge.textContent = text;

  canvas.appendChild(badge);

  setTimeout(() => badge.remove(), duration);
}

// Layer transition effect
export function layerTransition(layerIndex) {
  const layer = document.getElementById(`cloud-layer-${layerIndex + 1}`);
  if (!layer) return;

  layer.classList.add("transitioning");
  setTimeout(() => layer.classList.remove("transitioning"), 1000);
}
