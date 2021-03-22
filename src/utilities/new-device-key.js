import { random, shuffle } from "lodash";

export const newDeviceKey = () => {
  const creationTimestamp = Date.now();
  return `${newRandomKey({ size: 15 })}--${creationTimestamp}`;
};

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const newRandomKey = ({ size }) =>
  shuffle(
    new Array(size).fill(null).map(() => CHARS[random(0, CHARS.length - 1)])
  ).join("");
