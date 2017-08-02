import * as React from "react";
import { StepParams } from "../interfaces";
import { StepTitleBar } from "./step_title_bar";
import { splice, remove } from "./index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { StepIconGroup } from "../step_icon_group";

export function TileExecuteScript({ dispatch, currentStep, index, currentSequence }: StepParams) {
  if (currentStep.kind === "execute_script") {
    return (<div>
      <div className="step-wrapper">
        <div className="row">
          <div className="col-sm-12">
            <div className="step-header execute-script-step">
              <StepTitleBar index={index}
                dispatch={dispatch}
                step={currentStep}
                sequence={currentSequence} />
              <StepIconGroup
                onClone={() => dispatch(splice({
                  step: currentStep,
                  index,
                  sequence: currentSequence
                }))}
                onTrash={() => remove({ dispatch, index, sequence: currentSequence })}
                helpText={t(ToolTips.EXECUTE_SCRIPT)} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="step-content execute-script-step">
              <div className="row">
                <div className="col-xs-12">
                  <label>{t("Package Name")}</label>
                  <input type="text" value={currentStep.args.label} disabled={true} />
                  <small>NOTE: Support for farmware selection is coming soon.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  } else {
    return <p> ERROR </p>;
  }
}
