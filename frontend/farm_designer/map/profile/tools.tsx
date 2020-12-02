import React from "react";
import { isUndefined } from "lodash";
import {
  ProfilePointProps, ProfileToolProps, ProfileUtmProps, SlotProfileProps,
} from "./interfaces";
import { Color } from "../../../ui";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { isToolFlipped } from "../../../tools/tool_slot_edit_components";
import { withinProfileRange } from "./content";
import { ToolDimensions } from "../tool_graphics/tool";
import { SlotFrontProfile, SlotSideProfile } from "../tool_graphics/slot";
import { troughSize } from "../tool_graphics/seed_trough";
import {
  getToolColor, reduceToolName, ToolImplementProfile, ToolName,
} from "../tool_graphics/all_tools";
import { TaggedToolSlotPointer } from "farmbot";

export enum UTMDimensions {
  height = 40,
  extrusion = 20,
}

/** Virtual UTM profile. */
export const UTMProfile = (props: ProfileUtmProps) => {
  const { x, y } = props.botPosition;
  const inProfile = !isUndefined(x) && !isUndefined(y) &&
    withinProfileRange({
      axis: props.profileAxis == "x" ? "y" : "x",
      selectionWidth: props.selectionWidth,
      profilePosition: props.position,
      location: { x, y },
    });
  const profileUtmH = props.getX(props.botPosition);
  const profileUtmV = Math.abs(props.botPosition.z || 0);
  if (!inProfile) { return <g id={"utm-not-in-profile"} />; }
  if (!props.expanded) {
    return <g id={"UTM-and-axis"} opacity={0.25}>
      <line id={"z-axis"} strokeWidth={20} stroke={Color.darkGray}
        x1={profileUtmH} y1={0} x2={profileUtmH} y2={profileUtmV} />
      <rect id={"position-indicator"} fill={Color.black}
        x={profileUtmH - 5} y={profileUtmV - 5} width={10} height={10} />
    </g>;
  }
  const extrusionOffset = (UTMDimensions.extrusion + ToolDimensions.diameter) / 2;
  const toolInfo = props.mountedToolInfo;
  return <g id={"UTM-and-axis"} opacity={0.75}>
    <line id={"z-axis"} strokeWidth={20} stroke={Color.darkGray} opacity={0.5}
      x1={profileUtmH - extrusionOffset} y1={0}
      x2={profileUtmH - extrusionOffset} y2={profileUtmV} />
    <rect id={"UTM"} fill={Color.darkGray} opacity={0.5}
      x={profileUtmH - ToolDimensions.radius}
      y={profileUtmV - UTMDimensions.height}
      width={ToolDimensions.diameter}
      height={UTMDimensions.height} />
    <rect id={"position-indicator"} fill={Color.black} opacity={0.5}
      x={profileUtmH - 2} y={profileUtmV - 2}
      width={4} height={4} />
    <image x={profileUtmH - 25} y={profileUtmV - 35} width={50} height={30}
      xlinkHref={"/app-resources/img/farmbot.svg"} opacity={0.75} />
    {toolInfo.name &&
      <ToolProfile toolName={toolInfo.name}
        x={profileUtmH - ToolDimensions.radius} y={profileUtmV}
        width={ToolDimensions.diameter}
        height={ToolDimensions.thickness}
        sideView={props.profileAxis == slotPulloutAxis(toolInfo.pulloutDirection)}
        reversed={props.reversed}
        toolFlipped={getToolDirection(
          toolInfo.pulloutDirection,
          toolInfo.flipped,
          props.reversed)} />}
  </g>;
};

/** Determine if tool direction is reversed. */
const getToolDirection = (
  direction: ToolPulloutDirection | undefined,
  flipped: boolean,
  reversed: boolean,
) => {
  const toolFlipped = flipped ? -1 : 1;
  const mirror = mirrorSlot(direction, reversed) ? -1 : 1;
  return (toolFlipped * mirror) == -1;
};

/** Is tool slot direction negative? */
const negativeDirection = (slotDirection: ToolPulloutDirection | undefined) => [
  ToolPulloutDirection.NEGATIVE_Y,
  ToolPulloutDirection.NEGATIVE_X,
].includes(slotDirection || ToolPulloutDirection.NONE);

/** Determine toolbay slot side profile direction. */
const mirrorSlot = (
  slotDirection: ToolPulloutDirection | undefined,
  reversed: boolean,
) => {
  const negative = negativeDirection(slotDirection);
  return reversed ? !negative : negative;
};

