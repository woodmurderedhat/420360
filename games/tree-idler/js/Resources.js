/**
 * Resources.js - Manages the game's resources (sunlight and water)
 */
import Config from "./Config.js";

export default class Resources {
    constructor() {
        this.sunlight = 0;
        this.water = 0;
        this.sunlightPerSecond = 0;
        this.waterPerSecond = 0;
    }

    /**
     * Update resources based on production rates
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        this.sunlight += this.sunlightPerSecond * deltaTime;
        this.water += this.waterPerSecond * deltaTime;
        // Resource capping
        this.sunlight = Math.min(this.sunlight, Config.MAX_SUNLIGHT);
        this.water = Math.min(this.water, Config.MAX_WATER);
    }

    /**
     * Calculate offline progress
     * @param {number} elapsedTime - Time elapsed while offline in seconds
     */
    calculateOfflineProgress(elapsedTime) {
        // Cap offline progress to prevent excessive resources
        const cappedTime = Math.min(elapsedTime, 24 * 60 * 60); // Max 24 hours

        const sunlightGained = this.sunlightPerSecond * cappedTime;
        const waterGained = this.waterPerSecond * cappedTime;

        this.sunlight += sunlightGained;
        this.water += waterGained;

        return {
            sunlightGained,
            waterGained,
            timeProcessed: cappedTime
        };
    }

    /**
     * Check if player has enough resources
     * @param {number} sunlightCost - Amount of sunlight required
     * @param {number} waterCost - Amount of water required
     * @returns {boolean} - Whether player has enough resources
     */
    hasEnoughResources(sunlightCost, waterCost) {
        return this.sunlight >= sunlightCost && this.water >= waterCost;
    }

    /**
     * Spend resources
     * @param {number} sunlightCost - Amount of sunlight to spend
     * @param {number} waterCost - Amount of water to spend
     * @returns {boolean} - Whether the transaction was successful
     */
    spendResources(sunlightCost, waterCost) {
        if (this.hasEnoughResources(sunlightCost, waterCost)) {
            this.sunlight -= sunlightCost;
            this.water -= waterCost;
            return true;
        }
        return false;
    }

    /**
     * Update production rates based on leaves and roots
     * @param {number} sunlightRate - New sunlight production rate
     * @param {number} waterRate - New water production rate
     */
    updateProductionRates(sunlightRate, waterRate) {
        this.sunlightPerSecond = sunlightRate;
        this.waterPerSecond = waterRate;
    }

    /**
     * Add resources (e.g., from harvesting fruits)
     * @param {number} sunlight - Amount of sunlight to add
     * @param {number} water - Amount of water to add
     */
    addResources(sunlight, water) {
        this.sunlight += sunlight;
        this.water += water;
        // Resource capping
        this.sunlight = Math.min(this.sunlight, Config.MAX_SUNLIGHT);
        this.water = Math.min(this.water, Config.MAX_WATER);
    }

    /**
     * Get current resource state
     * @returns {Object} - Current resource state
     */
    getState() {
        return {
            sunlight: this.sunlight,
            water: this.water,
            sunlightPerSecond: this.sunlightPerSecond,
            waterPerSecond: this.waterPerSecond
        };
    }

    /**
     * Load resource state
     * @param {Object} state - Resource state to load
     */
    loadState(state) {
        if (state) {
            this.sunlight = state.sunlight || 0;
            this.water = state.water || 0;
            this.sunlightPerSecond = state.sunlightPerSecond || 0;
            this.waterPerSecond = state.waterPerSecond || 0;
        }
    }

    /**
     * Reset resources to initial state
     */
    reset() {
        this.sunlight = 0;
        this.water = 0;
        this.sunlightPerSecond = 0;
        this.waterPerSecond = 0;
    }
}
