import { describe, it, expect } from "vitest";
import { urgency, urgencyToTimingScore, uploadWindow } from "../scoring/urgency.js";

describe("urgency()", () => {
  it("returns late for negative days", () => {
    expect(urgency(-1)).toBe("late");
    expect(urgency(-30)).toBe("late");
  });

  it("returns act_now for 0-35 days", () => {
    expect(urgency(0)).toBe("act_now");
    expect(urgency(20)).toBe("act_now");
    expect(urgency(35)).toBe("act_now");
  });

  it("returns soon for 36-45 days", () => {
    expect(urgency(36)).toBe("soon");
    expect(urgency(45)).toBe("soon");
  });

  it("returns this_month for 46-60 days", () => {
    expect(urgency(46)).toBe("this_month");
    expect(urgency(60)).toBe("this_month");
  });

  it("returns plan_ahead for 61+ days", () => {
    expect(urgency(61)).toBe("plan_ahead");
    expect(urgency(365)).toBe("plan_ahead");
  });
});

describe("urgencyToTimingScore()", () => {
  it("act_now scores highest at 90", () => {
    expect(urgencyToTimingScore("act_now")).toBe(90);
  });
  it("soon scores 75", () => {
    expect(urgencyToTimingScore("soon")).toBe(75);
  });
  it("this_month scores 60", () => {
    expect(urgencyToTimingScore("this_month")).toBe(60);
  });
  it("plan_ahead scores 40", () => {
    expect(urgencyToTimingScore("plan_ahead")).toBe(40);
  });
  it("late is penalized at 15", () => {
    expect(urgencyToTimingScore("late")).toBe(15);
  });
});

describe("uploadWindow()", () => {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const event = new Date("2025-12-25T00:00:00.000Z");

  it("Amazon: 8 weeks before → 4 weeks before", () => {
    const { start, end } = uploadWindow("Amazon", event);
    expect((event.getTime() - start.getTime()) / WEEK).toBe(8);
    expect((event.getTime() - end.getTime()) / WEEK).toBe(4);
  });

  it("Etsy: 10 weeks before → 6 weeks before", () => {
    const { start, end } = uploadWindow("Etsy", event);
    expect((event.getTime() - start.getTime()) / WEEK).toBe(10);
    expect((event.getTime() - end.getTime()) / WEEK).toBe(6);
  });

  it("Redbubble: 9 weeks before → 5 weeks before", () => {
    const { start, end } = uploadWindow("Redbubble", event);
    expect((event.getTime() - start.getTime()) / WEEK).toBe(9);
    expect((event.getTime() - end.getTime()) / WEEK).toBe(5);
  });
});
