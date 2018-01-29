import { fakeFbosConfig } from "../../__test_support__/fake_state/resources";

let mockFbosConfig: TaggedFbosConfig | undefined = fakeFbosConfig();
jest.mock("../../resources/selectors", () => ({
  getDeviceAccountSettings: jest.fn(),
  assertUuid: jest.fn(),
  getFbosConfig: () => mockFbosConfig,
  selectAllImages: jest.fn()
}));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedFbosConfig } from "../../resources/tagged_resources";

describe("mapStateToProps()", () => {
  it("API source of FBOS settings", () => {
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.auto_sync = true;
    fakeApiConfig.body.api_migrated = true;
    mockFbosConfig = fakeApiConfig;
    const props = mapStateToProps(fakeState());
    expect(props.sourceFbosConfig("auto_sync")).toEqual({
      value: true, consistent: false
    });
  });

  it("bot source of FBOS settings", () => {
    const state = fakeState();
    state.bot.hardware.configuration.auto_sync = false;
    mockFbosConfig = undefined;
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("auto_sync")).toEqual({
      value: false, consistent: true
    });
  });

  it("bot source of FBOS settings: ignore API defaults", () => {
    const state = fakeState();
    state.bot.hardware.configuration.auto_sync = false;
    const fakeApiConfig = fakeFbosConfig();
    fakeApiConfig.body.auto_sync = true;
    fakeApiConfig.body.api_migrated = false;
    mockFbosConfig = fakeApiConfig;
    const props = mapStateToProps(state);
    expect(props.sourceFbosConfig("auto_sync")).toEqual({
      value: false, consistent: true
    });
  });
});
