const mockDevice = {
  setUserEnv: jest.fn(() => Promise.resolve({})),
  execScript: jest.fn(() => Promise.resolve({}))
};
jest.mock("../../../device", () => {
  return {
    getDevice: () => (mockDevice)
  };
});

let mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
let mockDelete = Promise.resolve();
jest.mock("axios", () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: mockData })),
    delete: jest.fn(() => mockDelete),
  }
}));

const mockInc = jest.fn();
const mockFinish = jest.fn();
jest.mock("../../../util", () => ({
  Progress: () => ({ inc: mockInc, finish: mockFinish }),
  trim: () => { },
}));

import { translateImageWorkspaceAndSave, deletePoints } from "../actions";
import { scanImage, test } from "../actions";
import axios from "axios";
import { API } from "../../../api";
import { success, error } from "farmbot-toastr";
import { times } from "lodash";
import { Actions } from "../../../constants";

describe("actions", () => {
  it("Saves environment variables", () => {
    /** This test is just here to make sure that envSave() is actually
     * triggering side effects. */
    const translator = translateImageWorkspaceAndSave({
      "iteration": "WEED_DETECTOR_iteration",
      "morph": "WEED_DETECTOR_morph",
      "blur": "WEED_DETECTOR_blur",
      "H_HI": "WEED_DETECTOR_H_HI",
      "H_LO": "WEED_DETECTOR_H_LO",
      "S_HI": "WEED_DETECTOR_S_HI",
      "S_LO": "WEED_DETECTOR_S_LO",
      "V_HI": "WEED_DETECTOR_V_HI",
      "V_LO": "WEED_DETECTOR_V_LO"
    });
    translator("H_HI", 45);
    expect(mockDevice.setUserEnv)
      .toHaveBeenLastCalledWith({ "WEED_DETECTOR_H_HI": "45" });
  });
});

describe("scanImage()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = scanImage(5);
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("historical-plant-detection", [{
        args: { label: "PLANT_DETECTION_selected_image", value: "5" },
        kind: "pair"
      }]);
  });
});

describe("test()", () => {
  it("calls out to the device", () => {
    // Run function to invoke side effects
    const thunk = test();
    thunk();
    // Ensure the side effects were the ones we expected.
    expect(mockDevice.execScript)
      .toHaveBeenCalledWith("plant-detection");
  });
});

describe("deletePoints()", () => {
  API.setBaseUrl("");

  it("deletes points", async () => {
    mockDelete = Promise.resolve();
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    await deletePoints("weeds", "plant-detection")(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/points/search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith("http://localhost/api/points/1,2,3");
    expect(dispatch).toHaveBeenCalledWith({
      payload: [1, 2, 3],
      type: Actions.DELETE_POINT_OK
    });
    expect(mockInc).toHaveBeenCalledTimes(2);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith("Deleted 3 weeds", "Success");
    expect(error).not.toHaveBeenCalled();
  });

  it("can't delete points", async () => {
    mockDelete = Promise.reject("error");
    mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const dispatch = jest.fn();
    await deletePoints("weeds", "plant-detection")(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/points/search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith("http://localhost/api/points/1,2,3");
    await expect(dispatch).not.toHaveBeenCalled();
    expect(mockInc).toHaveBeenCalledTimes(1);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalledWith();
    expect(error).toHaveBeenCalledWith(
      "Some weeds failed to delete. Are they in use by sequences?");
  });

  it("chunks points", async () => {
    mockDelete = Promise.resolve();
    mockData = times(200, () => ({ id: 1 }));
    const dispatch = jest.fn();
    await deletePoints("weeds", "plant-detection")(dispatch, jest.fn());
    expect(axios.post).toHaveBeenCalledWith("http://localhost/api/points/search",
      { meta: { created_by: "plant-detection" } });
    await expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining(":///api/points/1,"));
    expect(dispatch).toHaveBeenCalledWith({
      payload: expect.arrayContaining([1]),
      type: Actions.DELETE_POINT_OK
    });
    expect(mockInc).toHaveBeenCalledTimes(3);
    expect(mockFinish).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith("Deleted 200 weeds", "Success");
    expect(error).not.toHaveBeenCalled();
  });
});
