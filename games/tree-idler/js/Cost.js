// Cost class to encapsulate cost logic
class Cost {
  constructor(sunlight = 0, water = 0) {
    this.sunlight = sunlight;
    this.water = water;
  }
  canAfford(resources) {
    return resources.sunlight >= this.sunlight && resources.water >= this.water;
  }
  spend(resources) {
    if (this.canAfford(resources)) {
      resources.sunlight -= this.sunlight;
      resources.water -= this.water;
      return true;
    }
    return false;
  }
  static fromObject(obj) {
    return new Cost(obj.sunlight || 0, obj.water || 0);
  }
}
export default Cost;
