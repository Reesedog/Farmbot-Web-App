import React from "react";
import { McuInputBox } from "./mcu_input_box";
import { PinGuardMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help, ToggleButton } from "../../ui";
import { settingToggle } from "../../devices/actions";
import { isUndefined } from "lodash";
import { t } from "../../i18next_wrapper";
import { PinNumberDropdown } from "./pin_number_dropdown";
import { ToolTips } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { getModifiedClassName } from "./default_values";

export class PinGuardMCUInputGroup
  extends React.Component<PinGuardMCUInputGroupProps> {

  Number = () =>
    <PinNumberDropdown
      pinNumKey={this.props.pinNumKey}
      dispatch={this.props.dispatch}
      resources={this.props.resources}
      disabled={this.props.disabled}
      sourceFwConfig={this.props.sourceFwConfig} />;

  Timeout = () =>
    <McuInputBox
      setting={this.props.timeoutKey}
      sourceFwConfig={this.props.sourceFwConfig}
      firmwareHardware={this.props.firmwareHardware}
      dispatch={this.props.dispatch}
      disabled={this.props.disabled}
      filter={32000} />;

  State = () => {
    const { sourceFwConfig, dispatch, activeStateKey } = this.props;
    const activeStateValue = sourceFwConfig(activeStateKey).value;
    const inactiveState = isUndefined(activeStateValue)
      ? undefined
      : !activeStateValue;
    return <ToggleButton dispatch={dispatch}
      customText={{ textFalse: t("off"), textTrue: t("on") }}
      toggleValue={inactiveState}
      dim={!sourceFwConfig(activeStateKey).consistent}
      className={getModifiedClassName(
        activeStateKey,
        activeStateValue,
        this.props.firmwareHardware)}
      disabled={this.props.disabled}
      toggleAction={() =>
        dispatch(settingToggle(activeStateKey, sourceFwConfig))} />;
  };

  render() {
    const { label } = this.props;
    return <Highlight settingName={label}>
      <div className={"pin-guard-input-row"}>
        <Row>
          <Col xs={6}>
            <label>
              {t(label)}
            </label>
            <Help text={ToolTips.PIN_GUARD_PIN_NUMBER} />
          </Col>
          <Col xs={5} className="no-pad">
            <this.Number />
          </Col>
        </Row>
        <Row>
          <Col xs={5} xsOffset={1} className="no-pad">
            <label>
              {t("Timeout (sec)")}
            </label>
          </Col>
          <Col xs={5} className="no-pad">
            <this.Timeout />
          </Col>
        </Row>
        <Row>
          <Col xs={5} xsOffset={1} className="no-pad">
            <label>
              {t("To State")}
            </label>
          </Col>
          <Col xs={5} className="no-pad">
            <this.State />
          </Col>
        </Row>
      </div>
    </Highlight>;
  }
}
