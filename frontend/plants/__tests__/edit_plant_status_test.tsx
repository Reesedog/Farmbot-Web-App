jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { EditPlantStatusProps } from "../plant_panel";
import { shallow } from "enzyme";
import {
  fakePlant, fakePoint, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";
import {
  EditPlantStatus, PlantStatusBulkUpdateProps, PlantStatusBulkUpdate,
  EditWeedStatus, EditWeedStatusProps, PointSizeBulkUpdate,
  BulkUpdateBaseProps,
  PointColorBulkUpdate,
  PlantDateBulkUpdateProps,
  PlantDateBulkUpdate,
} from "../edit_plant_status";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<EditPlantStatus />", () => {
  const fakeProps = (): EditPlantStatusProps => ({
    uuid: "Plant.0.0",
    plantStatus: "planned",
    updatePlant: jest.fn(),
  });

  it("changes stage to planted", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPlantStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planted" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z")
    });
  });

  it("changes stage to planned", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPlantStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planned" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planned",
      planted_at: undefined
    });
  });
});

describe("<PlantStatusBulkUpdate />", () => {
  const fakeProps = (): PlantStatusBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    pointerType: "Plant",
  });

  it("doesn't update plant statuses", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "planted" });
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates plant statuses", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "planted" });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change status to 'planted' for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
    expect(edit).toHaveBeenCalledWith(plant2, {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
  });

  it("updates weed statuses", () => {
    const p = fakeProps();
    p.pointerType = "Weed";
    const weed1 = fakeWeed();
    const weed2 = fakeWeed();
    const weed3 = fakeWeed();
    p.allPoints = [weed1, weed2, weed3];
    p.selected = [weed1.uuid, weed2.uuid];
    const wrapper = shallow(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "removed" });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change status to 'removed' for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(weed1, { plant_stage: "removed" });
    expect(edit).toHaveBeenCalledWith(weed2, { plant_stage: "removed" });
  });
});

describe("<PlantDateBulkUpdate />", () => {
  const fakeProps = (): PlantDateBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("doesn't update plant dates", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PlantDateBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "2017-05-29T05:00:00.000Z" } });
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates plant dates", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantDateBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "2017-05-29T05:00:00.000Z" } });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change start date to 2017-05-29 for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, {
      planted_at: "2017-05-29T05:00:00.000Z",
    });
    expect(edit).toHaveBeenCalledWith(plant2, {
      planted_at: "2017-05-29T05:00:00.000Z",
    });
  });
});

describe("<PointSizeBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("doesn't update plant sizes", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PointSizeBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("input").simulate("change", { currentTarget: { value: "1" } });
    wrapper.find("input").simulate("blur");
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates plant sizes", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PointSizeBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("input").simulate("change", { currentTarget: { value: "1" } });
    wrapper.find("input").simulate("blur");
    expect(window.confirm).toHaveBeenCalledWith(
      "Change radius to 1mm for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, { radius: 1 });
    expect(edit).toHaveBeenCalledWith(plant2, { radius: 1 });
  });
});

describe("<PointColorBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("doesn't update point colors", () => {
    const p = fakeProps();
    const point1 = fakePlant();
    const point2 = fakePlant();
    p.allPoints = [point1, point2];
    p.selected = [point1.uuid];
    const wrapper = shallow(<PointColorBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("ColorPicker").simulate("change", "green");
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates point colors", () => {
    const p = fakeProps();
    const point1 = fakePoint();
    const point2 = fakePoint();
    const point3 = fakePoint();
    p.allPoints = [point1, point2, point3];
    p.selected = [point1.uuid, point2.uuid];
    const wrapper = shallow(<PointColorBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("ColorPicker").simulate("change", "green");
    expect(window.confirm).toHaveBeenCalledWith(
      "Change color to green for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(point1, { meta: { color: "green" } });
    expect(edit).toHaveBeenCalledWith(point2, { meta: { color: "green" } });
  });
});

describe("<EditWeedStatus />", () => {
  const fakeProps = (): EditWeedStatusProps => ({
    weed: fakeWeed(),
    updateWeed: jest.fn(),
  });

  it("updates weed status", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditWeedStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "removed" });
    expect(p.updateWeed).toHaveBeenCalledWith({ plant_stage: "removed" });
  });
});
