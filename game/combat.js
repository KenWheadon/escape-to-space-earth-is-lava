// Hot Air Balloon Escape to Space - Complete Game

import { audioManager } from "./audio-manager.js";
import { GameOverScreen } from "./game-over-screen.js";
import { GAME_CONFIG } from "./config.js";

// Game state
let gameState = {
  gameStartTime: null,
  totalPausedTime: 0,
  lastPauseTime: null,
  isPaused: false,

  // Player state
  player: {
    x: GAME_CONFIG.PLAYER_HORIZONTAL_CENTER,
    y: GAME_CONFIG.PLAYER_START_Y,
    altitude: 0, // Actual altitude in meters
    health: GAME_CONFIG.PLAYER_START_HEALTH,
    maxHealth: GAME_CONFIG.PLAYER_START_HEALTH,
    sineOffset: 0,
  },

  // Resources
  coins: 0,
  energy: GAME_CONFIG.ENERGY_START,

  // Input
  isHoldingBalloon: false,

  // Lava
  lavaY: GAME_CONFIG.LAVA_START_Y,

  // Collections
  goldenBalloons: [],
  enemies: [],
  lasers: [],

  // Timers
  lastGoldenBalloonSpawn: 0,
  lastEnemySpawn: 0,
  lastEnemyLaserTime: 0,
  lastAttackTime: 0,
  lastGoldProduction: 0,

  // Upgrades
  buildings: {
    GOLD_PRODUCTION: 0,
    AUTO_ATTACK: 0,
    HEALTH: 0,
    MAGNET_STRENGTH: 0,
    BALLOON_VALUE: 0,
    ENERGY_PRODUCTION: 0,
  },

  // Shop state
  shopOpen: false,
};

// Game over screen manager
let gameOverScreen = null;

// Track if event listeners have been initialized
let eventListenersInitialized = false;

// Animation frame
let animationFrameId = null;

// Helper function to add both click and touch event listeners
function addTouchAndClickListener(element, handler) {
  let touchHandled = false;

  element.addEventListener("touchstart", () => {
    touchHandled = true;
  });

  element.addEventListener("touchend", (e) => {
    if (touchHandled) {
      e.preventDefault();
      handler(e);
      setTimeout(() => {
        touchHandled = false;
      }, 500);
    }
  });

  element.addEventListener("click", (e) => {
    if (!touchHandled) {
      handler(e);
    }
  });
}

// Cache DOM elements
const elements = {
  pause: document.getElementById("pause"),
  pauseOverlay: document.getElementById("pause-overlay"),
  pauseResumeBtn: document.getElementById("pause-resume-btn"),
  pauseQuitBtn: document.getElementById("pause-quit-btn"),
  gameContent: document.getElementById("game-content"),
};

// Create game UI elements
function createGameUI() {
  elements.gameContent.innerHTML = `
    <style>
      .enemy-balloon {
        position: absolute;
        /* other styles */
      }
      .enemy-cooldown-bar-bg {
        position: absolute;
        bottom: -20px; /* Position below the balloon */
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 10px;
        background-color: #333;
        border: 1px solid #555;
        border-radius: 5px;
      }
      .enemy-cooldown-bar-fill {
        width: 0%;
        height: 100%;
        background-color: #ff4500; /* Orange-red color */
        border-radius: 4px;
      }
    </style>
    <div id="game-canvas">
      <!-- Background layers -->
      <div id="background-sky"></div>
      <div id="cloud-layer-4" class="cloud-layer"></div>
      <div id="cloud-layer-3" class="cloud-layer"></div>
      <div id="cloud-layer-2" class="cloud-layer"></div>
      <div id="cloud-layer-1" class="cloud-layer"></div>

      <!-- Game entities container -->
      <div id="game-entities">
        <!-- Entities will be added here -->
      </div>

      <!-- Lava -->
      <div id="lava"></div>

      <!-- Magnet radius indicator -->
      <div id="magnet-radius"></div>

      <!-- Player balloon -->
      <div id="player-balloon">
        <img src="images/hot-air-balloon.png" alt="Player Balloon">
      </div>

      <!-- UI Overlays -->
      <div id="game-ui">
        <!-- Top Left: Shop Button -->
        <button id="shop-btn" class="game-ui-btn">Balloon Shop</button>

        <!-- Top Center: Resources -->
        <div id="resource-display">
          <div class="resource-item">
            <img src="images/coin.png" alt="Coins" class="resource-icon">
            <span id="coin-count">0</span>
          </div>
          <div class="resource-item">
            <img src="images/player-default.png" alt="Health" class="resource-icon">
            <span id="health-count">3/3</span>
          </div>
        </div>

        <!-- Left Side: Energy Bar -->
        <div id="energy-bar-container">
          <div id="energy-bar-label">ENERGY</div>
          <div id="energy-bar-bg">
            <div id="energy-bar-fill"></div>
          </div>
          <div id="energy-bar-text">0/100</div>
        </div>

        <!-- Right Side UI Container -->
        <div id="right-ui-container">
          <!-- Cloud Layer Progress Bar -->
          <div id="cloud-progress-container">
            <div id="cloud-progress-label">LAYER</div>
            <div id="cloud-layer-name">Troposphere</div>
            <div id="cloud-progress-bg">
              <div id="cloud-progress-fill"></div>
            </div>
            <div id="cloud-progress-text">0%</div>
          </div>

          <!-- Altitude Display -->
          <div id="altitude-display">
            <div id="altitude-label">ALTITUDE</div>
            <div id="altitude-value">0m</div>
          </div>
        </div>

        <!-- Dev Buttons -->
        <div id="dev-buttons-container">
          <button id="dev-spawn-enemy-btn" class="dev-btn">Spawn Enemy</button>
          <button id="dev-add-coins-btn" class="dev-btn">Add Coins</button>
        </div>
      </div>
    </div>

    <!-- Shop Panel -->
    <div id="shop-panel" class="shop-panel hidden">
      <div class="shop-content">
        <h2>Balloon Shop</h2>
        <button id="shop-close-btn" class="shop-close-btn">&times;</button>

        <div id="shop-items">
          <!-- Shop items will be generated here -->
        </div>
      </div>
    </div>
  `;

  // Generate shop items
  generateShopItems();
}

