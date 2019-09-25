import { ResourceIndex } from "../../resources/interfaces";
import {
  selectAllToolSlotPointers,
  selectAllActivePoints,
  maybeFindToolById,
  selectAllPointGroups,
} from "../../resources/selectors";
import { betterCompact } from "../../util";
import {
  TaggedTool, TaggedPoint, TaggedToolSlotPointer, Xyz, Vector3, TaggedPointGroup
} from "farmbot";
import { DropDownItem } from "../../ui";
import { capitalize, isNumber } from "lodash";
import { Point } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";

const TOOL: "Tool" = "Tool";

/** Return tool and location for all tools currently in tool slots. */
export function activeToolDDIs(resources: ResourceIndex): DropDownItem[] {
  const slots = selectAllToolSlotPointers(resources);
  return betterCompact(slots
    .map(slot => {
      const tool = maybeFindToolById(resources, slot.body.tool_id);
      if (tool) { return formatTool(tool, slot); }
    }))
    .filter(x => parseInt("" + x.value) > 0);
}

type PointerTypeName = Point["pointer_type"];
type DropdownHeadingId =
  | PointerTypeName
  | typeof TOOL
  | "PointGroup"
  | "Other";

/** Location selection menu section names. */
export const NAME_MAP: Record<DropdownHeadingId, string> = {
  "GenericPointer": "Map Points",
  "Plant": "Plants",
  "ToolSlot": "Tool Slots",
  "Tool": "Tools and Seed Containers",
  "PointGroup": "Groups",
  "Other": "Other",
};

const heading = (name: DropdownHeadingId): DropDownItem[] => ([{
  label: t(NAME_MAP[name]),
  heading: true,
  value: 0,
  headingId: name
}]);

const points2ddi = (points: TaggedPoint[], pointerType: PointerTypeName) => points
  .filter(x => x.body.pointer_type === pointerType)
  .map(formatPoint)
  .filter(x => parseInt("" + x.value) > 0);

const maybeGroup = (display: boolean) =>
  (groupDDI: DropDownItem): DropDownItem[] =>
    display ? [groupDDI] : [];

const groups2Ddi = (groups: TaggedPointGroup[]): DropDownItem[] => {
  return groups
    .filter(x => x.body.id)
    .map(x => {
      return { label: x.body.name, value: x.uuid, headingId: "PointGroup" };
    });
};

/** Location selection menu items. */
export function locationFormList(resources: ResourceIndex,
  additionalItems: DropDownItem[], displayGroups?: boolean): DropDownItem[] {
  const points = selectAllActivePoints(resources)
    .filter(x => x.body.pointer_type !== "ToolSlot");
  const plantDDI = points2ddi(points, "Plant");
  const genericPointerDDI = points2ddi(points, "GenericPointer");
  const toolDDI = activeToolDDIs(resources);
  const clump = maybeGroup(!!displayGroups);
  const output = [COORDINATE_DDI()]
    .concat(additionalItems)
    .concat(heading("Tool"))
    .concat(clump(everyPointDDI("Tool")))
    .concat(clump(everyPointDDI("ToolSlot")))
    .concat(toolDDI)
    .concat(heading("Plant"))
    .concat(clump(everyPointDDI("Plant")))
    .concat(plantDDI)
    .concat(heading("GenericPointer"))
    .concat(clump(everyPointDDI("GenericPointer")))
    .concat(genericPointerDDI);
  if (displayGroups) {
    return output
      .concat(heading("PointGroup"))
      .concat(groups2Ddi(selectAllPointGroups(resources)));
  } else {
    return output;
  }
}

/** Create drop down item with label; i.e., "Point/Plant (1, 2, 3)" */
export const formatPoint = (p: TaggedPoint): DropDownItem => {
  const { id, name, pointer_type, x, y, z } = p.body;
  return {
    label: dropDownName(name, { x, y, z }),
    value: "" + id,
    headingId: pointer_type
  };
};

/** Create drop down item with label; i.e., "Tool (1, 2, 3)" */
export const formatTool =
  (tool: TaggedTool, slot: TaggedToolSlotPointer | undefined): DropDownItem => {
    const { id, name } = tool.body;
    const coordinate = slot
      ? {
        x: slot.body.gantry_mounted ? undefined : slot.body.x,
        y: slot.body.y,
        z: slot.body.z
      }
      : undefined;
    return {
      label: dropDownName((name || "Untitled tool"), coordinate),
      value: "" + id,
      headingId: TOOL
    };
  };

/** Uniformly generate a label for things that have an X/Y/Z value. */
export function dropDownName(name: string, v?: Record<Xyz, number | undefined>) {
  let label = name || "untitled";
  if (v) {
    const labelFor = (axis: number | undefined) => isNumber(axis) ? axis : "---";
    label += ` (${labelFor(v.x)}, ${labelFor(v.y)}, ${labelFor(v.z)})`;
  }
  return capitalize(label);
}

export const EVERY_POINT_LABEL = {
  "Plant": "All plants",
  "GenericPointer": "All map points",
  "Tool": "All tools",
  "ToolSlot": "All tool slots",
};

export type EveryPointType = keyof typeof EVERY_POINT_LABEL;

const isEveryPointType = (x: string): x is EveryPointType =>
  Object.keys(EVERY_POINT_LABEL).includes(x);

export const safeEveryPointType = (x: string): EveryPointType => {
  if (isEveryPointType(x)) {
    return x;
  } else {
    throw new Error(`'${x}' is not of type EveryPointType`);
  }
};

export const everyPointDDI = (value: EveryPointType): DropDownItem =>
  ({ value, label: t(EVERY_POINT_LABEL[value]), headingId: "every_point" });

export const COORDINATE_DDI = (vector?: Vector3): DropDownItem => ({
  label: vector
    ? `${t("Coordinate")} (${vector.x}, ${vector.y}, ${vector.z})`
    : t("Custom Coordinates"),
  value: vector ? JSON.stringify(vector) : "",
  headingId: "Coordinate"
});

export const NO_VALUE_SELECTED_DDI = (): DropDownItem =>
  ({ label: t("Select a location"), value: "", isNull: true });
