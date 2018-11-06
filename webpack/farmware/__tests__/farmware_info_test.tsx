const mockDevice = {
  updateFarmware: jest.fn(() => Promise.resolve({})),
  removeFarmware: jest.fn(() => Promise.resolve({})),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwareInfoProps, FarmwareInfo } from "../farmware_info";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";

describe("<FarmwareInfo />", () => {
  const fakeProps = (): FarmwareInfoProps => {
    return {
      farmware: fakeFarmware(),
      showFirstParty: false,
      firstPartyFarmwareNames: [],
      dispatch: jest.fn(),
      installations: [],
      shouldDisplay: () => false,
    };
  };

  it("renders no manifest info message", () => {
    const p = fakeProps();
    p.farmware = undefined;
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toEqual("Not available when device is offline.");
  });

  it("renders info", () => {
    const wrapper = mount(<FarmwareInfo {...fakeProps()} />);
    ["Description", "Version", "Language", "Author", "Manage"].map(string =>
      expect(wrapper.text()).toContain(string));
    expect(wrapper.text()).toContain("Does things.");
  });

  it("doesn't render farmware tools version", () => {
    const p = fakeProps();
    if (p.farmware) { p.farmware.farmware_tools_version = "latest"; }
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).not.toContain("Farmware Tools version");
  });

  it("renders farmware tools version", () => {
    const p = fakeProps();
    if (p.farmware) { p.farmware.farmware_tools_version = "1.0.0"; }
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toContain("Farmware Tools version");
  });

  it("renders 1st-party author", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    p.farmware.meta.author = "Farmbot.io";
    const wrapper = mount(<FarmwareInfo {...p} />);
    expect(wrapper.text()).toContain("FarmBot, Inc.");
  });

  it("updates Farmware", () => {
    const wrapper = mount(<FarmwareInfo {...fakeProps()} />);
    clickButton(wrapper, 0, "Update");
    expect(mockDevice.updateFarmware).toHaveBeenCalledWith("My Fake Farmware");
  });

  it("doesn't update Farmware", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    // tslint:disable-next-line:no-any
    p.farmware.name = undefined as any;
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 0, "Update");
    expect(mockDevice.updateFarmware).not.toHaveBeenCalled();
  });

  it("removes Farmware", () => {
    const wrapper = mount(<FarmwareInfo {...fakeProps()} />);
    clickButton(wrapper, 1, "Remove");
    expect(mockDevice.removeFarmware).toHaveBeenCalledWith("My Fake Farmware");
  });

  it("removes Farmware", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    // tslint:disable-next-line:no-any
    p.farmware.name = undefined as any;
    const wrapper = mount(<FarmwareInfo {...p} />);
    clickButton(wrapper, 1, "Remove");
    expect(mockDevice.removeFarmware).not.toHaveBeenCalled();
  });

  it("doesn't remove 1st-party Farmware", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    p.farmware.name = "Fake 1st-Party Farmware";
    p.firstPartyFarmwareNames = ["Fake 1st-Party Farmware"];
    const wrapper = mount(<FarmwareInfo {...p} />);
    window.confirm = jest.fn(() => false);
    clickButton(wrapper, 1, "Remove");
    expect(mockDevice.removeFarmware).not.toHaveBeenCalled();
  });

  it("removes 1st-party Farmware", () => {
    const p = fakeProps();
    p.farmware = fakeFarmware();
    p.farmware.name = "Fake 1st-Party Farmware";
    p.firstPartyFarmwareNames = ["Fake 1st-Party Farmware"];
    const wrapper = mount(<FarmwareInfo {...p} />);
    window.confirm = jest.fn(() => true);
    clickButton(wrapper, 1, "Remove");
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("you sure"));
    expect(mockDevice.removeFarmware)
      .toHaveBeenCalledWith("Fake 1st-Party Farmware");
  });
});