// Generate shop items from config
function generateShopItems() {
  const shopItemsContainer = document.getElementById("shop-items");

  Object.keys(GAME_CONFIG.BUILDINGS).forEach((buildingKey) => {
    const building = GAME_CONFIG.BUILDINGS[buildingKey];
    const level = gameState.buildings[buildingKey];
    const cost = calculateBuildingCost(buildingKey);

    const shopItem = document.createElement("div");
    shopItem.className = "shop-item";
    shopItem.innerHTML = `
      <img src="images/${building.image}" alt="${building.name}" class="shop-item-icon">
      <div class="shop-item-info">
        <div class="shop-item-name">${building.name}</div>
        <div class="shop-item-description">${building.description}</div>
        <div class="shop-item-level">Level: <span class="building-level" data-building="${buildingKey}">${level}</span></div>
      </div>
      <button class="shop-buy-btn" data-building="${buildingKey}">
        <img src="images/coin.png" alt="Cost" class="cost-icon">
        <span class="building-cost" data-building="${buildingKey}">${cost}</span>
      </button>
    `;

    shopItemsContainer.appendChild(shopItem);
  });
}

// Calculate building cost based on level
function calculateBuildingCost(buildingKey) {
  const building = GAME_CONFIG.BUILDINGS[buildingKey];
  const level = gameState.buildings[buildingKey];
  return Math.floor(
    building.baseCost * Math.pow(building.costMultiplier, level)
  );
}

// Update shop display
function updateShopDisplay() {
  Object.keys(GAME_CONFIG.BUILDINGS).forEach((buildingKey) => {
    const level = gameState.buildings[buildingKey];
    const cost = calculateBuildingCost(buildingKey);

    const levelElement = document.querySelector(
      `.building-level[data-building="${buildingKey}"]`
    );
    const costElement = document.querySelector(
      `.building-cost[data-building="${buildingKey}"]`
    );
    const buyButton = document.querySelector(
      `.shop-buy-btn[data-building="${buildingKey}"]`
    );

    if (levelElement) levelElement.textContent = level;
    if (costElement) costElement.textContent = cost;

    // Disable button if can't afford
    if (buyButton) {
      buyButton.disabled = gameState.coins < cost;
    }
  });
}

// Purchase building
function purchaseBuilding(buildingKey) {
  const cost = calculateBuildingCost(buildingKey);

  if (gameState.coins >= cost) {
    gameState.coins -= cost;
    gameState.buildings[buildingKey]++;

    // Apply building effects
    if (buildingKey === "HEALTH") {
      gameState.player.maxHealth += GAME_CONFIG.BUILDINGS.HEALTH.healthIncrease;
      gameState.player.health = Math.min(
        gameState.player.health + GAME_CONFIG.BUILDINGS.HEALTH.healthIncrease,
        gameState.player.maxHealth
      );
    }

    audioManager.playSoundEffect("btnClick");
    updateUI();
    updateShopDisplay();
  }
}

