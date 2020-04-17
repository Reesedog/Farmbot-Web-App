import * as React from "react";
import { FBSelect, DropDownItem } from "../../ui";
import { PlantOptions } from "../interfaces";
import { PlantStage, TaggedWeedPointer, PointType, TaggedPoint } from "farmbot";
import moment from "moment";
import { t } from "../../i18next_wrapper";
import { UUID } from "../../resources/interfaces";
import { edit, save } from "../../api/crud";
import { EditPlantStatusProps } from "./plant_panel";
import { PlantPointer } from "farmbot/dist/resources/api_resources";

export const PLANT_STAGE_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  planned: { label: t("Planned"), value: "planned" },
  planted: { label: t("Planted"), value: "planted" },
  sprouted: { label: t("Sprouted"), value: "sprouted" },
  harvested: { label: t("Harvested"), value: "harvested" },
  removed: { label: t("Removed"), value: "removed" },
});
export const PLANT_STAGE_LIST = () => [
  PLANT_STAGE_DDI_LOOKUP().planned,
  PLANT_STAGE_DDI_LOOKUP().planted,
  PLANT_STAGE_DDI_LOOKUP().sprouted,
  PLANT_STAGE_DDI_LOOKUP().harvested,
  PLANT_STAGE_DDI_LOOKUP().removed,
];

export const WEED_STATUSES = ["removed"];
const WEED_STAGE_DDI_LOOKUP = (): Record<string, DropDownItem> => ({
  removed: PLANT_STAGE_DDI_LOOKUP().removed,
});

/** Change `planted_at` value based on `plant_stage` update. */
const getUpdateByPlantStage = (plant_stage: PlantStage): PlantOptions => {
  const update: PlantOptions = { plant_stage };
  switch (plant_stage) {
    case "planned":
      update.planted_at = undefined;
      break;
    case "planted":
      update.planted_at = moment().toISOString();
  }
  return update;
};

/** Select a `plant_stage` for a plant. */
export function EditPlantStatus(props: EditPlantStatusProps) {
  const { plantStatus, updatePlant, uuid } = props;
  return <FBSelect
    list={PLANT_STAGE_LIST()}
    selectedItem={PLANT_STAGE_DDI_LOOKUP()[plantStatus]}
    onChange={ddi =>
      updatePlant(uuid, getUpdateByPlantStage(ddi.value as PlantStage))} />;
}

export interface PlantStatusBulkUpdateProps {
  allPoints: TaggedPoint[];
  selected: UUID[];
  dispatch: Function;
  pointerType: PointType;
}

/** Update `plant_stage` for multiple plants at once. */
export const PlantStatusBulkUpdate = (props: PlantStatusBulkUpdateProps) =>
  <div className="plant-status-bulk-update">
    <p>{t("update status to")}</p>
    <FBSelect
      key={JSON.stringify(props.selected)}
      list={PLANT_STAGE_LIST().filter(ddi =>
        props.pointerType == "Plant" || WEED_STATUSES.includes("" + ddi.value))}
      selectedItem={undefined}
      customNullLabel={t("Select a status")}
      onChange={ddi => {
        const plant_stage = ddi.value as PlantStage;
        const update = props.pointerType == "Plant"
          ? getUpdateByPlantStage(plant_stage)
          : { plant_stage };
        const points = props.allPoints.filter(point =>
          props.selected.includes(point.uuid)
          && point.kind === "Point"
          && ["Plant", "Weed"].includes(point.body.pointer_type)
          && (point.body as unknown as PlantPointer).plant_stage != plant_stage);
        points.length > 0 && confirm(
          t("Change status to '{{ status }}' for {{ num }} items?",
            { status: plant_stage, num: points.length }))
          && points.map(point => {
            props.dispatch(edit(point, update));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;

export interface EditWeedStatusProps {
  weed: TaggedWeedPointer;
  updateWeed(update: Partial<TaggedWeedPointer["body"]>): void;
}

/** Select a `plant_stage` for a weed. */
export const EditWeedStatus = (props: EditWeedStatusProps) =>
  <FBSelect
    list={PLANT_STAGE_LIST().filter(ddi => WEED_STATUSES.includes("" + ddi.value))}
    selectedItem={WEED_STAGE_DDI_LOOKUP()[(
      props.weed.body as unknown as PlantPointer).plant_stage]}
    onChange={ddi =>
      props.updateWeed({
        ["plant_stage" as keyof TaggedWeedPointer["body"]]:
          ddi.value as PlantStage
      })} />;
