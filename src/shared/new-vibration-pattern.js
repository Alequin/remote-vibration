import { sum, uniqueId } from "lodash";

const seconds = (amount) => amount * 1000;

/**
 * @param {String} name - The name of the vibration pattern
 * @param {Array<Number>} pattern - The pattern for the vibration to follow where each element is the number of seconds to vibrate or wait for
 */
export const newVibrationPattern = (name, pattern) => {
  const patternInMilliseconds = pattern.map((timeInSeconds) =>
    seconds(timeInSeconds)
  );

  const totalRunTime = sum(patternInMilliseconds);

  return {
    id: uniqueId(),
    name,
    pattern: [0, ...patternInMilliseconds],
    runTime: totalRunTime,
  };
};