// Initialize game
export function initGame() {
  // Clear entity DOM cache
  entityDOMCache.lasers.clear();
  entityDOMCache.goldenBalloons.clear();
  entityDOMCache.enemies.clear();

  // Reset game state
  gameState = {
    gameStartTime: Date.now(),
    totalPausedTime: 0,
    lastPauseTime: null,
    isPaused: false,

    player: {
      x: GAME_CONFIG.PLAYER_HORIZONTAL_CENTER,
      y: GAME_CONFIG.PLAYER_START_Y,
      altitude: 0, // Actual altitude in meters
      health: GAME_CONFIG.PLAYER_START_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER_START_HEALTH,
      sineOffset: 0,
    },

    coins: 0,
    energy: GAME_CONFIG.ENERGY_START,
    isHoldingBalloon: false,
    lavaY: GAME_CONFIG.LAVA_START_Y,
    goldenBalloons: [],
    enemies: [],
    lasers: [],

    lastGoldenBalloonSpawn: 0,
    lastEnemySpawn: Date.now(),
    lastEnemyLaserTime: 0,
    lastAttackTime: 0,
    lastGoldProduction: Date.now(),

    buildings: {
      GOLD_PRODUCTION: 0,
      AUTO_ATTACK: 0,
      HEALTH: 0,
      MAGNET_STRENGTH: 0,
      BALLOON_VALUE: 0,
      ENERGY_PRODUCTION: 0,
    },

    shopOpen: false,
  };

  // Create UI
  createGameUI();

  // Initialize game over screen
  if (!gameOverScreen) {
    gameOverScreen = new GameOverScreen();
    gameOverScreen.onRestart(restartGame);
    gameOverScreen.onMainMenu(quitToMainMenu);
  }

  // Only initialize event listeners once to prevent duplicates
  if (!eventListenersInitialized) {
    addTouchAndClickListener(elements.pause, () => {
      audioManager.playSoundEffect("btnClick");
      togglePause();
    });

    // Pause popup buttons
    addTouchAndClickListener(elements.pauseResumeBtn, () => {
      audioManager.playSoundEffect("btnClick");
      togglePause();
    });

    addTouchAndClickListener(elements.pauseQuitBtn, () => {
      audioManager.playSoundEffect("btnClick");
      quitToMainMenu();
    });

    // Add hover sound effects
    [elements.pause, elements.pauseResumeBtn, elements.pauseQuitBtn].forEach(
      (btn) => {
        btn.addEventListener("mouseenter", () => {
          audioManager.playSoundEffect("btnHover");
        });
      }
    );

    eventListenersInitialized = true;
  }

  // Setup game-specific event listeners
  setupGameEventListeners();

  // Start game audio
  audioManager.play("combat");

  // Activate colorful background for game
  document.body.classList.add("combat-active");

  // Start game loop
  startGameLoop();
}

// Setup game-specific event listeners
function setupGameEventListeners() {
  const playerBalloon = document.getElementById("player-balloon");
  const shopBtn = document.getElementById("shop-btn");
  const shopCloseBtn = document.getElementById("shop-close-btn");
  const entitiesContainer = document.getElementById("game-entities");

  // Player balloon click and hold
  let holdInterval;

  const startHolding = () => {
    gameState.isHoldingBalloon = true;
  };

  const stopHolding = () => {
    gameState.isHoldingBalloon = false;
  };

  playerBalloon.addEventListener("mousedown", startHolding);
  playerBalloon.addEventListener("mouseup", stopHolding);
  playerBalloon.addEventListener("mouseleave", stopHolding);

  playerBalloon.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startHolding();
  });
  playerBalloon.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopHolding();
  });

  // Shop button
  addTouchAndClickListener(shopBtn, () => {
    audioManager.playSoundEffect("btnClick");
    openShop();
  });

  addTouchAndClickListener(shopCloseBtn, () => {
    audioManager.playSoundEffect("btnClick");
    closeShop();
  });

  // Shop buy buttons
  document.addEventListener("click", (e) => {
    if (e.target.closest(".shop-buy-btn")) {
      const button = e.target.closest(".shop-buy-btn");
      const buildingKey = button.dataset.building;
      purchaseBuilding(buildingKey);
    }
  });

  // Golden balloon click handler using event delegation
  entitiesContainer.addEventListener("click", (e) => {
    const balloonEl = e.target.closest(".golden-balloon");
    if (balloonEl) {
      const balloonId = balloonEl.dataset.balloonId;
      if (balloonId) {
        collectBalloonById(parseFloat(balloonId));
      }
    }
  });

  // Touch handler for golden balloons
  entitiesContainer.addEventListener("touchend", (e) => {
    const balloonEl = e.target.closest(".golden-balloon");
    if (balloonEl) {
      e.preventDefault();
      const balloonId = balloonEl.dataset.balloonId;
      if (balloonId) {
        collectBalloonById(parseFloat(balloonId));
      }
    }
  });

  // Dev button to add coins
  const devAddCoinsBtn = document.getElementById("dev-add-coins-btn");
  if (devAddCoinsBtn) {
    addTouchAndClickListener(devAddCoinsBtn, () => {
      gameState.coins += 1000;
      updateUI();
    });
  }

  // Dev button to spawn an enemy
  const devSpawnEnemyBtn = document.getElementById("dev-spawn-enemy-btn");
  if (devSpawnEnemyBtn) {
    addTouchAndClickListener(devSpawnEnemyBtn, () => {
      // Only spawn if no enemies are on screen
      if (gameState.enemies.length === 0) {
        spawnEnemy();
        audioManager.playSoundEffect("popupAppear");
      }
    });
  }
}

