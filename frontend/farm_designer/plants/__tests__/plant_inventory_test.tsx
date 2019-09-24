jest.mock("react-redux", () => ({ connect: jest.fn(() => (x: {}) => x) }));

import * as React from "react";
import { RawPlants, PlantInventoryProps } from "../plant_inventory";
import { mount, shallow } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<PlantInventory />", () => {
  const fakeProps = (): PlantInventoryProps => ({
    plants: [fakePlant()],
    dispatch: jest.fn(),
    hoveredPlantListItem: undefined,
  });

  it("renders", () => {
    const wrapper = mount(<RawPlants {...fakeProps()} />);
    ["Map",
      "Plants",
      "Events",
      "Strawberry Plant",
      "11 days old"
    ].map(string => expect(wrapper.text()).toContain(string));
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search your plants...");
  });

  it("has link to crops", () => {
    const wrapper = mount(<RawPlants {...fakeProps()} />);
    expect(wrapper.html()).toContain("fa-plus");
    expect(wrapper.html()).toContain("/app/designer/plants/crop_search");
  });

  it("updates search term", () => {
    const wrapper = shallow<RawPlants>(<RawPlants {...fakeProps()} />);
    expect(wrapper.state().searchTerm).toEqual("");
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "mint" } });
    expect(wrapper.state().searchTerm).toEqual("mint");
  });
});
