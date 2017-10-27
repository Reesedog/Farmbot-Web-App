jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { Sequences } from "../sequences";
import { shallow } from "enzyme";
import { Props } from "../interfaces";
import { FAKE_RESOURCES, buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { auth } from "../../__test_support__/fake_state/token";
import { ToolTips } from "../../constants";

describe("<Sequences/>", () => {
  function fakeProps(): Props {
    return {
      slots: [],
      dispatch: jest.fn(),
      sequence: fakeSequence(),
      sequences: [],
      tools: [],
      resources: buildResourceIndex(FAKE_RESOURCES).index,
      syncStatus: "synced",
      auth
    };
  }

  it("renders", () => {
    const wrapper = shallow(<Sequences {...fakeProps() } />);
    expect(wrapper.html()).toContain("Sequence");
    expect(wrapper.html()).toContain("Sequence Editor");
    expect(wrapper.html()).toContain(ToolTips.SEQUENCE_EDITOR);
    expect(wrapper.html()).toContain("Commands");
  });
});
