function parseDimensions(filename) {
  const match = filename.match(/-(\d+)-(\d+)\.png$/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  throw new Error(`Could not parse dimensions from filename: ${filename}`);
}

function createHitSpriteConfig(imagePath, overrides = {}) {
  const defaults = {
    rows: 6,
    cols: 6,
    fps: 12,
    loop: false, // Hit animations should play once
    scale: 1.5,
    offsetX: 0,
    offsetY: 0,
  };

  const config = { ...defaults, imagePath, ...overrides };

  return {
    ...config,
    get frameWidth() {
      const dims = parseDimensions(this.imagePath);
      return dims.width / this.cols;
    },
    get frameHeight() {
      const dims = parseDimensions(this.imagePath);
      return dims.height / this.rows;
    },
  };
}

export const SPRITE_CONFIGS = {
  // Use a direct configuration for the logo to handle custom offsets and gaps correctly.
  "logo-thin": {
    imagePath: "images/logo-thin-spritesheet-3072-3072.png",
    rows: 6,
    cols: 6,
    fps: 12,
    loop: true,
    scale: 1.5,
    offsetX: 0,
    offsetY: 0,
    frameContentWidth: 279, // The actual width of the graphic in the frame
    frameContentHeight: 277, // The actual height of the graphic in the frame
    frameWidth: 117, // This is the X offset from the test page
    frameHeight: 118, // This is the Y offset from the test page
    gapX: 116, // Horizontal gap between frames
    gapY: 117, // Vertical gap between frames
  },
  // Company logo for loading screen
  "company-logo": createHitSpriteConfig(
    "images/company-logo-spritesheet-1386-1818.png",
    {
      rows: 6, // Correct number of rows
      cols: 6,
      scale: 0.8, // Reduced scale to make it smaller
      fps: 12,
      pingPong: true, // Play forward, then backward, and repeat
    }
  ),
};

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
