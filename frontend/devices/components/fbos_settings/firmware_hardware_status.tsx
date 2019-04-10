import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { FIRMWARE_CHOICES_DDI, isFwHardwareValue, boardType } from "./board_type";
import { flashFirmware } from "../../actions";
import { t } from "../../../i18next_wrapper";
import { BotState, Feature, ShouldDisplay } from "../../interfaces";
import { FirmwareAlerts } from "../../../logs/alerts";

export interface FirmwareHardwareStatusIconProps {
  firmwareHardware: string | undefined;
  status: boolean;
}

export const FirmwareHardwareStatusIcon =
  (props: FirmwareHardwareStatusIconProps) => {
    const okNoStatus = props.status ? "ok" : "error";
    const status = props.firmwareHardware ? okNoStatus : "unknown";
    const okNoStatusText = props.status ? t("ok") : t("error");
    const statusText = props.firmwareHardware ? okNoStatusText : t("unknown");
    const okNoIcon = props.status ? "fa-check-circle" : "fa-times-circle";
    const icon = props.firmwareHardware ? okNoIcon : "fa-question-circle";
    return <i className={`fa ${icon} status-icon ${status}`} title={statusText} />;
  };

const lookup = (value: string | undefined) =>
  value && Object.keys(FIRMWARE_CHOICES_DDI).includes(value)
    ? FIRMWARE_CHOICES_DDI[value].label : undefined;

export interface FirmwareHardwareStatusDetailsProps {
  botOnline: boolean;
  bot: BotState;
  apiFirmwareValue: string | undefined;
  botFirmwareValue: string | undefined;
  mcuFirmwareValue: string | undefined;
  shouldDisplay: ShouldDisplay;
}

export interface FirmwareActionsProps {
  apiFirmwareValue: string | undefined;
  botOnline: boolean;
}

export const FirmwareActions = (props: FirmwareActionsProps) => {
  const { apiFirmwareValue } = props;
  return <div className="firmware-actions">
    <p>{t("Flash the {{firmware}} firmware to your device:",
      { firmware: lookup(apiFirmwareValue) || "" })}</p>
    <button className="fb-button yellow"
      disabled={!apiFirmwareValue || !props.botOnline}
      onClick={() => isFwHardwareValue(apiFirmwareValue) &&
        flashFirmware(apiFirmwareValue)}>
      {t("flash firmware")}
    </button>
  </div>;
};

export const FirmwareHardwareStatusDetails =
  (props: FirmwareHardwareStatusDetailsProps) => {
    return <div className="firmware-hardware-status-details">
      <label>{t("Web App")}</label>
      <p>{lookup(props.apiFirmwareValue)}</p>
      <label>{t("FarmBot OS")}</label>
      <p>{lookup(props.botFirmwareValue)}</p>
      <label>{t("Arduino/Farmduino")}</label>
      <p>{lookup(props.mcuFirmwareValue)}</p>
      {props.shouldDisplay(Feature.flash_firmware) &&
        <div>
          <label>{t("Actions")}</label>
          <FirmwareActions
            apiFirmwareValue={props.apiFirmwareValue}
            botOnline={props.botOnline} />
        </div>}
      <FirmwareAlerts bot={props.bot} apiFirmwareValue={props.apiFirmwareValue} />
    </div>;
  };

export interface FirmwareHardwareStatusProps {
  apiFirmwareValue: string | undefined;
  bot: BotState;
  botOnline: boolean;
  shouldDisplay: ShouldDisplay;
}

export const FirmwareHardwareStatus = (props: FirmwareHardwareStatusProps) => {
  const { firmware_version } = props.bot.hardware.informational_settings;
  const { firmware_hardware } = props.bot.hardware.configuration;
  const status = props.apiFirmwareValue == firmware_hardware &&
    props.apiFirmwareValue == boardType(firmware_version);
  return <Popover position={Position.BOTTOM}>
    <FirmwareHardwareStatusIcon
      firmwareHardware={firmware_hardware}
      status={status} />
    <FirmwareHardwareStatusDetails
      bot={props.bot}
      botOnline={props.botOnline}
      apiFirmwareValue={props.apiFirmwareValue}
      botFirmwareValue={firmware_hardware}
      mcuFirmwareValue={boardType(firmware_version)}
      shouldDisplay={props.shouldDisplay} />
  </Popover>;
};
