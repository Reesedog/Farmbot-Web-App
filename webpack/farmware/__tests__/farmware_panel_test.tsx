const mockDevice = {
  installFarmware: jest.fn(() => { return Promise.resolve(); }),
  updateFarmware: jest.fn(() => { return Promise.resolve(); }),
  removeFarmware: jest.fn(() => { return Promise.resolve(); }),
  execScript: jest.fn(() => { return Promise.resolve(); }),
  installFirstPartyFarmware: jest.fn(),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../actions", () => ({
  getFirstPartyFarmwareList(setList: (x: string[]) => void) {
    setList(["first-party farmware"]);
  }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { getDevice } from "../../device";
import { FarmwarePanel, FarmwareConfigMenu } from "../farmware_panel";
import { FWProps, FarmwareConfigMenuProps } from "../interfaces";
import { fakeFarmwares } from "../../__test_support__/fake_farmwares";

describe("<FarmwarePanel/>: actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FWProps {
    return {
      syncStatus: "synced",
      farmwares: {}
    };
  }

  it("calls install", () => {
    const { mock } = getDevice().installFarmware as jest.Mock<{}>;
    const panel = mount(<FarmwarePanel {...fakeProps() } />);
    const buttons = panel.find("button");
    expect(buttons.at(0).text()).toEqual("Install");
    panel.setState({ packageUrl: "install this" });
    buttons.at(0).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("install this");
  });

  it("farmware not selected", () => {
    const updateFarmware = getDevice().updateFarmware;
    const panel = mount(<FarmwarePanel {...fakeProps() } />);
    panel.setState({ selectedFarmware: undefined });
    const updateBtn = panel.find("button").at(3);
    expect(updateBtn.text()).toEqual("Update");
    updateBtn.simulate("click");
    expect(updateFarmware).not.toHaveBeenCalled();
    const installBtn = panel.find("button").at(0);
    expect(installBtn.text()).toEqual("Install");
    installBtn.simulate("click");
    expect(updateFarmware).not.toHaveBeenCalled();
  });

  it("calls update", () => {
    const { mock } = getDevice().updateFarmware as jest.Mock<{}>;
    const panel = mount(<FarmwarePanel {...fakeProps() } />);
    const buttons = panel.find("button");
    expect(buttons.at(3).text()).toEqual("Update");
    panel.setState({ selectedFarmware: "update this" });
    buttons.at(3).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("update this");
  });

  it("calls remove", () => {
    const removeFarmware = getDevice().removeFarmware;
    const panel = mount(<FarmwarePanel {...fakeProps() } />);
    const removeBtn = panel.find("button").at(2);
    expect(removeBtn.text()).toEqual("Remove");
    panel.setState({ selectedFarmware: "remove this" });
    removeBtn.simulate("click");
    expect(removeFarmware).toHaveBeenCalledTimes(1);
    expect(removeFarmware).toHaveBeenCalledWith("remove this");
    panel.setState({ selectedFarmware: "first-party farmware" });
    removeBtn.simulate("click");
    expect(removeFarmware).toHaveBeenCalledTimes(1);
    // tslint:disable-next-line:no-any
    (global as any).confirm = () => true;
    removeBtn.simulate("click");
    expect(removeFarmware).toHaveBeenCalledTimes(2);
    expect(removeFarmware).toHaveBeenLastCalledWith("first-party farmware");
  });

  it("calls run", () => {
    const { mock } = getDevice().execScript as jest.Mock<{}>;
    const panel = mount(<FarmwarePanel {...fakeProps() } />);
    const buttons = panel.find("button");
    expect(buttons.at(4).text()).toEqual("Run");
    panel.setState({ selectedFarmware: "run this" });
    buttons.at(4).simulate("click");
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual("run this");
  });

  it("sets url to install", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps() } />);
    const input = panel.find("input").first();
    input.simulate("change", { currentTarget: { value: "inputted url" } });
    expect(panel.state().packageUrl).toEqual("inputted url");
  });

  it("selects a farmware", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps() } />);
    const dropdown = panel.find("FBSelect").first();
    dropdown.simulate("change", { value: "selected farmware" });
    expect(panel.state().selectedFarmware).toEqual("selected farmware");
    const badInputValue = () => dropdown.simulate("change", { value: 5 });
    expect(badInputValue).toThrowError("Bad farmware name: 5");
  });
});

