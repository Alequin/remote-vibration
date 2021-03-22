import { uniq } from "lodash";
import { newDeviceKey } from "./new-device-key";

describe("newDeviceKey", () => {
  it("creates a new device key in the expected format", () => {
    expect(newDeviceKey()).toMatch(/...............--\d+/);
  });

  it("should produce a unique set of keys over a large number of attempts", () => {
    const keys = new Array(1_000_000).fill(null).map(newDeviceKey);
    expect(keys.length).toBe(uniq(keys).length);
  });
});
