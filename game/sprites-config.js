export const SPRITE_CONFIGS = {};

export function getSpriteConfig(name) {
  const config = SPRITE_CONFIGS[name];
  if (!config) {
    throw new Error(`Sprite configuration not found: ${name}`);
  }
  return config;
}

/**
 * Check if a sprite exists
 * @param {string} name - Sprite name
 * @returns {boolean}
 */
export function hasSprite(name) {
  return name in SPRITE_CONFIGS;
}
