jest.mock("../../device", () => ({
  devices: {
    current: {
      checkUpdates: jest.fn(() => { return Promise.resolve(); }),
      powerOff: jest.fn(() => { return Promise.resolve(); }),
      reboot: jest.fn(() => { return Promise.resolve(); }),
      checkArduinoUpdates: jest.fn(() => { return Promise.resolve(); }),
      emergencyLock: jest.fn(() => { return Promise.resolve(); }),
      emergencyUnlock: jest.fn(() => { return Promise.resolve(); }),
      execSequence: jest.fn(() => { return Promise.resolve(); }),
      resetMCU: jest.fn(),
      updateMcu: jest.fn(() => { return Promise.resolve(); }),
      togglePin: jest.fn(() => { return Promise.resolve(); }),
      home: jest.fn(() => { return Promise.resolve(); }),
      sync: jest.fn(() => { return Promise.resolve(); })
    }
  }
}));
const mockOk = jest.fn();
const mockInfo = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk, info: mockInfo }));

import * as actions from "../actions";
import { devices } from "../../device";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";

describe("checkControllerUpdates()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls checkUpdates", () => {
    const { mock } = devices.current.checkUpdates as jest.Mock<{}>;
    actions.checkControllerUpdates();
    expect(mock.calls.length).toEqual(1);
    // TODO: It would be nice if this worked to check for sent toasts.
    //       See expectations for each test in comments below.
    // expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("powerOff()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls powerOff", () => {
    const { mock } = devices.current.powerOff as jest.Mock<{}>;
    actions.powerOff();
    expect(mock.calls.length).toEqual(1);
    // expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("reboot()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls reboot", () => {
    const { mock } = devices.current.reboot as jest.Mock<{}>;
    actions.reboot();
    expect(mock.calls.length).toEqual(1);
    // expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("emergencyLock() / emergencyUnlock", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls emergencyLock", () => {
    const { mock } = devices.current.emergencyLock as jest.Mock<{}>;
    actions.emergencyLock();
    expect(mock.calls.length).toEqual(1);
  });

  it("calls emergencyUnlock", () => {
    const { mock } = devices.current.emergencyUnlock as jest.Mock<{}>;
    window.confirm = jest.fn(() => true);
    actions.emergencyUnlock();
    expect(mock.calls.length).toEqual(1);
  });
});

describe("sync()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("doesn't call sync: disconnected", () => {
    const { mock } = devices.current.sync as jest.Mock<{}>;
    const getState = () => fakeState();
    actions.sync()(jest.fn(), getState);
    expect(mock.calls.length).toEqual(0);
    const expectedMessage = ["FarmBot is not connected.", "Disconnected", "red"];
    expect(mockInfo).toBeCalledWith(...expectedMessage);
  });
});

describe("execSequence()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls execSequence", () => {
    const { mock } = devices.current.execSequence as jest.Mock<{}>;
    const s = fakeSequence().body;
    actions.execSequence(s);
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual(s.id);
    // expect(mockOk.mock.calls.length).toEqual(1);
  });

  it("implodes when executing unsaved sequences", () => {
    const { mock } = devices.current.execSequence as jest.Mock<{}>;
    const ok = fakeSequence().body;
    ok.id = undefined;
    expect(() => actions.execSequence(ok)).toThrow();
    expect(mock.calls.length).toEqual(0);
  });
});

describe("MCUFactoryReset()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls resetMCU", () => {
    const { mock } = devices.current.resetMCU as jest.Mock<{}>;
    actions.MCUFactoryReset();
    expect(mock.calls.length).toEqual(1);
    // expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("botConfigChange()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls updateMcu", () => {
    const { mock } = devices.current.updateMcu as jest.Mock<{}>;
    actions.botConfigChange("encoder_enabled_x", 0);
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual({ "encoder_enabled_x": 0 });
    // expect(mockOk.mock.calls.length).toEqual(0);
  });
});

describe("pinToggle()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls togglePin", () => {
    const { mock } = devices.current.togglePin as jest.Mock<{}>;
    actions.pinToggle(5);
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0].pin_number).toEqual(5);
    // expect(mockOk.mock.calls.length).toEqual(0);
  });
});

describe("homeAll()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls home", () => {
    const { mock } = devices.current.home as jest.Mock<{}>;
    actions.homeAll(100);
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0].axis).toEqual("all");
    expect(argList[0].speed).toEqual(100);
    // expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("isLog()", function () {
  it("knows if it is a log or not", () => {
    expect(actions.isLog({})).toBe(false);
    expect(actions.isLog({ message: "foo" })).toBe(true);
  });
});

describe("toggleControlPanel()", function () {
  it("toggles", () => {
    const action = actions.toggleControlPanel("homing_and_calibration");
    expect(action.payload).toEqual("homing_and_calibration");
  });
});
