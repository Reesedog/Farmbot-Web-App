import { BotState, Xyz, BotPosition } from "../devices/interfaces";
import { Vector3 } from "farmbot/dist";
import { TaggedPeripheral, TaggedDevice } from "../resources/tagged_resources";
import { RestResources } from "../resources/interfaces";
import { TaggedUser } from "../resources/tagged_resources";

export interface Props {
  dispatch: Function;
  bot: BotState;
  account: TaggedDevice;
  user: TaggedUser | undefined;
  peripherals: TaggedPeripheral[];
  resources: RestResources;
}

export interface MoveProps {
  dispatch: Function;
  bot: BotState;
  user: TaggedUser | undefined;
}

export interface WebcamPanelProps {
  dispatch: Function;
  bot: BotState;
  account: TaggedDevice;
}

export interface WebcamPanelState {
  isEditing: boolean;
}

export interface DirectionButtonProps {
  axis: Xyz;
  direction: "up" | "down" | "left" | "right";
  isInverted: boolean;
  steps: number;
}

export interface Payl {
  speed: number;
  x: number;
  y: number;
  z: number;
}

export type Vector = Vector3;

export type EncoderDisplay = "raw_encoders" | "scaled_encoders";

export interface AxisDisplayGroupProps {
  position: BotPosition;
  label: string;
}

export interface AxisInputBoxGroupProps {
  onCommit: (v: Vector) => void;
  position: BotPosition;
}

export interface AxisInputBoxGroupState {
  x?: number | undefined;
  y?: number | undefined;
  z?: number | undefined;
}

export interface AxisInputBoxProps {
  axis: Xyz;
  value: number | undefined;
  onChange: (key: string, val: number | undefined) => void;
}

export interface AxisInputBoxState {
  value: string | undefined;
}

export interface StepSizeSelectorProps {
  choices: number[];
  selected: number;
  selector: (num: number) => void;
}

export interface JogMovementControlsProps {
  x_axis_inverted: boolean;
  y_axis_inverted: boolean;
  z_axis_inverted: boolean;
  bot: BotState;
}

export interface ToggleButtonProps {
  /** Function that is executed when the toggle button is clicked */
  toggleAction: () => void;
  toggleValue: number | string | undefined;
  disabled?: boolean | undefined;
}
