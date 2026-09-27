// backend/config/ldnbs/loadEffectiveConfig.js
//
// Merges admin overrides (ldnbs_config document) onto the defaults. All LD-NBSE
// engines receive the result of this so admin edits take effect without code
// changes. Falls back to pure defaults when the DB is unavailable (unit tests).
"use strict";

const { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS, DEFAULT_EFFORT, DEFAULT_SUCCESS_MESSAGES, validateWeights } = require("./recommendationWeights");

const defaultConfig = {
    weights: DEFAULT_WEIGHTS,
    thresholds: DEFAULT_THRESHOLDS,
    effortByStatus: DEFAULT_EFFORT,
    successMessages: DEFAULT_SUCCESS_MESSAGES,
};

async function loadEffectiveConfig({ LdnbsConfig } = {}) {
    let overrides = null;
    if (LdnbsConfig) {
        try {
            overrides = await LdnbsConfig.findOne({ key: "default" }).lean();
        } catch (err) {
            overrides = null; // DB down → defaults
        }
    }
    const cfg = JSON.parse(JSON.stringify(defaultConfig));
    if (overrides) {
        if (overrides.weights) cfg.weights = validateWeights(overrides.weights);
        if (overrides.thresholds) cfg.thresholds = { ...cfg.thresholds, ...overrides.thresholds };
        if (overrides.effortByStatus) cfg.effortByStatus = { ...cfg.effortByStatus, ...overrides.effortByStatus };
        if (overrides.successMessages) cfg.successMessages = { ...cfg.successMessages, ...overrides.successMessages };
        if (overrides.blueprintOverrides) cfg.blueprintOverrides = overrides.blueprintOverrides;
    }
    return cfg;
}

module.exports = { loadEffectiveConfig, defaultConfig };