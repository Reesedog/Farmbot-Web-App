jest.mock("../../../api/crud", () => {
  return { initSave: jest.fn(() => () => Promise.resolve({})) };
});

jest.mock("../../../history", () => {
  return {
    history: { push: jest.fn() }
  };
});

import { createGroup } from "../actions";
import { initSave } from "../../../api/crud";
import { history } from "../../../history";

describe("group action creators and thunks", () => {
  // const all = points.map(x => unpackUUID(x).remoteId);
  // const point_ids = betterCompact(all);
  // const group: PointGroup = ({ name: name || UNTITLED, point_ids });
  // const thunk = initSave("PointGroup", group);
  // const p: Promise<{}> = thunk(dispatch);
  // return p.then(() => history.push("/app/designer/groups"));

  it("creates groups", async () => {
    const points: string[] =
      ["Point.4.5", "Point.6.7", "Point.8.9"];

    await createGroup({ points, dispatch: jest.fn(), name: "Name123" });
    expect(initSave).toHaveBeenCalledWith("PointGroup", {
      name: "Name123",
      point_ids: [4, 6, 8]
    });
    expect(history.push).toHaveBeenCalledWith("/app/designer/groups");
  });
});
