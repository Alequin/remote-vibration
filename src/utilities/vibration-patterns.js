import { groupBy, mapValues, round } from "lodash";
import { newVibrationPattern } from "./new-vibration-pattern";

export const RANDOM_PATTERN_NAME = "Random";

export const newRandomPattern = () =>
  newVibrationPattern(
    RANDOM_PATTERN_NAME,
    new Array(30).fill(null).map((_, index) => {
      const randomTime = Math.random();

      const doesTimeRepresentPause = index % 2 === 1;
      return round(
        doesTimeRepresentPause && randomTime >= 0.5
          ? randomTime / 2 // Time between vibrations should not be long so odd values are always less than 0.5
          : randomTime,
        2
      );
    })
  );

export const patterns = mapValues(
  groupBy(
    [
      newVibrationPattern("Constant", [Number.MAX_SAFE_INTEGER]),
      newVibrationPattern(RANDOM_PATTERN_NAME, []),
      newVibrationPattern("Pulse", [0.5, 0.5]),
      newVibrationPattern("Rapid Pulse", [0.5, 0.1]),
      newVibrationPattern("Increasing", [
        0.1,
        0.2,
        0.1,
        0.2,
        0.2,
        0.2,
        0.2,
        0.2,
        0.3,
        0.2,
        0.3,
        0.2,
        0.5,
        0.2,
        0.5,
        0.2,
        0.7,
        0.3,
        0.7,
        0.4,
        1.3,
        0.5,
      ]),
      newVibrationPattern("Decreasing", [
        1.3,
        0.5,
        0.7,
        0.4,
        0.7,
        0.3,
        0.5,
        0.2,
        0.5,
        0.2,
        0.3,
        0.2,
        0.3,
        0.2,
        0.2,
        0.2,
        0.2,
        0.2,
        0.1,
        0.2,
        0.1,
        0.1,
        0.1,
        0.1,
        0.05,
        0.1,
        0.05,
        0.5,
      ]),
      newVibrationPattern("Triplet", [0.3, 0.1, 0.3, 0.1, 0.3, 0.5]),
      newVibrationPattern("S.O.S", [
        0.15,
        0.15,
        0.15,
        0.15,
        0.15,
        0.45,
        0.45,
        0.15,
        0.45,
        0.15,
        0.45,
        0.45,
        0.15,
        0.15,
        0.15,
        0.15,
        0.15,
        0.8,
      ]),
    ],
    ({ name }) => name
  ),
  ([element]) => element
);
