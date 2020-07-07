import * as React from "react";
import {
  BlurableInput, Row, Col, FBSelect, NULL_CHOICE, DropDownItem, Help,
} from "../../ui";
import { CameraCalibrationConfigProps } from "./interfaces";
import {
  SPECIAL_VALUE_DDI, CALIBRATION_DROPDOWNS, ORIGIN_DROPDOWNS,
} from "./constants";
import { WD_ENV } from "../weed_detector/remote_env/interfaces";
import { envGet } from "../weed_detector/remote_env/selectors";
import {
  SPECIAL_VALUES, CAMERA_CALIBRATION_KEY_PART, WD_KEY_DEFAULTS, namespace,
} from "../weed_detector/remote_env/constants";
import { isNumber, isUndefined } from "lodash";
import { t } from "../../i18next_wrapper";
import { ToolTips } from "../../constants";

export class CameraCalibrationConfig
  extends React.Component<CameraCalibrationConfigProps, {}> {

  wdEnvGet = (key: keyof WD_ENV) => envGet(key, this.props.values);

  namespace = namespace("CAMERA_CALIBRATION_");

  getDefault = (key: CAMERA_CALIBRATION_KEY_PART) =>
    WD_KEY_DEFAULTS[this.namespace(key)];

  getLabeledDefault = (key: CAMERA_CALIBRATION_KEY_PART) =>
    SPECIAL_VALUE_DDI[this.getDefault(key)].label;

  render() {
    const simple = !!this.wdEnvGet(this.namespace("easy_calibration"));
    const commonProps = {
      wdEnvGet: this.wdEnvGet,
      onChange: this.props.onChange,
    };
    return <div className={"camera-calibration-config"}>
      {!simple &&
        <div className={"camera-calibration-configs"}>
          <BoolConfig {...commonProps}
            helpText={t(ToolTips.INVERT_HUE_SELECTION, {
              defaultValue: this.getLabeledDefault("invert_hue_selection")
            })}
            configKey={this.namespace("invert_hue_selection")}
            label={t("Invert Hue Range Selection")} />
          <NumberBoxConfig {...commonProps}
            configKey={this.namespace("calibration_object_separation")}
            label={t(`Calibration Object Separation`)}
            helpText={t(ToolTips.OBJECT_SEPARATION, {
              defaultValue: this.getDefault("calibration_object_separation")
            })} />
          <Row>
            <DropdownConfig {...commonProps}
              list={CALIBRATION_DROPDOWNS}
              configKey={this.namespace("calibration_along_axis")}
              label={t(`Calibration Object Separation along axis`)}
              helpText={t(ToolTips.CALIBRATION_OBJECT_AXIS, {
                defaultValue: this.getLabeledDefault("calibration_along_axis")
              })} />
          </Row>
        </div>}
      <Row>
        <Col xs={6}>
          <NumberBoxConfig {...commonProps}
            configKey={this.namespace("camera_offset_x")}
            label={t(`Camera Offset X`)}
            helpText={t(ToolTips.CAMERA_OFFSET, {
              defaultX: this.getDefault("camera_offset_x"),
              defaultY: this.getDefault("camera_offset_y"),
            })} />
        </Col>
        <Col xs={6}>
          <NumberBoxConfig {...commonProps}
            configKey={this.namespace("camera_offset_y")}
            label={t(`Camera Offset Y`)}
            helpText={t(ToolTips.CAMERA_OFFSET, {
              defaultX: this.getDefault("camera_offset_x"),
              defaultY: this.getDefault("camera_offset_y"),
            })} />
        </Col>
      </Row>
      <Row>
        <DropdownConfig {...commonProps}
          list={ORIGIN_DROPDOWNS}
          configKey={this.namespace("image_bot_origin_location")}
          label={t(`Origin Location in Image`)}
          helpText={t(ToolTips.IMAGE_BOT_ORIGIN_LOCATION, {
            defaultValue: this.getLabeledDefault("image_bot_origin_location")
          })} />
      </Row>
      <Row>
        <Col xs={6} className={"config-results"}>
          <NumberBoxConfig {...commonProps}
            configKey={this.namespace("coord_scale")}
            label={t(`Pixel coordinate scale`)}
            helpText={t(ToolTips.COORDINATE_SCALE, {
              defaultValue: this.getDefault("coord_scale")
            })} />
        </Col>
        <Col xs={6} className={"config-results"}>
          <NumberBoxConfig {...commonProps}
            configKey={this.namespace("total_rotation_angle")}
            label={t(`Camera rotation`)}
            helpText={t(ToolTips.IMAGE_ROTATION_ANGLE, {
              defaultValue: this.getDefault("total_rotation_angle")
            })} />
        </Col>
      </Row>
      <Row>
        <p title={JSON.stringify(this.props.calibrationImageCenter)}>
          {!isUndefined(this.props.calibrationZ)
            ? `${t("Camera calibrated at z-axis height")}: ${
            this.props.calibrationZ}`
            : t("Camera not yet calibrated.")}
        </p>
      </Row>
    </div>;
  }
}

export interface BoolConfigProps {
  configKey: keyof WD_ENV;
  label: string;
  wdEnvGet(key: keyof WD_ENV): number;
  onChange(key: keyof WD_ENV, value: number): void;
  helpText?: string;
}

export const BoolConfig = (props: BoolConfigProps) =>
  <div className="boolean-camera-calibration-config">
    <label htmlFor={props.configKey}>
      {t(props.label)}
    </label>
    {props.helpText && <Help text={props.helpText} />}
    <input
      type="checkbox"
      name={props.configKey}
      id={props.configKey}
      checked={!!props.wdEnvGet(props.configKey)}
      onChange={e =>
        props.onChange(props.configKey,
          e.currentTarget.checked ?
            SPECIAL_VALUES.TRUE : SPECIAL_VALUES.FALSE)} />
  </div>;

export interface NumberBoxConfigProps {
  configKey: keyof WD_ENV;
  label: string;
  wdEnvGet(key: keyof WD_ENV): number;
  onChange(key: keyof WD_ENV, value: number): void;
  helpText: string;
}

export const NumberBoxConfig = (props: NumberBoxConfigProps) => {
  return <div className={"camera-config-number-box"}>
    <label htmlFor={props.configKey}>
      {t(props.label)}
    </label>
    <Help text={props.helpText} />
    <BlurableInput type="number"
      id={props.configKey}
      value={"" + props.wdEnvGet(props.configKey)}
      onCommit={e =>
        props.onChange(props.configKey, parseFloat(e.currentTarget.value))}
      placeholder={t(props.label)} />
  </div>;
};

export interface DropdownConfigProps {
  configKey: keyof WD_ENV;
  label: string;
  wdEnvGet(key: keyof WD_ENV): number;
  onChange(key: keyof WD_ENV, value: number): void;
  helpText: string;
  list: DropDownItem[];
}

export const DropdownConfig = (props: DropdownConfigProps) =>
  <div className="dropdown-camera-calibration-config">
    <label htmlFor={props.configKey}>
      {t(props.label)}
    </label>
    <Help text={props.helpText} />
    <FBSelect
      list={props.list}
      onChange={ddi => {
        if (isNumber(ddi.value)) {
          props.onChange(props.configKey, ddi.value);
        } else {
          throw new Error("Weed detector got a non-numeric value");
        }
      }}
      selectedItem={SPECIAL_VALUE_DDI[props.wdEnvGet(props.configKey)]
        || NULL_CHOICE} />
  </div>;
