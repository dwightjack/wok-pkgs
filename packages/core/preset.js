const PresetConfig = require('./lib/preset-config');

function createPreset(cfg) {
  const preset = new PresetConfig();
  preset.config(cfg);
  return preset;
}

module.exports = { PresetConfig, createPreset };
