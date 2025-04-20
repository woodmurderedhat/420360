import Resources from "../js/Resources.js";
import Cost from "../js/Cost.js";
import Tree from "../js/Tree.js";
import Leaves from "../js/Leaves.js";
import Roots from "../js/Roots.js";
import Fruits from "../js/Fruits.js";

describe("Tree Idler Core Logic", () => {
  test("Resources: capping, spending, and adding", () => {
    const res = new Resources();
    res.sunlight = 999999;
    res.water = 999999;
    res.addResources(10000, 10000);
    expect(res.sunlight).toBeLessThanOrEqual(1000000);
    expect(res.water).toBeLessThanOrEqual(1000000);
    expect(res.spendResources(100, 100)).toBe(true);
    expect(res.sunlight).toBeGreaterThanOrEqual(0);
    expect(res.water).toBeGreaterThanOrEqual(0);
    expect(res.spendResources(1e9, 1e9)).toBe(false);
  });

  test("Cost: canAfford and spend", () => {
    const res = new Resources();
    res.sunlight = 100;
    res.water = 50;
    const cost = new Cost(80, 40);
    expect(cost.canAfford(res)).toBe(true);
    expect(cost.spend(res)).toBe(true);
    expect(res.sunlight).toBe(20);
    expect(res.water).toBe(10);
    expect(cost.spend(res)).toBe(false);
  });

  test("Tree: growth stages and fruit unlock", () => {
    const tree = new Tree();
    const res = new Resources();
    res.sunlight = 10000;
    res.water = 10000;
    let unlocked = false;
    for (let i = 0; i < 10; i++) {
      tree.grow(res);
      if (tree.areFruitsEnabled()) unlocked = true;
    }
    expect(tree.growthStage).toBeLessThanOrEqual(tree.maxGrowthStage);
    expect(unlocked).toBe(true);
  });

  test("Leaves/Roots: add, upgrade, and production", () => {
    const leaves = new Leaves();
    const roots = new Roots();
    expect(leaves.slots.length).toBe(1);
    expect(roots.slots.length).toBe(1);
    leaves.maxSlots = 2;
    roots.maxSlots = 2;
    expect(leaves.addLeaf()).toBe(true);
    expect(roots.addRoot()).toBe(true);
    expect(leaves.slots.length).toBe(2);
    expect(roots.slots.length).toBe(2);
    const res = new Resources();
    res.sunlight = 1000;
    res.water = 1000;
    expect(leaves.upgradeLeaf(0, res)).toBe(true);
    expect(roots.upgradeRoot(0, res)).toBe(true);
    expect(leaves.slots[0].level).toBeGreaterThan(1);
    expect(roots.slots[0].level).toBeGreaterThan(1);
    expect(leaves.calculateSunlightProduction(1)).toBeGreaterThan(0);
    expect(roots.calculateWaterProduction(1)).toBeGreaterThan(0);
  });

  test("Fruits: spawn, grow, and harvest", () => {
    const fruits = new Fruits();
    fruits.enabled = true;
    fruits.maxFruits = 2;
    fruits.spawnFruit();
    fruits.spawnFruit();
    expect(fruits.fruits.length).toBe(2);
    fruits.fruits.forEach(fruit => (fruit.growth = 1));
    const value = fruits.harvestFruit(fruits.fruits[0].id);
    expect(value).toHaveProperty("sunlight");
    expect(fruits.fruits.length).toBe(1);
    const all = fruits.harvestAllRipeFruits();
    expect(all.sunlight).toBeGreaterThanOrEqual(0);
    expect(fruits.fruits.length).toBe(0);
  });
});
