let mockSpread = 0;
jest.mock("../../../../open_farm/cached_crop", () => ({
  cachedCrop: jest.fn(() => Promise.resolve({ icon: "", spread: mockSpread })),
}));

import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import {
  fakePlant, fakeWeed,
} from "../../../../__test_support__/fake_state/resources";
import { TaggedWeedPointer } from "farmbot";
import { TaggedPlant } from "../../interfaces";
import { ProfilePointProps } from "../interfaces";
import { PlantPoint, WeedPoint } from "../plants_and_weeds";
import { Color } from "../../../../ui";

describe("<PlantPoint />", () => {
  const fakeProps = (): ProfilePointProps<TaggedPlant> => ({
    point: fakePlant(),
    tools: [],
    getX: () => 0,
    profileAxis: "x",
    reversed: false,
    soilHeight: 0,
    getConfigValue: () => true,
  });

  it("renders plant point", () => {
    mockSpread = 100;
    const wrapper = svgMount(<PlantPoint {...fakeProps()} />);
    expect(wrapper.find("#plant-profile-point").length).toEqual(1);
    expect(wrapper.find("#spread-profile").length).toEqual(1);
  });

  it("renders default spread", () => {
    mockSpread = 0;
    const wrapper = svgMount(<PlantPoint {...fakeProps()} />);
    expect(wrapper.find("#plant-profile-point").length).toEqual(1);
    expect(wrapper.find("#spread-profile").length).toEqual(1);
  });
});

describe("<WeedPoint />", () => {
  const fakeProps = (): ProfilePointProps<TaggedWeedPointer> => ({
    point: fakeWeed(),
    tools: [],
    getX: () => 0,
    profileAxis: "x",
    reversed: false,
    soilHeight: 0,
    getConfigValue: () => true,
  });

  it("renders weed point", () => {
    const p = fakeProps();
    p.point.body.meta.color = "yellow";
    const wrapper = svgMount(<WeedPoint {...p} />);
    expect(wrapper.find("#weed-profile-point").length).toEqual(1);
    expect(wrapper.find("circle").last().props().fill).toEqual("yellow");
  });

  it("uses default color", () => {
    const p = fakeProps();
    p.point.body.meta.color = undefined;
    const wrapper = svgMount(<WeedPoint {...p} />);
    expect(wrapper.find("#weed-profile-point").length).toEqual(1);
    expect(wrapper.find("circle").last().props().fill).toEqual(Color.red);
  });
});
