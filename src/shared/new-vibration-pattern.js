import { sum } from "lodash";
import uniqueId from "lodash/uniqueId";

/**
 * @param {String} name - The name of the vibration pattern
 * @param {Array<Number>} pattern - The pattern for the vibration to follow where each element is the number of seconds to vibrate or wait for
 */
export const newVibrationPattern = (name, pattern) => {
  const patternInMilliseconds = changePatternToMilliseconds(pattern);
  return {
    key: uniqueId(),
    name,
    pattern: [0, ...patternInMilliseconds],
    runTime: sum(patternInMilliseconds),
  };
};

export const changePatternToMilliseconds = (pattern) =>
  pattern.map((timeInSeconds) => seconds(timeInSeconds));

const seconds = (amount) => amount * 1000;
