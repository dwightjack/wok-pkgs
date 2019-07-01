const PresetConfig = require('./lib/preset-config');

/**
 * Returns a new instance of `PresetConfig` with optional configuration
 *
 * @param {object<string,*>} [config] Configuration
 * @returns {PresetConfig}
 */
function createPreset(config) {
  const preset = new PresetConfig();
  preset.config(config);
  return preset;
}

module.exports = { PresetConfig, createPreset };
