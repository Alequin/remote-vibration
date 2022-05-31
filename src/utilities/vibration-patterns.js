import { clone, random } from "lodash";
import round from "lodash/round";
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

const RISE_PATTERN = [
  0.1, 0.2, 0.1, 0.2, 0.15, 0.2, 0.15, 0.2, 0.2, 0.2, 0.2, 0.2, 0.25, 0.2, 0.25,
  0.2, 0.3, 0.2, 0.3, 0.2, 0.4, 0.2, 0.4, 0.2, 0.5, 0.2, 0.5, 0.2, 0.6, 0.2,
  0.6, 0.2, 0.7, 0.3, 0.7, 0.4, 0.9, 0.4, 0.9, 0.4, 1.3, 0.4, 1.3, 0.4, 1.7,
  0.4, 1.7, 0.4, 3,
];
const FAST_RISE_PATTERN = [
  0.1, 0.2, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.2, 0.3, 0.2, 0.5, 0.2, 0.5,
  0.2, 0.7, 0.3, 0.7, 0.4, 1.3,
];

const HEART_RATE_PATTERN = [0.15, 0.15, 0.2, 0.65];

const reverseArray = (array) => clone(array).reverse();

const rawPatterns = [
  newVibrationPattern("Constant", [Number.MAX_SAFE_INTEGER], "🔁"),
  newVibrationPattern(RANDOM_PATTERN_NAME, [], "🎲"),
  newVibrationPattern("Drum Roll", [0.1, 0.1], "🥁"),
  newVibrationPattern("Heart Beat", HEART_RATE_PATTERN, "💓"),
  newVibrationPattern(
    "Fast Heart Beat",
    HEART_RATE_PATTERN.map((time) => time / 1.5),
    "💞"
  ),
  newVibrationPattern("Rise", [...RISE_PATTERN, 0.5], "🔼"),
  newVibrationPattern("Fast Rise", [...FAST_RISE_PATTERN, 0.5], "⏫"),
  newVibrationPattern("Fall", [...reverseArray(RISE_PATTERN), 0.5], "🔽"),
  newVibrationPattern(
    "Fast Fall",
    [...reverseArray(FAST_RISE_PATTERN), 0.5],
    "⏬"
  ),
  newVibrationPattern(
    "Rise and Fall",
    [...FAST_RISE_PATTERN, 0.5, ...reverseArray(FAST_RISE_PATTERN), 0.5],
    "↕️"
  ),
  newVibrationPattern("Triplet", [0.3, 0.1, 0.3, 0.1, 0.3, 0.5], "3️⃣"),
  newVibrationPattern(
    "S.O.S",
    [
      0.15, 0.15, 0.15, 0.15, 0.15, 0.45, 0.45, 0.15, 0.45, 0.15, 0.45, 0.45,
      0.15, 0.15, 0.15, 0.15, 0.15, 0.8,
    ],
    "🆘"
  ),
  newVibrationPattern(
    "Bumpy Road",
    [0.6, 0.12, 0.18, 0.12, 0.18, 0.12, 0.18, 0.12, 0.18, 0.12],
    "🚵‍♀️"
  ),
  newVibrationPattern("Punch", [0.25, 0.3], "👊"),
  newVibrationPattern(
    "Explosion",
    [0.3, 0.2, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.4, 1, 0.75],
    "💥"
  ),
  newVibrationPattern(
    "Sparkle",
    [
      0.1, 0.34, 0.1, 0.38, 0.1, 0.53, 0.1, 0.35, 0.1, 0.21, 0.1, 0.74, 0.1,
      0.31, 0.1, 0.25, 0.1, 0.69, 0.1, 0.29, 0.1, 0.38, 0.1, 0.56, 0.1, 0.21,
      0.1, 0.34, 0.1, 0.46,
    ],
    "✨"
  ),
  newVibrationPattern("Dripping Water", [0.1, 1], "💧"),
  newVibrationPattern("Waves", [3, 1], "🌊"),
];

export const patterns = rawPatterns.reduce((patterns, pattern) => {
  return {
    ...patterns,
    [pattern.name]: pattern,
  };
}, {});
