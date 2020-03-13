const mockDevice = { moveAbsolute: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../config_storage/actions", () => ({
  toggleWebAppBool: jest.fn(),
}));

jest.mock("../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => false,
  }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { Move } from "../move";
import { bot } from "../../../__test_support__/fake_state/bot";
import { MoveProps } from "../interfaces";
import { toggleWebAppBool } from "../../../config_storage/actions";
import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../../session_keys";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";

describe("<Move />", () => {
  const mockConfig: Dictionary<boolean> = {};

  const fakeProps = (): MoveProps => ({
    dispatch: jest.fn(),
    bot: bot,
    arduinoBusy: false,
    firmwareSettings: bot.hardware.mcu_params,
    getWebAppConfigVal: jest.fn((key) => (mockConfig[key])),
    env: {},
    firmwareHardware: undefined,
  });

  it("has default elements", () => {
    const wrapper = mount(<Move {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["move amount (mm)", "110100100010000", "x axisy axisz axis", "motor", "go"]
      .map(string => expect(txt).toContain(string));
  });

  it("has only raw encoder data display", () => {
    const p = fakeProps();
    mockConfig.raw_encoders = true;
    const wrapper = mount(<Move {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).not.toContain("scaled");
  });

  it("has both encoder data displays", () => {
    const p = fakeProps();
    mockConfig.raw_encoders = true;
    mockConfig.scaled_encoders = true;
    const wrapper = mount(<Move {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).toContain("scaled");
  });

  it("toggle: invert jog button", () => {
    const wrapper = mount<Move>(<Move {...fakeProps()} />);
    wrapper.instance().toggle(BooleanSetting.xy_swap)();
    expect(toggleWebAppBool).toHaveBeenCalledWith(BooleanSetting.xy_swap);
  });

  it("changes step size", () => {
    const p = fakeProps();
    const wrapper = mount(<Move {...p} />);
    clickButton(wrapper, 0, "1");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHANGE_STEP_SIZE,
      payload: 1
    });
  });

  it("displays motor position plot", () => {
    mockConfig.show_motor_plot = true;
    const wrapper = shallow(<Move {...fakeProps()} />);
    expect(wrapper.html()).toContain("motor-position-plot");
  });
});
