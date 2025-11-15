// Game Configuration - Hot Air Balloon Escape to Space

// Game constants
export const GAME_CONFIG = {
  // Player
  PLAYER_START_HEALTH: 3,
  PLAYER_START_Y: 400, // Starting vertical position
  PLAYER_HORIZONTAL_CENTER: 400, // Horizontal center position
  PLAYER_SINE_AMPLITUDE: 30, // How far left/right the balloon sways
  PLAYER_SINE_SPEED: 0.001, // How fast the balloon sways
  DAMAGE_KNOCKBACK: 80, // How much player descends when taking damage

  // Lava
  LAVA_START_Y: 600, // Starting position (bottom of screen)
  LAVA_RISE_SPEED: 0.05, // Pixels per frame

  // Coins & Golden Balloons
  STARTING_BALLOON_VALUE: 1, // Coins per golden balloon collected
  GOLDEN_BALLOON_SPAWN_INTERVAL: 3000, // ms between spawns
  GOLDEN_BALLOON_SPEED: 1, // Horizontal movement speed
  GOLDEN_BALLOON_START_X: 850, // Spawn position (right side)
  GOLDEN_BALLOON_MIN_Y: 100, // Min vertical position
  GOLDEN_BALLOON_MAX_Y: 500, // Max vertical position

  // Magnet
  STARTING_MAGNET_RANGE: 80, // Pixels

  // Energy
  ENERGY_START: 0, // Starting energy (must build energy production)
  ENERGY_MAX: 100,
  ENERGY_RISE_COST: 0.3, // Energy consumed per frame while rising
  ENERGY_ATTACK_COST: 0.2, // Energy consumed per frame while attacking

  // Rising (when clicking/holding)
  RISE_SPEED: 2, // Pixels per frame when holding

  // Cloud Layers (with depth requirements in meters)
  CLOUD_LAYERS: [
    { name: "Troposphere", startAltitude: 0, depth: 500, baseY: 500 },
    { name: "Stratosphere", startAltitude: 500, depth: 600, baseY: 350 },
    { name: "Mesosphere", startAltitude: 1100, depth: 700, baseY: 200 },
    { name: "Thermosphere", startAltitude: 1800, depth: 800, baseY: 50 },
  ],
  SPACE_ALTITUDE: 2600, // Win condition (total depth of all layers)

  // Enemies
  ENEMY_SPAWN_INTERVAL: 60000, // 1 minute in ms
  ENEMY_SPEED: 0.5, // Horizontal movement speed
  ENEMY_START_X: 850, // Spawn from right
  ENEMY_MIN_Y: 100,
  ENEMY_MAX_Y: 500,
  ENEMY_HEALTH: 3, // Hits to destroy
  ENEMY_DAMAGE: 1, // Damage dealt to player
  ENEMY_COLLISION_COOLDOWN: 2000, // ms between collision damage
  ENEMY_GOLDEN_BALLOON_DROP: 5, // How many golden balloons drop on defeat

  // Auto Attack
  STARTING_ATTACK_RANGE: 200,
  ATTACK_DAMAGE: 1,
  ATTACK_COOLDOWN: 1000, // ms between attacks
  LASER_DURATION: 300, // ms laser is visible

  // Buildings / Upgrades
  BUILDINGS: {
    GOLD_PRODUCTION: {
      name: "Gold Production",
      description: "Generates coins passively",
      baseCost: 10,
      costMultiplier: 1.5,
      baseProduction: 1, // Coins per second
      productionMultiplier: 1.3,
      image: "gold-production-building.png"
    },
    AUTO_ATTACK: {
      name: "Auto Attack",
      description: "Increases attack damage and range",
      baseCost: 20,
      costMultiplier: 1.6,
      baseDamage: 1,
      damageIncrease: 0.5,
      baseRange: 200,
      rangeIncrease: 20,
      image: "auto-attack-building.png"
    },
    HEALTH: {
      name: "Health Upgrade",
      description: "Increases maximum health",
      baseCost: 25,
      costMultiplier: 2,
      healthIncrease: 1,
      image: "player-default.png"
    },
    MAGNET_STRENGTH: {
      name: "Magnet Strength",
      description: "Increases coin collection range",
      baseCost: 15,
      costMultiplier: 1.4,
      baseRange: 80,
      rangeIncrease: 20,
      image: "magnet-range-building.png"
    },
    BALLOON_VALUE: {
      name: "Balloon Value",
      description: "Increases coins per golden balloon",
      baseCost: 30,
      costMultiplier: 1.7,
      valueIncrease: 1,
      image: "balloon-value-building.png"
    },
    ENERGY_PRODUCTION: {
      name: "Energy Production",
      description: "Generates energy over time",
      baseCost: 50,
      costMultiplier: 1.5,
      baseProduction: 0.5, // Energy per frame
      productionMultiplier: 1.2,
      image: "energy-production-building.png"
    }
  },

  // Timings (in milliseconds)
  FEEDBACK_DURATION: 1000,
  STATE_TRANSITION_DELAY: 500,
};

// Default game state
export function createInitialGameState() {
  return {
    gameStartTime: null,
    totalPausedTime: 0,
    lastPauseTime: null,
    isPaused: false,
  };
}
