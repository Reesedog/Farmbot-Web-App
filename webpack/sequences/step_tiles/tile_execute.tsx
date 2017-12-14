import * as _ from "lodash";
import * as React from "react";
import { splice, remove } from "../step_tiles/index";
import { StepParams } from "../interfaces";
import { t } from "i18next";
import { DropDownItem, Row, Col } from "../../ui";
import { selectAllSequences, findSequenceById } from "../../resources/selectors";
import { Execute } from "farmbot/dist";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";
import { editStep } from "../../api/crud";
import { FBSelect } from "../../ui/new_fb_select";
import { StepIconGroup } from "../step_icon_group";
import { StepTitleBar } from "./step_title_bar";
import { ToolTips } from "../../constants";

export function ExecuteBlock(p: StepParams) {
  if (p.currentStep.kind === "execute") {
    return <RefactoredExecuteBlock currentStep={p.currentStep}
      currentSequence={p.currentSequence}
      index={p.index}
      dispatch={p.dispatch}
      resources={p.resources} />;
  } else {
    throw new Error("Thats not an execute block!");
  }
}

export interface ExecBlockParams {
  currentStep: Execute;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}
export class RefactoredExecuteBlock extends React.Component<ExecBlockParams, {}> {
  changeSelection = (input: DropDownItem) => {
    const { dispatch, currentSequence, currentStep, index } = this.props;
    dispatch(editStep({
      sequence: currentSequence,
      step: currentStep,
      index: index,
      executor: (step: Execute) => {
        if (_.isNumber(input.value)) {
          step.args.sequence_id = input.value;
        } else {
          throw new Error("Never not a number;");
        }
      }
    }));
  }

  sequenceDropDownList = () => {
    const p = this.props;
    const output: DropDownItem[] = [];
    selectAllSequences(p.resources)
      .map(function (x) {
        const { id, name } = x.body;
        if (_.isNumber(id) && (id !== p.currentStep.args.sequence_id)) {
          output.push({ label: name, value: id });
        }
      });
    return output;
  }

  SequenceSelectBox = () => {
    return <FBSelect onChange={this.changeSelection}
      selectedItem={this.selectedSequence()}
      list={this.sequenceDropDownList()}
      placeholder="Pick a sequence (or save a new one)" />;
  }

  selectedSequence = () => {
    const p = this.props;
    const { sequence_id } = p.currentStep.args;
    if (sequence_id) {
      const s = findSequenceById(p.resources, sequence_id);
      return { label: s.body.name, value: (s.body.id as number) };
    } else {
      return undefined;
    }
  }

  render() {
    const props = this.props;
    const { dispatch, currentStep, index, currentSequence } = props;
    return (<div>
      <div className="step-wrapper">
        <Row>
          <Col sm={12}>
            <div className="step-header execute-step">
              <StepTitleBar
                step={currentStep}
                index={index}
                dispatch={dispatch}
                sequence={currentSequence} />
              <StepIconGroup
                onClone={() => dispatch(splice({
                  index,
                  step: currentStep,
                  sequence: currentSequence
                }))}
                onTrash={() => remove({
                  dispatch,
                  index,
                  sequence: currentSequence
                })}
                helpText={t(ToolTips.EXECUTE_SEQUENCE)} />
            </div>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <div className="step-content execute-step">
              <Row>
                <Col sm={12}>
                  <label>{t("Sequence")}</label>
                  <this.SequenceSelectBox />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    </div>);
  }
}
