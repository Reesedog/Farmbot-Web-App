let mockDemo = false;
jest.mock("../../devices/must_be_online", () => ({
  forceOnline: () => mockDemo,
}));

import { validBotLocationData } from "../location";
import { LocationData } from "farmbot";

describe("validBotLocationData()", () => {
  it("returns valid location_data object", () => {
    const result = validBotLocationData(undefined);
    expect(result).toEqual({
      position: { x: undefined, y: undefined, z: undefined },
      scaled_encoders: { x: undefined, y: undefined, z: undefined },
      raw_encoders: { x: undefined, y: undefined, z: undefined }
    });
  });

  it("returns valid location_data object when a partial is provided", () => {
    const result = validBotLocationData(
      { raw_encoders: { x: 123 } } as LocationData);
    expect(result).toEqual({
      position: { x: undefined, y: undefined, z: undefined },
      scaled_encoders: { x: undefined, y: undefined, z: undefined },
      raw_encoders: { x: 123, y: undefined, z: undefined }
    });
  });

  it("returns 0s for demo accounts", () => {
    mockDemo = true;
    const result = validBotLocationData(undefined);
    expect(result).toEqual({
      position: { x: 0, y: 0, z: 0 },
      scaled_encoders: { x: 0, y: 0, z: 0 },
      raw_encoders: { x: 0, y: 0, z: 0 }
    });
  });

  it("returns location for demo accounts", () => {
    mockDemo = true;
    localStorage.x = "1";
    localStorage.y = "2";
    localStorage.z = "3";
    const result = validBotLocationData(undefined);
    expect(result).toEqual({
      position: { x: 1, y: 2, z: 3 },
      scaled_encoders: { x: 0, y: 0, z: 0 },
      raw_encoders: { x: 0, y: 0, z: 0 }
    });
  });
});
