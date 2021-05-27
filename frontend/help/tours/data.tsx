import React from "react";
import { t } from "../../i18next_wrapper";
import { FirmwareHardware } from "farmbot";
import { TourContent } from "../../constants";
import { Tour, TourStep } from "./interfaces";
import { isExpress } from "../../settings/firmware/firmware_hardware_support";

export const TOURS = (
  firmwareHardware?: FirmwareHardware | undefined,
): Record<string, Tour> => ({
  gettingStarted: {
    title: t("Getting Started"),
    steps: [
      {
        slug: "intro",
        title: t("Getting Started"),
        content: TourContent.GETTING_STARTED,
        extraContent: <div className={"extra-content"}>
          {t("Click")}
          <i className={"fa fa-forward"} />
          {t("to get started")}
        </div>,
        beacons: undefined,
        url: undefined,
      },
      {
        slug: "plants",
        title: t("Plants"),
        content: TourContent.PLANTS_PANEL,
        beacons: ["plants", "plant-inventory"],
        url: "/app/designer/plants",
      },
      {
        slug: "groups",
        title: t("Groups"),
        content: TourContent.GROUPS_PANEL,
        beacons: ["groups"],
        url: "/app/designer/groups",
      },
      {
        slug: "sequences",
        title: t("Sequences"),
        content: TourContent.SEQUENCES_PANEL,
        beacons: ["sequences", "designer-sequence-list"],
        url: "/app/designer/sequences",
      },
      {
        slug: "regimens",
        title: t("Regimens"),
        content: TourContent.REGIMENS_PANEL,
        beacons: ["regimens", "designer-regimen-list"],
        url: "/app/designer/regimens",
      },
      {
        slug: "savedGardens",
        title: t("Gardens"),
        content: TourContent.SAVED_GARDENS_PANEL,
        beacons: ["gardens", "saved-garden"],
        url: "/app/designer/gardens",
      },
      {
        slug: "farmEvents",
        title: t("Events"),
        content: TourContent.FARM_EVENTS_PANEL,
        beacons: ["events", "farm-event"],
        url: "/app/designer/events",
      },
      {
        slug: "points",
        title: t("Points"),
        content: TourContent.POINTS_PANEL,
        beacons: ["points", "point-inventory"],
        url: "/app/designer/points",
      },
      {
        slug: "weeds",
        title: t("Weeds"),
        content: TourContent.WEEDS_PANEL,
        beacons: ["weeds", "weeds-inventory"],
        url: "/app/designer/weeds",
      },
      {
        slug: "controls",
        title: t("Controls"),
        content: TourContent.CONTROLS_PANEL,
        beacons: ["controls"],
        url: "/app/designer/controls",
      },
      {
        slug: "photos",
        title: t("Photos"),
        content: TourContent.PHOTOS_PANEL,
        beacons: ["photos"],
        url: "/app/designer/photos",
      },
      {
        slug: "tools",
        title: t("Tools"),
        content: TourContent.TOOLS_PANEL,
        beacons: ["tools"],
        url: "/app/designer/tools",
      },
      {
        slug: "messages",
        title: t("Messages"),
        content: TourContent.MESSAGES_PANEL,
        beacons: ["messages"],
        url: "/app/designer/messages",
      },
      {
        slug: "help",
        title: t("Help"),
        content: TourContent.HELP_PANEL,
        beacons: ["help"],
        url: "/app/designer/help",
      },
      {
        slug: "settings",
        title: t("Settings"),
        content: TourContent.SETTINGS_PANEL,
        beacons: ["settings"],
        url: "/app/designer/settings",
      },
      {
        slug: "connectivityPopup",
        title: t("Connectivity"),
        content: TourContent.CONNECTIVITY_POPUP,
        beacons: undefined,
        activeBeacons: [{ class: "connectivity-button", type: "hard" }],
        url: undefined,
      },
      {
        slug: "syncStatus",
        title: t("Sync Status"),
        content: TourContent.SYNC_STATUS,
        beacons: undefined,
        activeBeacons: [{ class: "nav-sync", type: "soft" }],
        url: undefined,
      },
      {
        slug: "estopButton",
        title: t("E-STOP Button"),
        content: TourContent.ESTOP_BUTTON,
        beacons: undefined,
        activeBeacons: [{ class: "e-stop-btn", type: "soft" }],
        url: undefined,
      },
      {
        slug: "accountMenu",
        title: t("Account Menu"),
        content: TourContent.ACCOUNT_MENU,
        beacons: undefined,
        activeBeacons: [{ class: "nav-name", type: "soft" }],
        url: undefined,
      },
      {
        slug: "end",
        title: t("What's next?"),
        content: TourContent.GETTING_STARTED_END,
        beacons: undefined,
        url: "/app/designer/tours",
      },
    ],
  },
  garden: {
    title: t("Planting a garden"),
    steps: [
      {
        slug: "intro",
        title: t("Planting a garden"),
        content: TourContent.PLANTING_A_GARDEN,
        beacons: undefined,
        url: undefined,
      },
      {
        slug: "plantInventory",
        title: t("Plant inventory"),
        content: TourContent.PLANT_INVENTORY,
        beacons: ["plants", "plant-inventory"],
        activeBeacons: [{ class: "fb-button.panel-green", type: "hard" }],
        url: "/app/designer/plants",
      },
      {
        slug: "cropSearch",
        title: t("Crop search"),
        content: TourContent.CROP_SEARCH,
        beacons: undefined,
        activeBeacons: [{ class: "thin-search", type: "soft" }],
        url: undefined,
      },
      {
        slug: "addPlants",
        title: t("Add plants to map"),
        content: TourContent.ADD_PLANTS_TO_MAP,
        beacons: undefined,
        activeBeacons: [
          { class: "crop-info-panel", type: "soft" },
          { class: "right-button", type: "hard" },
        ],
        url: undefined,
      },
      {
        slug: "clickToAdd",
        title: t("Click to add"),
        content: TourContent.CLICK_TO_ADD,
        beacons: undefined,
        activeBeacons: [
          { class: "crop-drag-info-image", type: "soft" },
          { class: "drop-icon-description", type: "soft" },
        ],
        url: undefined,
      },
      {
        slug: "grid",
        title: t("Grid and row planting"),
        content: TourContent.GRID_AND_ROW_PLANTING,
        beacons: undefined,
        activeBeacons: [
          { class: "grid-and-row-planting", type: "soft" },
          { class: "preview-button", type: "hard" },
          { class: "save-button", type: "hard" },
        ],
        url: undefined,
      },
      {
        slug: "filledPlantInventory",
        title: t("Plant inventory"),
        content: TourContent.FILLED_PLANT_INVENTORY,
        beacons: ["plant-inventory"],
        activeBeacons: [{ class: "thin-search", type: "soft" }],
        url: "/app/designer/plants",
      },
      {
        slug: "plantDetails",
        title: t("Plant Details"),
        content: TourContent.PLANT_DETAILS,
        beacons: [],
        activeBeacons: [{ class: "plant-info-panel", type: "soft" }],
        url: undefined,
      },
      {
        slug: "addMorePlants",
        title: t("Add more plants"),
        content: TourContent.ADD_MORE_PLANTS,
        beacons: undefined,
        activeBeacons: [{ class: "fb-button.panel-green", type: "hard" }],
        url: "/app/designer/plants",
      },
      {
        slug: "groupsIntro",
        title: t("Groups panel"),
        content: TourContent.GARDEN_PRE_GROUPS_PANEL,
        beacons: undefined,
        url: undefined,
      },
      {
        slug: "groups",
        title: t("Groups panel"),
        content: TourContent.GARDEN_GROUPS_PANEL,
        beacons: ["groups"],
        activeBeacons: [{ class: "fb-button.panel-blue", type: "hard" }],
        url: "/app/designer/groups",
      },
      {
        slug: "filter",
        title: t("Group Filters"),
        content: TourContent.GROUP_FILTERS,
        beacons: undefined,
        activeBeacons: [
          { class: "point-type-selection", type: "hard" },
          { class: "plant-type-criteria", type: "hard" },
        ],
        url: undefined,
      },
      {
        slug: "sort",
        title: t("Sort by"),
        content: TourContent.SORT_BY,
        beacons: undefined,
        activeBeacons: [{ class: "group-sort-section", type: "hard" }],
        url: undefined,
      },
      {
        slug: "completeGroup",
        title: t("Finish creating the group"),
        content: TourContent.FINISH_CREATING_THE_GROUP,
        beacons: undefined,
        activeBeacons: [
          { class: "group-name-input", type: "hard" },
          { class: "back-arrow", type: "soft", keep: true },
        ],
        url: undefined,
      },
      {
        slug: "end",
        title: t("Add more groups"),
        content: TourContent.ADD_MORE_GROUPS,
        beacons: undefined,
        activeBeacons: [{ class: "fb-button.panel-blue", type: "hard" }],
        url: undefined,
      },
    ],
  },
  tools: {
    title: t("Setting up slots"),
    steps: [
      {
        slug: "intro",
        title: t("Setting up slots"),
        content: TourContent.SETTING_UP_SLOTS_TOOLS_PANEL,
        beacons: ["tools"],
        activeBeacons: [
          { class: "tool-slots", type: "hard" },
        ],
        url: "/app/designer/tools",
      },
      {
        slug: "edit",
        title: t("Edit slot panel"),
        content: TourContent.EDIT_SLOT_PANEL,
        beacons: undefined,
        activeBeacons: [{ class: "edit-tool-slot-panel", type: "soft" }],
        url: undefined,
      },
      {
        slug: "setup",
        title: t("Edit slot coordinates setup"),
        content: isExpress(firmwareHardware)
          ? TourContent.EDIT_SLOT_COORDINATES_SETUP_EXPRESS
          : TourContent.EDIT_SLOT_COORDINATES_SETUP_GENESIS,
        beacons: undefined,
        activeBeacons: [
          { class: "controls-popup", type: "hard" },
        ],
        url: undefined,
      },
      {
        slug: "coordinates",
        title: t("Edit slot coordinates"),
        content: isExpress(firmwareHardware)
          ? TourContent.EDIT_SLOT_COORDINATES_EXPRESS
          : TourContent.EDIT_SLOT_COORDINATES_GENESIS,
        beacons: undefined,
        activeBeacons: [
          { class: "controls-popup", type: "hard" },
          { class: "fb-button.blue", type: "hard" },
        ],
        url: undefined,
      },
      {
        slug: "adjustments",
        title: t("Minor adjustments"),
        content: TourContent.SETTING_UP_SLOTS_MINOR_ADJUSTMENTS,
        beacons: undefined,
        activeBeacons: [{ class: "axis-inputs", type: "soft" }],
        url: undefined,
      },
      {
        slug: "loading",
        title: t("Loading slots"),
        content: TourContent.LOADING_SLOTS,
        beacons: undefined,
        activeBeacons: [{ class: "tool-selection-wrapper", type: "hard" }],
        url: "/app/designer/tools",
      },
      ...(isExpress(firmwareHardware)
        ? []
        : [{
          slug: "custom",
          title: t("Custom tools"),
          content: TourContent.SETTING_UP_SLOTS_CUSTOM_TOOLS,
          beacons: undefined,
          activeBeacons: [{ class: "add-tool-btn", type: "hard" }],
          url: undefined,
        } as TourStep]),
    ],
  },
  monitoring: {
    title: t("See what FarmBot is doing"),
    steps: [
      {
        slug: "move",
        title: t("View current location"),
        content: TourContent.LOCATION_GRID,
        beacons: undefined,
        activeBeacons: [{ class: "bot-position-rows", type: "soft" }],
        url: "/app/designer/controls",
      },
      {
        slug: "virtual",
        title: t("View current location"),
        content: TourContent.VIRTUAL_FARMBOT,
        beacons: undefined,
        activeBeacons: [{ class: "farm-designer", type: "soft" }],
        url: "/app/designer/controls",
      },
      {
        slug: "logs",
        title: t("View log messages"),
        content: TourContent.LOGS_TABLE,
        beacons: undefined,
        activeBeacons: [{ class: "logs-page", type: "soft" }],
        url: "/app/logs",
      },
      {
        slug: "photos",
        title: t("Take and view photos"),
        content: TourContent.PHOTOS,
        beacons: ["photos"],
        url: "/app/designer/photos",
      },
    ],
  },
});
