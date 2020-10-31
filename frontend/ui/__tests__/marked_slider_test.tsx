import React from "react";
import { shallow } from "enzyme";
import { MarkedSlider, MarkedSliderProps } from "../marked_slider";
import { fakeImage } from "../../__test_support__/fake_state/resources";
import { MultiSlider, Slider } from "@blueprintjs/core";

describe("<MarkedSlider />", () => {
  const fakeProps = (): MarkedSliderProps => ({
    min: 0,
    max: 100,
    labelStepSize: 1,
    value: 10,
    images: [fakeImage(), fakeImage(), fakeImage()],
    onChange: jest.fn(),
    labelRenderer: jest.fn(),
    imageIndex: jest.fn(),
  });

  it("displays slider", () => {
    const p = fakeProps();
    const wrapper = shallow(<MarkedSlider {...p} />);
    expect(wrapper.find(Slider).length).toEqual(1);
    expect(wrapper.find(MultiSlider.Handle).length).toEqual(3);
  });
});
