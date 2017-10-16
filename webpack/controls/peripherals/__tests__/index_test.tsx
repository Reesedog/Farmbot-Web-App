const mockError = jest.fn();
jest.mock("farmbot-toastr", () => ({
  error: mockError
}));

import * as React from "react";
import { mount } from "enzyme";
import { Peripherals } from "../index";
import { bot } from "../../../__test_support__/fake_state/bot";
import { PeripheralsProps } from "../../../devices/interfaces";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { fakePeripheral } from "../../../__test_support__/fake_state/resources";

describe("<Peripherals />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): PeripheralsProps {
    return {
      bot,
      peripherals: [fakePeripheral()],
      dispatch: jest.fn(),
      resources: buildResourceIndex([]),
      disabled: false
    };
  }

  it("renders", () => {
    const wrapper = mount(<Peripherals {...fakeProps() } />);
    expect(wrapper.text()).toContain("Peripherals");
    expect(wrapper.text()).toContain("EditSave");
    expect(wrapper.text()).toContain("Pin 00");
    const saveButton = wrapper.find("button").at(1);
    expect(saveButton.text()).toContain("Save");
    expect(saveButton.props().hidden).toBeTruthy();
  });

  it("isEditing", () => {
    const wrapper = mount(<Peripherals {...fakeProps() } />);
    expect(wrapper.state().isEditing).toBeFalsy();
    const edit = wrapper.find("button").at(0);
    expect(edit.text()).toEqual("Edit");
    edit.simulate("click");
    expect(wrapper.state().isEditing).toBeTruthy();
  });

  function attemptSave(num: number, error: string) {
    const p = fakeProps();
    p.peripherals[0].body.pin = num;
    const wrapper = mount(<Peripherals {...p } />);
    const save = wrapper.find("button").at(1);
    expect(save.text()).toContain("Save");
    save.simulate("click");
    expect(mockError).toHaveBeenLastCalledWith(error);
  }

  it("save attempt: pin number too small", () => {
    attemptSave(0, "Pin numbers are required and must be positive and unique.");
  });

  it("save attempt: pin number too large", () => {
    attemptSave(9999, "Pin numbers must be less than 1000.");
  });

  it("saves", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = 1;
    const wrapper = mount(<Peripherals {...p } />);
    const save = wrapper.find("button").at(1);
    expect(save.text()).toContain("Save");
    save.simulate("click");
    expect(p.dispatch).toHaveBeenCalled();
  });
});
