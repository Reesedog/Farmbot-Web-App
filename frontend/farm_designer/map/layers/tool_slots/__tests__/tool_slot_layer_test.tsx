let mockPath = "/app/designer/plants";
jest.mock("../../../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

let mockDev = false;
jest.mock("../../../../../account/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import * as React from "react";
import { ToolSlotLayer, ToolSlotLayerProps } from "../tool_slot_layer";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";
import { fakeResource } from "../../../../../__test_support__/fake_resource";
import { shallow } from "enzyme";
import { history } from "../../../../../history";
import { ToolSlotPointer } from "farmbot/dist/resources/api_resources";
import { TaggedToolSlotPointer } from "farmbot";
import { ToolSlotPoint } from "../tool_slot_point";

describe("<ToolSlotLayer/>", () => {
  function fakeProps(): ToolSlotLayerProps {
    const ts: ToolSlotPointer = {
      pointer_type: "ToolSlot",
      tool_id: undefined,
      name: "Name",
      radius: 50,
      x: 1,
      y: 2,
      z: 3,
      meta: {},
      pullout_direction: 0,
      gantry_mounted: false,
    };
    const toolSlot: TaggedToolSlotPointer = fakeResource("Point", ts);
    return {
      visible: false,
      slots: [{ toolSlot, tool: undefined }],
      botPositionX: undefined,
      mapTransformProps: fakeMapTransformProps(),
      dispatch: jest.fn(),
      hoveredToolSlot: undefined,
    };
  }
  it("toggles visibility off", () => {
    const result = shallow(<ToolSlotLayer {...fakeProps()} />);
    expect(result.find(ToolSlotPoint).length).toEqual(0);
  });

  it("toggles visibility on", () => {
    const p = fakeProps();
    p.visible = true;
    const result = shallow(<ToolSlotLayer {...p} />);
    expect(result.find(ToolSlotPoint).length).toEqual(1);
  });

  it("navigates to tools page", async () => {
    mockDev = true;
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p} />);
    const tools = wrapper.find("g").first();
    await tools.simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/tools");
  });

  it("doesn't navigate to tools page", async () => {
    mockPath = "/app/designer/plants/1";
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p} />);
    const tools = wrapper.find("g").first();
    await tools.simulate("click");
    expect(history.push).not.toHaveBeenCalled();
  });

  it("is in non-clickable mode", () => {
    mockPath = "/app/designer/plants/crop_search/mint/add";
    const p = fakeProps();
    const wrapper = shallow(<ToolSlotLayer {...p} />);
    expect(wrapper.find("g").props().style)
      .toEqual({ pointerEvents: "none" });
  });
});
