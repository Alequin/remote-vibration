jest.mock("lodash/uniqueId");
import { sumBy } from "lodash";
import uniqueId from "lodash/uniqueId";
import { newVibrationPattern } from "./new-vibration-pattern";

describe("new-vibration-pattern", () => {
  beforeEach(() => uniqueId.mockImplementation(() => 1));

  it("is able to create a new pattern with the expected properties", () => {
    expect(newVibrationPattern("test1", [0.5, 1, 0.5, 1])).toEqual({
      key: 1,
      name: "test1",
      pattern: [0, 500, 1000, 500, 1000],
      runTime: 3000,
    });
  });

  it("sets the runTime equal to the total time of the pattern in Milliseconds", () => {
    const inputPattern = [0.5, 1, 0.5, 1];
    const pattern = newVibrationPattern("test1", inputPattern);
    expect(pattern.runTime).toBe(sumBy(inputPattern, (time) => time * 1000));
  });

  it("sets the pattern element to zero so vibration always starts right away", () => {
    const pattern = newVibrationPattern("test1", [0.5, 1, 0.5, 1]);
    expect(pattern.pattern[0]).toBe(0);
  });
});
