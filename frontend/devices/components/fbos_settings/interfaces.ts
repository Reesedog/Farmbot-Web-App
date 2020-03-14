import {
  BotState,
  ControlPanelState,
  SaveFarmwareEnv,
  ShouldDisplay,
  SourceFbosConfig,
  UserEnv,
} from "../../interfaces";
import {
  Alert,
  InformationalSettings,
  TaggedDevice,
  FirmwareHardware,
} from "farmbot";
import { TimeSettings } from "../../../interfaces";

export interface NameRowProps {
  dispatch: Function;
  device: TaggedDevice;
  widget?: boolean;
}

export interface TimezoneRowProps {
  dispatch: Function;
  device: TaggedDevice;
}

export interface AutoSyncRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface AutoUpdateRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface OtaTimeSelectorRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  device: TaggedDevice;
  timeSettings: TimeSettings;
}

export interface CameraSelectionProps {
  env: UserEnv;
  botOnline: boolean;
  saveFarmwareEnv: SaveFarmwareEnv;
  shouldDisplay: ShouldDisplay;
  dispatch: Function;
}

export interface CameraSelectionState {
  cameraStatus: "" | "sending" | "done" | "error";
}

export interface BoardTypeProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface FirmwareProps {
  botOnline: boolean;
  bot: BotState;
  alerts: Alert[];
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
}

export interface FlashFirmwareRowProps {
  botOnline: boolean;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface PowerAndResetProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
}

export interface FactoryResetRowsProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
}

export interface FarmbotOsRowProps {
  bot: BotState;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  shouldDisplay: ShouldDisplay;
  botOnline: boolean;
  timeSettings: TimeSettings;
  deviceAccount: TaggedDevice;
}

export interface FbosDetailsProps {
  botInfoSettings: InformationalSettings;
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  sourceFbosConfig: SourceFbosConfig;
  botToMqttLastSeen: number;
  timeSettings: TimeSettings;
  deviceAccount: TaggedDevice;
}

export interface OsUpdateButtonProps {
  bot: BotState;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
  shouldDisplay: ShouldDisplay;
}
