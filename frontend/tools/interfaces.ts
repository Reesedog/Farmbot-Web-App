import { UUID } from "../resources/interfaces";
import {
  FirmwareHardware, TaggedTool, TaggedToolSlotPointer,
  TaggedDevice, TaggedSensor, Xyz,
} from "farmbot";
import { BotOriginQuadrant } from "../farm_designer/interfaces";
import { BotState, BotPosition } from "../devices/interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";

export interface AddToolSlotState {
  uuid: UUID | undefined;
}

export interface AddToolProps {
  dispatch: Function;
  existingToolNames: string[];
  firmwareHardware: FirmwareHardware | undefined;
}

export interface AddToolState {
  toolName: string;
  toAdd: string[];
  uuid: UUID | undefined;
}

export interface EditToolProps {
  findTool(id: string): TaggedTool | undefined;
  dispatch: Function;
  mountedToolId: number | undefined;
  isActive(id: number | undefined): boolean;
  existingToolNames: string[];
}

export interface EditToolState {
  toolName: string;
}

export interface ToolTransformProps {
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
}

export interface ToolsProps {
  tools: TaggedTool[];
  toolSlots: TaggedToolSlotPointer[];
  dispatch: Function;
  findTool(id: number): TaggedTool | undefined;
  device: TaggedDevice;
  sensors: TaggedSensor[];
  bot: BotState;
  hoveredToolSlot: string | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  isActive(id: number | undefined): boolean;
  toolTransformProps: ToolTransformProps;
}

export interface ToolsState {
  searchTerm: string;
}

export interface ToolSlotInventoryItemProps {
  toolSlot: TaggedToolSlotPointer;
  tools: TaggedTool[];
  hovered: boolean;
  dispatch: Function;
  isActive(id: number | undefined): boolean;
  hideDropdown?: boolean;
  toolTransformProps: ToolTransformProps;
}

export interface ToolInventoryItemProps {
  toolName: string;
  toolId: number | undefined;
  mounted: boolean;
  active: boolean;
}

export interface AddEditToolSlotPropsBase {
  tools: TaggedTool[];
  dispatch: Function;
  botPosition: BotPosition;
  findTool(id: number): TaggedTool | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  toolTransformProps: ToolTransformProps;
  isActive(id: number | undefined): boolean;
}

export interface AddToolSlotProps extends AddEditToolSlotPropsBase {
  findToolSlot(uuid: UUID | undefined): TaggedToolSlotPointer | undefined;
}

export interface EditToolSlotProps extends AddEditToolSlotPropsBase {
  findToolSlot(id: string): TaggedToolSlotPointer | undefined;
}

export interface EditToolSlotState {
  saveError?: boolean;
}

export interface GantryMountedInputProps {
  gantryMounted: boolean;
  onChange(update: { gantry_mounted: boolean }): void;
}

export interface EditToolSlotMetaProps {
  toolSlotMeta: Record<string, string | undefined>;
  onChange(update: { meta: Record<string, string | undefined> }): void;
}

export interface SlotDirectionInputRowProps {
  toolPulloutDirection: ToolPulloutDirection;
  onChange(update: { pullout_direction: ToolPulloutDirection }): void;
}

interface ToolInputPropsBase {
  tools: TaggedTool[];
  selectedTool: TaggedTool | undefined;
  onChange(update: { tool_id: number }): void;
  isActive(id: number | undefined): boolean;
}

export interface ToolSelectionProps extends ToolInputPropsBase {
  filterSelectedTool: boolean;
  filterActiveTools: boolean;
}

export interface ToolInputRowProps extends ToolInputPropsBase {
  noUTM: boolean;
}

export interface SlotLocationInputRowProps {
  slotLocation: Record<Xyz, number>;
  gantryMounted: boolean;
  onChange(update: Partial<Record<Xyz, number>>): void;
  botPosition: BotPosition;
}

export interface SlotEditRowsProps {
  toolSlot: TaggedToolSlotPointer;
  tools: TaggedTool[];
  tool: TaggedTool | undefined;
  botPosition: BotPosition;
  updateToolSlot(update: Partial<TaggedToolSlotPointer["body"]>): void;
  noUTM: boolean;
  toolTransformProps: ToolTransformProps;
  isActive(id: number | undefined): boolean;
}
