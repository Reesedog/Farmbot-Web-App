import * as React from "react";
import { mount } from "enzyme";
import { PeripheralForm } from "../peripheral_form";
import { TaggedPeripheral } from "../../../resources/tagged_resources";

describe("<PeripheralForm/>", function () {
  let dispatch = jest.fn();
  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "peripherals.2.2",
      kind: "peripherals",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED"
      }
    },
    {
      uuid: "peripherals.1.1",
      kind: "peripherals",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2"
      }
    },
  ];

  it("renders a list of editable peripherals, in sorted order", function () {
    let form = mount(<PeripheralForm dispatch={dispatch}
      peripherals={peripherals} />);
    let inputs = form.find("input");
    let buttons = form.find("button");
    expect(inputs.at(0).props().value).toEqual("GPIO 2");
    inputs.at(0).simulate("change");
    expect(inputs.at(1).props().value).toEqual("2");
    inputs.at(1).simulate("change");
    buttons.at(0).simulate("click");
    expect(inputs.at(2).props().value).toEqual("GPIO 13 - LED");
    inputs.at(2).simulate("change");
    expect(inputs.at(3).props().value).toEqual("13");
    inputs.at(3).simulate("change");
    buttons.at(1).simulate("click");
    expect(dispatch.mock.calls.length).toEqual(6);
  });
});