// Open shop
function openShop() {
  gameState.shopOpen = true;
  gameState.isPaused = true;
  document.getElementById("shop-panel").classList.remove("hidden");
  updateShopDisplay();
}

// Close shop
function closeShop() {
  gameState.shopOpen = false;
  gameState.isPaused = false;
  document.getElementById("shop-panel").classList.add("hidden");
}

// Start game loop
function startGameLoop() {
  const gameLoop = () => {
    if (!gameState.isPaused) {
      updateGame();
      renderGame();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  };

  gameLoop();
}

// Update game logic
function updateGame() {
  const now = Date.now();

  // Update player sine wave movement
  gameState.player.sineOffset += GAME_CONFIG.PLAYER_SINE_SPEED;
  gameState.player.x =
    GAME_CONFIG.PLAYER_HORIZONTAL_CENTER +
    Math.sin(gameState.player.sineOffset) * GAME_CONFIG.PLAYER_SINE_AMPLITUDE;

  // Handle rising (when holding balloon)
  if (
    gameState.isHoldingBalloon &&
    gameState.energy >= GAME_CONFIG.ENERGY_RISE_COST
  ) {
    // Increase altitude instead of moving player Y position
    gameState.player.altitude += GAME_CONFIG.RISE_SPEED * 0.5; // Convert pixels to meters
    gameState.energy = Math.max(
      0,
      gameState.energy - GAME_CONFIG.ENERGY_RISE_COST
    );
  }

  // Energy production
  if (gameState.buildings.ENERGY_PRODUCTION > 0) {
    const production =
      GAME_CONFIG.BUILDINGS.ENERGY_PRODUCTION.baseProduction *
      Math.pow(
        GAME_CONFIG.BUILDINGS.ENERGY_PRODUCTION.productionMultiplier,
        gameState.buildings.ENERGY_PRODUCTION - 1
      );
    gameState.energy = Math.min(
      GAME_CONFIG.ENERGY_MAX,
      gameState.energy + production / 60 // Drastically reduce per-frame production
    );
  }

  // Gold production
  if (gameState.buildings.GOLD_PRODUCTION > 0) {
    const timeSinceLastProduction = now - gameState.lastGoldProduction;
    if (timeSinceLastProduction >= 1000) {
      const production =
        GAME_CONFIG.BUILDINGS.GOLD_PRODUCTION.baseProduction *
        Math.pow(
          GAME_CONFIG.BUILDINGS.GOLD_PRODUCTION.productionMultiplier,
          gameState.buildings.GOLD_PRODUCTION - 1
        );
      gameState.coins += Math.floor(production);
      gameState.lastGoldProduction = now;
    }
  }

  // Lava rises (increase minimum required altitude over time)
  const timeSinceStart = (now - gameState.gameStartTime) / 1000; // Time in seconds
  const lavaAltitude = timeSinceStart * GAME_CONFIG.LAVA_RISE_SPEED * 0.5; // Lava rises slowly in altitude

  // Check lava collision (if player altitude is too low compared to lava)
  if (gameState.player.altitude < lavaAltitude - 50) {
    handleLose();
    return;
  }

  // Check win condition (reached space)
  if (gameState.player.altitude >= GAME_CONFIG.SPACE_ALTITUDE) {
    handleWin();
    return;
  }

  // Spawn golden balloons
  if (
    now - gameState.lastGoldenBalloonSpawn >=
    GAME_CONFIG.GOLDEN_BALLOON_SPAWN_INTERVAL
  ) {
    spawnGoldenBalloon();
    gameState.lastGoldenBalloonSpawn = now;
  }

  // Spawn enemies
  if (now - gameState.lastEnemySpawn >= GAME_CONFIG.ENEMY_SPAWN_INTERVAL) {
    spawnEnemy();
    gameState.lastEnemySpawn = now;
  }

  // Update golden balloons
  updateGoldenBalloons();

  // Update enemies
  updateEnemies();

  // Auto attack
  updateAutoAttack(now);

  // Update lasers
  updateLasers(now);

  // Update UI
  updateUI();
}

// Spawn golden balloon
function spawnGoldenBalloon() {
  const balloon = {
    id: Date.now() + Math.random(),
    x: GAME_CONFIG.GOLDEN_BALLOON_START_X,
    y:
      GAME_CONFIG.GOLDEN_BALLOON_MIN_Y +
      Math.random() *
        (GAME_CONFIG.GOLDEN_BALLOON_MAX_Y - GAME_CONFIG.GOLDEN_BALLOON_MIN_Y),
  };

  gameState.goldenBalloons.push(balloon);
}

// Update golden balloons
function updateGoldenBalloons() {
  const magnetRange =
    GAME_CONFIG.STARTING_MAGNET_RANGE +
    gameState.buildings.MAGNET_STRENGTH *
      GAME_CONFIG.BUILDINGS.MAGNET_STRENGTH.rangeIncrease;

  gameState.goldenBalloons = gameState.goldenBalloons.filter((balloon) => {
    // Move left
    balloon.x -= GAME_CONFIG.GOLDEN_BALLOON_SPEED;

    // Check if collected (within magnet range)
    const dx = balloon.x - gameState.player.x;
    const dy = balloon.y - gameState.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= magnetRange) {
      collectGoldenBalloon();
      return false;
    }

    // Remove if off screen
    if (balloon.x < -50) {
      return false;
    }

    return true;
  });
}

