import { AuthState } from "./auth/interfaces";
import { ConfigState } from "./config/interfaces";
import { BotState } from "./devices/interfaces";
import { Color as FarmBotJsColor } from "farmbot";
import { DraggableState } from "./draggable/interfaces";
import { RestResources } from "./resources/interfaces";
import { AppState } from "./reducer";

/** Regimens and sequences may have a "color" which determines how it looks
    in the UI. Only certain colors are valid. */
export type ResourceColor = FarmBotJsColor;

export interface Everything {
  config: ConfigState;
  auth: AuthState | undefined;
  dispatch: Function;
  bot: BotState;
  draggable: DraggableState;
  resources: RestResources;
  app: AppState;
}

/** There were a few cases where we handle errors that are legitimately unknown.
 *  In those cases, we can use the `UnsafeError` type instead of `any`, just to
 *  quiet down the linter and to let others know it is inherently unsafe.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeError = any;

export interface TimeSettings {
  utcOffset: number;
  hour24: boolean;
  seconds: boolean;
}

export interface SettingsPanelState {
  farmbot_settings: boolean;
  firmware: boolean;
  power_and_reset: boolean;
  axis_settings: boolean;
  motors: boolean;
  encoders_or_stall_detection: boolean;
  limit_switches: boolean;
  error_handling: boolean;
  pin_bindings: boolean;
  pin_guard: boolean;
  pin_reporting: boolean;
  parameter_management: boolean;
  custom_settings: boolean;
  farm_designer: boolean;
  account: boolean;
  other_settings: boolean;
}

export interface PlantsPanelState {
  groups: boolean;
  savedGardens: boolean;
  plants: boolean;
}

export interface WeedsPanelState {
  groups: boolean;
  weeds: boolean;
  pending: boolean;
  active: boolean;
  removed: boolean;
}

export interface PointsPanelState {
  groups: boolean;
  points: boolean;
  soilHeight: boolean;
}
