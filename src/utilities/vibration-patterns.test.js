import { newRandomPattern } from "./vibration-patterns";

describe("vibration-patterns - newRandomPattern", () => {
  it("returns a random pattern using math.random", () => {
    const mockRandomOutput = new Array(100).fill(0.4);
    jest
      .spyOn(Math, "random")
      .mockImplementation(() => mockRandomOutput.shift());

    expect(newRandomPattern().pattern).toEqual([0, ...new Array(30).fill(400)]);
  });

  it("half's all the elements in odd indices so the time between vibrations is not too long", () => {
    const mockRandomOutput = new Array(100).fill(0.8);
    jest
      .spyOn(Math, "random")
      .mockImplementation(() => mockRandomOutput.shift());

    expect(newRandomPattern().pattern.slice(0, 10)).toEqual([
      0, 800, 400, 800, 400, 800, 400, 800, 400, 800,
    ]);
  });
});