// Collect golden balloon
function collectGoldenBalloon() {
  const value =
    GAME_CONFIG.STARTING_BALLOON_VALUE +
    gameState.buildings.BALLOON_VALUE *
      GAME_CONFIG.BUILDINGS.BALLOON_VALUE.valueIncrease;
  gameState.coins += value;
  audioManager.playSoundEffect("btnClick");
}

// Collect golden balloon by ID (when clicked)
function collectBalloonById(balloonId) {
  const balloonIndex = gameState.goldenBalloons.findIndex(
    (b) => b.id === balloonId
  );

  if (balloonIndex > -1) {
    // Remove the balloon from the array
    gameState.goldenBalloons.splice(balloonIndex, 1);

    // Add coins to player
    const value =
      GAME_CONFIG.STARTING_BALLOON_VALUE +
      gameState.buildings.BALLOON_VALUE *
        GAME_CONFIG.BUILDINGS.BALLOON_VALUE.valueIncrease;
    gameState.coins += value;

    // Play collection sound
    audioManager.playSoundEffect("btnClick");
  }
}

// Get current cloud layer based on altitude
function getCurrentCloudLayer() {
  const altitude = gameState.player.altitude;
  for (let i = GAME_CONFIG.CLOUD_LAYERS.length - 1; i >= 0; i--) {
    if (altitude >= GAME_CONFIG.CLOUD_LAYERS[i].startAltitude) {
      return i;
    }
  }
  return 0;
}

// Spawn enemy
function spawnEnemy() {
  const enemyTypes = [
    "enemy-balloon-1.png",
    "enemy-balloon-2.png",
    "enemy-balloon-3.png",
    "enemy-balloon-4.png",
  ];
  const currentLayer = getCurrentCloudLayer();

  const enemy = {
    id: Date.now() + Math.random(),
    x: 900, // Start off-screen to the right
    targetX: GAME_CONFIG.ENEMY_START_X,
    y: gameState.player.y + (Math.random() - 0.5) * 200, // Spawn near player's on-screen Y
    altitude: gameState.player.altitude + (Math.random() - 0.5) * 100, // Spawn near player altitude
    health: GAME_CONFIG.ENEMY_HEALTH,
    image: enemyTypes[Math.floor(Math.random() * enemyTypes.length)],
    lastLaserFireTime: Date.now(),
    laserCooldown: 10000, // 10 seconds
    isSpawning: true,
    spawnSpeed: 4,
  };

  gameState.enemies.push(enemy);
}

