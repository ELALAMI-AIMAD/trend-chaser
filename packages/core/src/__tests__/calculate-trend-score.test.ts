import { describe, it, expect } from "vitest";
import {
  calculateTrendScore,
  type ScoreInput,
} from "../scoring/calculate-trend-score.js";

const perfect: ScoreInput = {
  demand: 100, competition: 100, velocity: 100,
  timing: 100, platformFit: 100, ipSafety: 100, confidence: 100,
};

const zero: ScoreInput = {
  demand: 0, competition: 0, velocity: 0,
  timing: 0, platformFit: 0, ipSafety: 0, confidence: 0,
};

describe("scoring formula", () => {
  it("total = 100 when all inputs are 100", () => {
    expect(calculateTrendScore(perfect).total).toBe(100);
  });

  it("total = 0 when all inputs are 0", () => {
    expect(calculateTrendScore(zero).total).toBe(0);
  });

  it("demand weight is 0.22 (demand=80 → 17.6)", () => {
    const result = calculateTrendScore({ ...zero, demand: 80 });
    expect(result.total).toBeCloseTo(17.6, 1);
  });

  it("competition weight is 0.18", () => {
    const result = calculateTrendScore({ ...zero, competition: 100 });
    expect(result.total).toBeCloseTo(18, 1);
  });

  it("all weights sum to 1.0", () => {
    const weights = [0.22, 0.18, 0.18, 0.14, 0.14, 0.10, 0.04];
    expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 10);
  });
});

describe("temperature classification", () => {
  it("hot: total >= 75 AND ipSafety >= 70", () => {
    const result = calculateTrendScore({
      demand: 85, competition: 85, velocity: 85,
      timing: 85, platformFit: 85, ipSafety: 85, confidence: 85,
    });
    expect(result.temperature).toBe("hot");
    expect(result.action).toBe("Test");
  });

  it("warm (not hot) when ipSafety < 70 even with high total", () => {
    const result = calculateTrendScore({
      demand: 90, competition: 90, velocity: 90,
      timing: 90, platformFit: 90, ipSafety: 60, confidence: 90,
    });
    expect(result.temperature).toBe("warm");
    expect(result.action).toBe("Watch");
  });

  it("cold when total < 55", () => {
    const result = calculateTrendScore({
      demand: 30, competition: 30, velocity: 30,
      timing: 30, platformFit: 30, ipSafety: 30, confidence: 30,
    });
    expect(result.temperature).toBe("cold");
    expect(result.action).toBe("Skip");
  });
});

describe("reason codes", () => {
  it("high-demand when demand >= 70", () => {
    expect(calculateTrendScore({ ...zero, demand: 75 }).reasonCodes).toContain("high-demand");
  });

  it("low-demand when demand < 40", () => {
    expect(calculateTrendScore({ ...zero, demand: 20 }).reasonCodes).toContain("low-demand");
  });

  it("low-competition when competition >= 70", () => {
    expect(calculateTrendScore({ ...zero, competition: 80 }).reasonCodes).toContain("low-competition");
  });

  it("high-competition when competition < 40", () => {
    expect(calculateTrendScore({ ...zero, competition: 20 }).reasonCodes).toContain("high-competition");
  });

  it("ip-risk when ipSafety < 70", () => {
    expect(calculateTrendScore({ ...perfect, ipSafety: 50 }).reasonCodes).toContain("ip-risk");
  });

  it("ip-blocked when ipSafety < 30", () => {
    expect(calculateTrendScore({ ...perfect, ipSafety: 10 }).reasonCodes).toContain("ip-blocked");
  });

  it("top-score when total >= 75", () => {
    expect(calculateTrendScore(perfect).reasonCodes).toContain("top-score");
  });
});

describe("input clamping", () => {
  it("clamps inputs above 100", () => {
    const result = calculateTrendScore({
      demand: 200, competition: 200, velocity: 200,
      timing: 200, platformFit: 200, ipSafety: 200, confidence: 200,
    });
    expect(result.total).toBe(100);
  });

  it("clamps inputs below 0", () => {
    const result = calculateTrendScore({
      demand: -50, competition: -50, velocity: -50,
      timing: -50, platformFit: -50, ipSafety: -50, confidence: -50,
    });
    expect(result.total).toBe(0);
  });
});
