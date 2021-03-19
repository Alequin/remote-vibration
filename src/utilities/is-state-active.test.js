import { isStateActive } from "./is-state-active";

describe("isStateActive", () => {
  it("returns true when state is active", () => {
    expect(isStateActive("active")).toBe(true);
  });

  it("returns false when state is inactive", () => {
    expect(isStateActive("inactive")).toBe(false);
  });

  it("returns false when state is background", () => {
    expect(isStateActive("background")).toBe(false);
  });
});
