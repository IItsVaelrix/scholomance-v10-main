import { describe, it, expect } from "vitest";
import { generateWorldFromScroll } from "../../src/lib/world.procgen";
import type { ScrollInput, ScrollMetrics } from "../../src/types/scrollworld";

describe("world.procgen", () => {
  const mockScroll: ScrollInput = {
    id: "s_1",
    title: "The Test Scroll",
    text: "A short verse to build a world from. Nothing too complex.",
  };

  const mockMetrics: ScrollMetrics = {
    seed: 12345, // Fixed seed for predictable results
    tokenCount: 12,
    uniqueCount: 12,
    lineCount: 1,
    complexity: 100, // A moderate complexity value
    volatility: 0.5,
  };

  describe("generateWorldFromScroll", () => {
    it("should generate a predictable world from a fixed seed", () => {
      const world = generateWorldFromScroll(mockMetrics, mockScroll);

      // Check top-level properties
      expect(world.seed).toBe(mockMetrics.seed);
      expect(world.startNodeId).toBe("N_0");

      // Check node generation (clamped between 6 and 60)
      // With complexity 100, floor(100/35) = 2, but min is 6.
      expect(world.nodes.length).toBe(6);
      expect(world.nodes[0].type).toBe("HUB");
      expect(world.nodes[0].chroma.school).toBe(world.palette.blended.school);
      expect(world.nodes.every((node) => Boolean(node.chroma?.className))).toBe(true);
      expect(world.palette.dominant.cssVar).toContain("--");
      expect(world.palette.blended.blended).toBe(true);

      // Check edge generation (clamped between 2 and 40)
      // 5 base edges + floor(100/90)=1 extra edge, clamped up to 2
      expect(world.edges.length).toBe(5 + 2);

      // Check entity budget (clamped between 15 and 300)
      // floor(100/10) = 10, but min is 15.
      // The total number of entities will be the budget + the boss
      const entityBudget = 15;
      expect(world.entitiesById["M_BOSS"]).toBeDefined();
      const bossNode = world.nodes.find((n) => n.entities.includes("M_BOSS"));
      expect(world.entitiesById["M_BOSS"]?.chroma?.school).toBe(bossNode?.chroma.school);
      // The exact number can vary slightly due to container contents, but it should be close to budget + 1
      expect(Object.keys(world.entitiesById).length).toBeGreaterThanOrEqual(entityBudget);
    });

    it("should handle a minimal scroll and metrics", () => {
      const minimalMetrics: ScrollMetrics = {
        seed: 54321,
        tokenCount: 1,
        uniqueCount: 1,
        lineCount: 1,
        complexity: 1,
        volatility: 0,
      };
      const world = generateWorldFromScroll(minimalMetrics, { ...mockScroll, title: "", text: "a" });

      // Clamping should ensure a minimum viable world is created
      expect(world.nodes.length).toBe(6); // min clamp
      expect(world.edges.length).toBe(5 + 2); // 5 base + 2 extra (min clamp)
      expect(Object.keys(world.entitiesById).length).toBeGreaterThanOrEqual(15); // min budget
      expect(["SCROLL ATRIUM", "EDEN OF TEXT", "THE INDEX HALL"]).toContain(world.nodes[0].title);
      expect(world.palette.dominant.school).toBeDefined();
      expect(world.nodes[0].chroma).toBeDefined();
    });

    it("should always place a BOSS monster", () => {
      const world = generateWorldFromScroll(mockMetrics, mockScroll);
      const boss = world.entitiesById["M_BOSS"];
      expect(boss).toBeDefined();
      expect(boss.type).toBe("MONSTER");
      expect(boss.rank).toBe("BOSS");

      // Check if it's placed in a node
      const nodeWithBoss = world.nodes.find(n => n.entities.includes("M_BOSS"));
      expect(nodeWithBoss).toBeDefined();
    });

    it("derives a chromatic palette from scroll text", () => {
      const willScroll: ScrollInput = {
        ...mockScroll,
        title: "Blaze Hymn",
        text: "Ash altar wrath black basalt ash ash",
      };
      const psychicScroll: ScrollInput = {
        ...mockScroll,
        title: "Oracle Coil",
        text: "Samurai bonsai chai rail braid ai ai",
      };
      const willWorld = generateWorldFromScroll({ ...mockMetrics, seed: 9876 }, willScroll);
      const psychicWorld = generateWorldFromScroll({ ...mockMetrics, seed: 6789 }, psychicScroll);

      expect(willWorld.palette.dominant.school).not.toBe(psychicWorld.palette.dominant.school);
      expect(willWorld.nodes[0].chroma.school).toBe(willWorld.palette.blended.school);
      expect(psychicWorld.nodes[0].chroma.className).toBeTruthy();
    });
  });
});
