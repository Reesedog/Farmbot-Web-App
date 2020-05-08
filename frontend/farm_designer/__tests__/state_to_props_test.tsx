import { mapStateToProps, getPlants, botSize } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import {
  fakePlant,
  fakePlantTemplate,
  fakeSavedGarden,
  fakePoint,
  fakeWebAppConfig,
  fakeFarmwareEnv,
  fakeSensorReading,
  fakeFirmwareConfig,
} from "../../__test_support__/fake_state/resources";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { generateUuid } from "../../resources/util";
import { DevSettings } from "../../account/dev/dev_support";

describe("mapStateToProps()", () => {
  it("hovered plantUUID is undefined", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.hoveredPlant = {
      plantUUID: "x", icon: ""
    };
    expect(mapStateToProps(state).hoveredPlant).toBeFalsy();
  });

  it("peripherals pins have correct states", () => {
    const state = fakeState();
    function checkValue(input: number, value: boolean) {
      state.bot.hardware.pins = { 13: { value: input, mode: 0 } };
      const peripheralPin = mapStateToProps(state).peripherals[0];
      expect(peripheralPin.value).toEqual(value);
    }
    checkValue(0, false);
    checkValue(-1, false);
    checkValue(1, true);
    checkValue(2, true);
  });

  it("returns selected plant", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePlant(), fakeDevice()]);
    const plantUuid = Object.keys(state.resources.index.byKind["Point"])[0];
    state.resources.consumers.farm_designer.selectedPoints = [plantUuid];
    expect(mapStateToProps(state).selectedPlant).toEqual(
      expect.objectContaining({ uuid: plantUuid }));
  });

  it("returns all genericPoints", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    (webAppConfig.body as WebAppConfig).show_historic_points = true;
    const point1 = fakePoint();
    const point2 = fakePoint();
    const point3 = fakePoint();
    state.resources = buildResourceIndex([
      webAppConfig, point1, point2, point3, fakeDevice(),
    ]);
    expect(mapStateToProps(state).genericPoints.length).toEqual(3);
  });

  it("returns active genericPoints", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    (webAppConfig.body as WebAppConfig).show_historic_points = false;
    const point1 = fakePoint();
    const point2 = fakePoint();
    const point3 = fakePoint();
    state.resources = buildResourceIndex([
      webAppConfig, point1, point2, point3, fakeDevice(),
    ]);
    expect(mapStateToProps(state).genericPoints.length).toEqual(3);
  });

  it("returns sensor readings", () => {
    const state = fakeState();
    const sr1 = fakeSensorReading();
    sr1.body.created_at = "2018-01-14T20:20:38.362Z";
    const sr2 = fakeSensorReading();
    sr2.body.created_at = "2018-01-11T20:20:38.362Z";
    state.resources = buildResourceIndex([sr1, sr2, fakeDevice()]);
    const uuid1 = Object.keys(state.resources.index.byKind["SensorReading"])[0];
    const uuid2 = Object.keys(state.resources.index.byKind["SensorReading"])[1];
    expect(mapStateToProps(state).sensorReadings).toEqual([
      expect.objectContaining({ uuid: uuid2 }),
      expect.objectContaining({ uuid: uuid1 }),
    ]);
  });
});

describe("getPlants()", () => {
  const fakeResources = () => {
    const savedGarden = fakeSavedGarden();
    savedGarden.uuid = generateUuid(1, "SavedGarden");
    savedGarden.body.id = 1;
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const template1 = fakePlantTemplate();
    template1.body.saved_garden_id = 1;
    const template2 = fakePlantTemplate();
    template2.body.saved_garden_id = 2;
    return buildResourceIndex([
      savedGarden, plant1, plant2, template1, template2, fakeDevice(),
    ]);
  };
  it("returns plants", () => {
    expect(getPlants(fakeResources()).length).toEqual(2);
  });

  it("returns plant templates", () => {
    const resources = fakeResources();
    const savedGardenUuid = Object.keys(resources.index.byKind["SavedGarden"])[0];
    resources.consumers.farm_designer.openedSavedGarden = savedGardenUuid;
    expect(getPlants(resources).length).toEqual(1);
  });

  it("returns API farmware env", () => {
    const state = fakeState();
    state.bot.hardware.user_env = {};
    state.bot.hardware.informational_settings.controller_version =
      DevSettings.MAX_FBOS_VERSION_OVERRIDE;
    const fwEnv = fakeFarmwareEnv();
    fwEnv.body.key = "CAMERA_CALIBRATION_total_rotation_angle";
    fwEnv.body.value = 15;
    state.resources = buildResourceIndex([fwEnv, fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.cameraCalibrationData).toEqual(
      expect.objectContaining({ rotation: "15" }));
  });
});

describe("botSize()", () => {
  it("returns default bot size", () => {
    const state = fakeState();
    expect(botSize(state)).toEqual({
      x: { value: 2900, isDefault: true },
      y: { value: 1400, isDefault: true },
    });
  });

  it("returns map setting bot size", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.map_size_x = 1000;
    webAppConfig.body.map_size_y = 1000;
    state.resources = buildResourceIndex([fakeDevice(), webAppConfig]);
    expect(botSize(state)).toEqual({
      x: { value: 1000, isDefault: true },
      y: { value: 1000, isDefault: true },
    });
  });

  it("returns axis length setting bot size", () => {
    const state = fakeState();
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_step_per_mm_x = 2;
    firmwareConfig.body.movement_step_per_mm_y = 4;
    firmwareConfig.body.movement_stop_at_max_x = 1;
    firmwareConfig.body.movement_stop_at_max_y = 1;
    firmwareConfig.body.movement_axis_nr_steps_x = 100;
    firmwareConfig.body.movement_axis_nr_steps_y = 100;
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.map_size_x = 1000;
    webAppConfig.body.map_size_y = 1000;
    state.resources = buildResourceIndex([
      fakeDevice(), firmwareConfig, webAppConfig]);
    expect(mapStateToProps(state).botSize).toEqual({
      x: { value: 50, isDefault: false },
      y: { value: 25, isDefault: false },
    });
  });
});