describe("<FarmwarePanel/>: farmware list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FWProps {
    return {
      syncStatus: "synced",
      farmwares: fakeFarmwares()
    };
  }

  it("lists farmware", () => {
    const p = fakeProps();
    const firstPartyFarmware = fakeFarmwares().farmware_0;
    if (firstPartyFarmware) { firstPartyFarmware.name = "first-party farmware"; }
    p.farmwares.farmware_1 = firstPartyFarmware;
    const panel = shallow(<FarmwarePanel {...p } />);
    expect(panel.find("FBSelect").props().list).toEqual([{
      label: "My Farmware 0.0.0", value: "My Farmware"
    }]);
    panel.setState({ showFirstParty: true });
    expect(panel.find("FBSelect").props().list).toEqual([
      { label: "My Farmware 0.0.0", value: "My Farmware" },
      { label: "first-party farmware 0.0.0", value: "first-party farmware" }
    ]);
  });

  it("toggles first party farmware display", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps() } />);
    panel.setState({ showFirstParty: true });
    expect(panel.state().showFirstParty).toBeTruthy();
    // tslint:disable-next-line:no-any
    const instance = panel.instance() as any;
    instance.toggleFirstPartyDisplay();
    expect(panel.state().showFirstParty).toBeFalsy();
  });

  it("displays description", () => {
    const panel = mount(<FarmwarePanel {...fakeProps() } />);
    panel.setState({ selectedFarmware: "My Farmware" });
    expect(panel.text()).toContain("Does things.");
  });

  it("all 1st party farmwares are installed", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps() } />);
    // tslint:disable-next-line:no-any
    const instance = panel.instance() as any;
    const allInstalled = instance.firstPartyFarmwaresPresent([
      "My Farmware"]);
    expect(allInstalled).toBeTruthy();
  });

  it("some 1st party farmwares are missing", () => {
    const panel = shallow(<FarmwarePanel {...fakeProps() } />);
    // tslint:disable-next-line:no-any
    const instance = panel.instance() as any;
    const allInstalled = instance.firstPartyFarmwaresPresent([
      "My Farmware", "Other Farmware"]);
    expect(allInstalled).toBeFalsy();
  });
});

describe("<FarmwareConfigMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function fakeProps(): FarmwareConfigMenuProps {
    return {
      show: true,
      toggle: jest.fn(),
      firstPartyFwsInstalled: false
    };
  }

  it("calls install 1st party farmwares", () => {
    const firstParty = getDevice().installFirstPartyFarmware;
    const wrapper = mount(
      <FarmwareConfigMenu {...fakeProps() } />);
    const button = wrapper.find("button").first();
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
    expect(firstParty).toHaveBeenCalled();
  });

  it("1st party farmwares all installed", () => {
    const firstParty = getDevice().installFirstPartyFarmware;
    const p = fakeProps();
    p.firstPartyFwsInstalled = true;
    const wrapper = mount(
      <FarmwareConfigMenu {...p } />);
    const button = wrapper.find("button").first();
    expect(button.hasClass("fa-download")).toBeTruthy();
    button.simulate("click");
    expect(firstParty).not.toHaveBeenCalled();
  });

  it("toggles 1st party farmware display", () => {
    const p = fakeProps();
    const wrapper = mount(
      <FarmwareConfigMenu {...p} />);
    const button = wrapper.find("button").last();
    expect(button.hasClass("green")).toBeTruthy();
    expect(button.hasClass("fb-toggle-button")).toBeTruthy();
    button.simulate("click");
    expect(p.toggle).toHaveBeenCalled();
  });

  it("1st party farmware display is disabled", () => {
    const p = fakeProps();
    p.show = false;
    const wrapper = mount(
      <FarmwareConfigMenu {...p} />);
    const button = wrapper.find("button").last();
    expect(button.hasClass("red")).toBeTruthy();
  });
});