/** Determine toolbay slot view angle (front or side). */
const slotPulloutAxis = (slotDirection: ToolPulloutDirection | undefined) => {
  switch (slotDirection) {
    case ToolPulloutDirection.NEGATIVE_X:
    case ToolPulloutDirection.POSITIVE_X:
    default:
      return "x";
    case ToolPulloutDirection.NEGATIVE_Y:
    case ToolPulloutDirection.POSITIVE_Y:
      return "y";
  }
};

/** Toolbay slot profile. */
const SlotProfile = (props: SlotProfileProps) => {
  const { x, y, width, height, slotDirection, sideView } = props;
  if (!slotDirection) { return <g id={"no-slot-direction"} />; }
  return sideView
    ? <SlotSideProfile x={x} y={y} width={width} height={height}
      mirror={mirrorSlot(slotDirection, props.reversed)} />
    : <SlotFrontProfile x={x} y={y} width={width} height={height} />;
};

/** SVG tool profile element with color and label. */
const ToolProfile = (props: ProfileToolProps) => {
  const { toolName, x, y, width, height, sideView } = props;
  const toolType = reduceToolName(toolName);
  const fontColor = toolType == ToolName.seeder
    ? Color.darkGray
    : Color.offWhite;
  const bodyColor = getToolColor(toolName);
  const bodyFill = toolType == ToolName.seedTrough
    ? bodyColor
    : `url(#tool-body-gradient-${toolType})`;
  return <g id={"profile-tool"}>
    <defs>
      <linearGradient id={`tool-body-gradient-${toolType}`}>
        <stop offset={"0%"} stopColor={bodyColor} stopOpacity={1} />
        <stop offset={"10%"} stopColor={bodyColor} stopOpacity={0.75} />
        <stop offset={"90%"} stopColor={bodyColor} stopOpacity={0.75} />
        <stop offset={"100%"} stopColor={bodyColor} stopOpacity={1} />
      </linearGradient>
    </defs>
    <rect id={"tool-body"} opacity={0.75} fill={bodyFill}
      x={x} y={y} width={width} height={height} />
    <line x1={x} y1={y} x2={x + width} y2={y}
      stroke={bodyColor} strokeWidth={0.5} opacity={0.75} />
    <line x1={x} y1={y + height} x2={x + width} y2={y + height}
      stroke={bodyColor} strokeWidth={0.5} opacity={0.5} />
    <SlotProfile sideView={sideView}
      slotDirection={props.slotDirection} reversed={props.reversed}
      x={x} y={y} width={width} height={height} />
    <ToolImplementProfile x={x + width / 2} y={y + height} toolName={toolName}
      toolFlipped={props.toolFlipped} sideView={sideView} />
    {!(toolType == ToolName.seedTrough && !sideView) &&
      <text x={x + 5} y={y + height - 2.5} opacity={1}
        textLength={width - 10} lengthAdjust={"spacingAndGlyphs"}
        stroke={"none"} fill={fontColor} fontWeight={"bold"}>
        {toolName}
      </text>}
    <circle id={"point-coordinate-indicator"} opacity={0.5} fill={Color.darkGray}
      cx={x + width / 2} cy={y} r={5} />
  </g>;
};

/** Point -> tool profile with color and label (if applicable). */
export const ToolProfilePoint =
  (props: ProfilePointProps<TaggedToolSlotPointer>) => {
    const { point, tools } = props;
    const { tool_id, gantry_mounted, pullout_direction } = point.body;
    const toolName = tools.filter(tool => tool.body.id == tool_id)[0]?.body.name;
    const trough = reduceToolName(toolName) == ToolName.seedTrough;
    const width = trough
      ? troughSize(props.profileAxis == "y").width
      : ToolDimensions.diameter;
    const slotDirection = gantry_mounted
      ? ToolPulloutDirection.NONE
      : pullout_direction;
    const sideView = props.profileAxis == slotPulloutAxis(slotDirection);
    return <ToolProfile toolName={toolName} reversed={props.reversed}
      x={props.getX(point.body) - width / 2} y={Math.abs(point.body.z)}
      width={width} height={ToolDimensions.thickness}
      sideView={sideView} slotDirection={slotDirection}
      toolFlipped={getToolDirection(
        pullout_direction,
        isToolFlipped(point.body.meta),
        props.reversed)} />;
  };