// Update enemies
function updateEnemies() {
  const now = Date.now();

  gameState.enemies = gameState.enemies.filter((enemy) => {
    // Animate in if spawning
    if (enemy.isSpawning) {
      enemy.x -= enemy.spawnSpeed;
      if (enemy.x <= enemy.targetX) {
        enemy.x = enemy.targetX;
        enemy.isSpawning = false;
      }
    } else {
      // Enemy fires lasers instead of moving or colliding
      if (now - enemy.lastLaserFireTime >= enemy.laserCooldown) {
        // Create a laser from enemy to player
        createLaser(enemy.x, enemy.y, {
          x: gameState.player.x,
          y: gameState.player.y,
        });
        damagePlayer(GAME_CONFIG.ENEMY_DAMAGE);
        enemy.lastLaserFireTime = now;
      }
    }

    // Remove if below screen (defeated by going off screen)
    if (enemy.y > 700) {
      dropGoldenBalloonsFromEnemy(enemy.x, enemy.y);
      return false;
    }

    // Remove if off screen left
    if (enemy.x < -100 && GAME_CONFIG.ENEMY_SPEED > 0) {
      return false;
    }

    return true;
  });
}

// Auto attack system
function updateAutoAttack(now) {
  if (gameState.buildings.AUTO_ATTACK === 0) return;
  if (gameState.energy <= 0) return;

  const attackRange =
    GAME_CONFIG.STARTING_ATTACK_RANGE +
    gameState.buildings.AUTO_ATTACK *
      GAME_CONFIG.BUILDINGS.AUTO_ATTACK.rangeIncrease;

  if (now - gameState.lastAttackTime >= GAME_CONFIG.ATTACK_COOLDOWN) {
    // Find closest enemy in range
    let closestEnemy = null;
    let closestDistance = attackRange;

    gameState.enemies.forEach((enemy) => {
      const dx = enemy.x - gameState.player.x;
      const dy = enemy.y - gameState.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      // Create laser
      createLaser(gameState.player.x, gameState.player.y, closestEnemy);

      // Damage enemy
      const damage =
        GAME_CONFIG.ATTACK_DAMAGE +
        gameState.buildings.AUTO_ATTACK *
          GAME_CONFIG.BUILDINGS.AUTO_ATTACK.damageIncrease;
      closestEnemy.health -= damage;

      if (closestEnemy.health <= 0) {
        defeatEnemy(closestEnemy);
      }

      // Consume energy
      gameState.energy = Math.max(
        0,
        gameState.energy - GAME_CONFIG.ENERGY_ATTACK_COST
      );
      gameState.lastAttackTime = now;

      audioManager.playSoundEffect("btnClick");
    }
  }
}

// Create laser
function createLaser(startX, startY, target) {
  const laser = {
    id: Date.now() + Math.random(),
    startX,
    startY,
    endX: target.x,
    endY: target.y,
    createdAt: Date.now(),
  };

  gameState.lasers.push(laser);
}

// Update lasers
function updateLasers(now) {
  gameState.lasers = gameState.lasers.filter((laser) => {
    return now - laser.createdAt < GAME_CONFIG.LASER_DURATION;
  });
}

// Defeat enemy
function defeatEnemy(enemy) {
  const index = gameState.enemies.indexOf(enemy);
  if (index > -1) {
    gameState.enemies.splice(index, 1);
    dropGoldenBalloonsFromEnemy(enemy.x, enemy.y);
  }
}

// Drop golden balloons from defeated enemy
function dropGoldenBalloonsFromEnemy(x, y) {
  for (let i = 0; i < GAME_CONFIG.ENEMY_GOLDEN_BALLOON_DROP; i++) {
    const balloon = {
      id: Date.now() + Math.random() + i,
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 50,
    };

    gameState.goldenBalloons.push(balloon);
  }
}

// Damage player
function damagePlayer(damage) {
  gameState.player.health -= damage;
  gameState.player.altitude = Math.max(
    0,
    gameState.player.altitude - GAME_CONFIG.DAMAGE_KNOCKBACK * 0.5
  );

  audioManager.playSoundEffect("playerDamage");

  if (gameState.player.health <= 0) {
    handleLose();
  }
}

// Render game
function renderGame() {
  // Keep player balloon fixed in position (only horizontal sway)
  const playerBalloon = document.getElementById("player-balloon");
  if (playerBalloon) {
    playerBalloon.style.left = gameState.player.x + "px";
    playerBalloon.style.top = gameState.player.y + "px"; // Fixed vertical position
  }

  // Update magnet radius indicator
  const magnetRadius = document.getElementById("magnet-radius");
  if (magnetRadius) {
    const magnetRange =
      GAME_CONFIG.STARTING_MAGNET_RANGE +
      gameState.buildings.MAGNET_STRENGTH *
        GAME_CONFIG.BUILDINGS.MAGNET_STRENGTH.rangeIncrease;
    const radiusSize = magnetRange * 2; // Diameter = radius * 2

    magnetRadius.style.left = gameState.player.x + "px";
    magnetRadius.style.top = gameState.player.y + "px";
    magnetRadius.style.width = radiusSize + "px";
    magnetRadius.style.height = radiusSize + "px";
  }

  // Calculate background offset based on altitude (convert altitude meters to pixels for display)
  const altitudeOffset = gameState.player.altitude * 2; // Scale for visual effect

  // Update lava position (moves down as player ascends)
  const lava = document.getElementById("lava");
  if (lava) {
    lava.style.top = GAME_CONFIG.LAVA_START_Y + altitudeOffset + "px";
  }

  // Update cloud layers (parallax effect based on altitude)
  GAME_CONFIG.CLOUD_LAYERS.forEach((layer, index) => {
    const cloudElement = document.getElementById(`cloud-layer-${index + 1}`);
    if (cloudElement) {
      // Different parallax speeds for different layers
      const parallaxSpeed = 0.3 + index * 0.2;
      cloudElement.style.top =
        layer.baseY + altitudeOffset * parallaxSpeed + "px";
    }
  });

  // Render entities
  renderEntities();
}

// Track DOM elements for entities to avoid recreating them every frame
const entityDOMCache = {
  lasers: new Map(),
  goldenBalloons: new Map(),
  enemies: new Map(),
};

// Render all entities (golden balloons, enemies, lasers)
function renderEntities() {
  const entitiesContainer = document.getElementById("game-entities");

  // Render lasers - update existing or create new
  const currentLaserIds = new Set();
  gameState.lasers.forEach((laser) => {
    currentLaserIds.add(laser.id);

    let laserEl = entityDOMCache.lasers.get(laser.id);
    if (!laserEl) {
      // Create new laser element
      laserEl = document.createElement("div");
      laserEl.className = "laser";
      entityDOMCache.lasers.set(laser.id, laserEl);
      entitiesContainer.appendChild(laserEl);
    }

    // Calculate angle and length
    const dx = laser.endX - laser.startX;
    const dy = laser.endY - laser.startY;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Update position and rotation
    laserEl.style.left = laser.startX + "px";
    laserEl.style.top = laser.startY + "px";
    laserEl.style.width = length + "px";
    laserEl.style.transform = `rotate(${angle}deg)`;
    laserEl.style.transformOrigin = "0 50%";
  });

  // Remove lasers that no longer exist
  entityDOMCache.lasers.forEach((laserEl, id) => {
    if (!currentLaserIds.has(id)) {
      laserEl.remove();
      entityDOMCache.lasers.delete(id);
    }
  });

  // Render golden balloons - update existing or create new
  const currentBalloonIds = new Set();
  gameState.goldenBalloons.forEach((balloon) => {
    currentBalloonIds.add(balloon.id);

    let balloonEl = entityDOMCache.goldenBalloons.get(balloon.id);
    if (!balloonEl) {
      // Create new balloon element
      balloonEl = document.createElement("div");
      balloonEl.className = "golden-balloon";
      balloonEl.style.cursor = "pointer";
      balloonEl.innerHTML =
        '<img src="images/golden-balloon.png" alt="Golden Balloon">';
      balloonEl.dataset.balloonId = balloon.id;
      entityDOMCache.goldenBalloons.set(balloon.id, balloonEl);
      entitiesContainer.appendChild(balloonEl);
    }

    // Update position
    balloonEl.style.left = balloon.x + "px";
    balloonEl.style.top = balloon.y + "px";
  });

  // Remove balloons that no longer exist
  entityDOMCache.goldenBalloons.forEach((balloonEl, id) => {
    if (!currentBalloonIds.has(id)) {
      balloonEl.remove();
      entityDOMCache.goldenBalloons.delete(id);
    }
  });

  // Render enemies - update existing or create new
  const currentEnemyIds = new Set();
  gameState.enemies.forEach((enemy) => {
    currentEnemyIds.add(enemy.id);

    let enemyEl = entityDOMCache.enemies.get(enemy.id);
    if (!enemyEl) {
      // Create new enemy element
      enemyEl = document.createElement("div");
      enemyEl.className = "enemy-balloon";
      enemyEl.innerHTML = `
        <img src="images/${enemy.image}" alt="Enemy Balloon">
        <div class="enemy-cooldown-bar-bg">
          <div class="enemy-cooldown-bar-fill"></div>
        </div>
      `;
      entityDOMCache.enemies.set(enemy.id, enemyEl);
      entitiesContainer.appendChild(enemyEl);
    }

    // Update position
    enemyEl.style.left = enemy.x + "px";
    enemyEl.style.top = enemy.y + "px";

    // Update cooldown bar
    const cooldownFill = enemyEl.querySelector(".enemy-cooldown-bar-fill");
    if (cooldownFill) {
      const now = Date.now();
      const elapsed = now - enemy.lastLaserFireTime;
      const progress = Math.min(1, elapsed / enemy.laserCooldown);
      cooldownFill.style.width = `${progress * 100}%`;
    }
  });

  // Remove enemies that no longer exist
  entityDOMCache.enemies.forEach((enemyEl, id) => {
    if (!currentEnemyIds.has(id)) {
      enemyEl.remove();
      entityDOMCache.enemies.delete(id);
    }
  });
}

// Update UI
function updateUI() {
  // Update coin count
  document.getElementById("coin-count").textContent = Math.floor(
    gameState.coins
  );

  // Update health
  document.getElementById(
    "health-count"
  ).textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;

  // Update energy bar
  const energyPercent = (gameState.energy / GAME_CONFIG.ENERGY_MAX) * 100;
  document.getElementById("energy-bar-fill").style.height = energyPercent + "%";
  document.getElementById("energy-bar-text").textContent = `${Math.floor(
    gameState.energy
  )}/${GAME_CONFIG.ENERGY_MAX}`;

  // Update altitude
  const altitude = Math.floor(gameState.player.altitude);
  document.getElementById("altitude-value").textContent = altitude + "m";

  // Update cloud layer progress
  const currentLayerIndex = getCurrentCloudLayer();
  const currentLayer = GAME_CONFIG.CLOUD_LAYERS[currentLayerIndex];
  const progressInLayer =
    gameState.player.altitude - currentLayer.startAltitude;
  const progressPercent = Math.min(
    100,
    (progressInLayer / currentLayer.depth) * 100
  );

  const cloudProgressFill = document.getElementById("cloud-progress-fill");
  const cloudProgressText = document.getElementById("cloud-progress-text");
  const cloudLayerName = document.getElementById("cloud-layer-name");

  if (cloudProgressFill) {
    cloudProgressFill.style.height = progressPercent + "%";
  }
  if (cloudProgressText) {
    cloudProgressText.textContent = Math.floor(progressPercent) + "%";
  }
  if (cloudLayerName) {
    cloudLayerName.textContent = currentLayer.name;
  }
}

// Calculate total game time (excluding paused time)
function calculateTotalGameTime() {
  const endTime = Date.now();
  const totalElapsed = endTime - gameState.gameStartTime;
  const activeTime = totalElapsed - gameState.totalPausedTime;
  return activeTime / 1000; // Convert to seconds
}

// Format time for display
function formatTimeForDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${minutes}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(2, "0")}`;
}

// Handle Win
function handleWin() {
  gameState.isPaused = true;

  const totalGameTime = calculateTotalGameTime();

  // Play victory sound
  audioManager.playSoundEffect("roboFinalDeath");

  // Show victory screen after a brief delay
  const timeText = formatTimeForDisplay(totalGameTime);
  setTimeout(() => {
    gameOverScreen.showVictory(timeText, false, totalGameTime);
  }, 1000);

  // Stop game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
}

// Handle Lose
function handleLose() {
  gameState.isPaused = true;

  // Play defeat sound
  audioManager.playSoundEffect("playerDamage");

  // Show defeat screen after a brief delay
  setTimeout(() => {
    gameOverScreen.showDefeat(1);
  }, 1000);

  // Stop game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
}

// Toggle pause
function togglePause() {
  if (gameState.shopOpen) return; // Don't allow pause toggle when shop is open

  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    // Track when pause started
    gameState.lastPauseTime = Date.now();
    elements.pauseOverlay.classList.add("show");
  } else {
    // Add paused time to total when resuming
    if (gameState.lastPauseTime) {
      gameState.totalPausedTime += Date.now() - gameState.lastPauseTime;
      gameState.lastPauseTime = null;
    }
    elements.pauseOverlay.classList.remove("show");
  }
}

// Restart game
function restartGame() {
  elements.pauseOverlay.classList.remove("show");

  // Hide game over screens
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Stop current game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Restart game audio
  audioManager.play("combat");

  // Reinitialize game
  initGame();
}

// Quit to main menu
function quitToMainMenu() {
  // Stop game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Hide game over screens
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Hide pause overlay
  elements.pauseOverlay.classList.remove("show");
  gameState.isPaused = false;
  elements.pause.style.display = "none";

  // Hide game elements and show title screen
  document.getElementById("game").style.display = "none";
  const titleScreen = document.getElementById("title-screen");
  titleScreen.style.display = "block";

  // Re-import and re-initialize the title screen to reset its state
  import("./title-screen.js").then((titleScreenModule) => {
    titleScreenModule.resetTitleScreen();
    titleScreenModule.initTitleScreen();
  });

  // Ensure game music stops and title music starts
  audioManager.play("titleIntro");
}
