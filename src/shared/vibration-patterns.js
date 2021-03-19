import { newVibrationPattern } from "./new-vibration-pattern";

export const RANDOM_PATTERN_NAME = "Random";

export const newRandomPattern = () =>
  newVibrationPattern(
    RANDOM_PATTERN_NAME,
    new Array(100).fill(null).map((_, index) => {
      const randomTime = Math.random();
      // Time between vibrations should not be long so odd values are always less than 0.5
      const doesTimeRepresentPause = index % 2 === 1;
      if (doesTimeRepresentPause && randomTime >= 0.5) return Math.random() / 2;
      return randomTime;
    })
  );

export const patterns = [
  newVibrationPattern("Constant", [Number.MAX_SAFE_INTEGER]),
  newVibrationPattern(RANDOM_PATTERN_NAME, []),
  newVibrationPattern("Rapid Pulse", [0.125, 0.125]),
  newVibrationPattern("Quick Pulse", [0.25, 0.25]),
  newVibrationPattern("Pulse", [0.5, 0.5]),
  newVibrationPattern("Slow Pulse", [1, 1]),
  newVibrationPattern("Slow Pulse", [1, 1]),
  newVibrationPattern("Mario", [
    0.125,
    0.075,
    0.125,
    0.275,
    0.2,
    0.275,
    0.125,
    0.075,
    0.125,
    0.275,
    0.2,
    0.6,
    0.2,
    0.6,
  ]),
];
