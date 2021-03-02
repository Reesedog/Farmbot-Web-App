import React from "react";
import { connect } from "react-redux";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { every, some } from "lodash";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { DesignerNavTabs, Panel } from "../farm_designer/panel_header";
import { Everything } from "../interfaces";
import { Saucer } from "../ui";
import {
  WIZARD_SECTIONS, WIZARD_STEP_SLUGS, WizardData,
  WIZARD_STEPS, WizardSectionSlug, WizardStepSlug,
} from "./data";
import {
  SetupWizardProps, SetupWizardState, WizardHeaderProps, WizardResults,
  WizardSectionHeaderProps, WizardSectionsOpen,
} from "./interfaces";
import { maybeGetTimeSettings } from "../resources/selectors";
import { WizardStepContainer } from "./step";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFwHardwareValue } from "../settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "../resources/getters";

export const mapStateToProps = (props: Everything): SetupWizardProps => ({
  resources: props.resources.index,
  bot: props.bot,
  dispatch: props.dispatch,
  timeSettings: maybeGetTimeSettings(props.resources.index),
  getConfigValue: getWebAppConfigValue(() => props),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
});

export class RawSetupWizard
  extends React.Component<SetupWizardProps, SetupWizardState> {

  get firmwareHardware() { return this.props.firmwareHardware; }

  sectionsOpen = (results: WizardResults) => {
    const open: Partial<WizardSectionsOpen> = {};
    WIZARD_SECTIONS(this.firmwareHardware).map(section => {
      open[section.slug] = some(section.steps.map(step =>
        !results[step.slug]?.answer));
    });
    return open as WizardSectionsOpen;
  }

  state: SetupWizardState = {
    results: this.results,
    ...this.sectionsOpen(this.results),
    stepOpen: WIZARD_STEP_SLUGS(this.firmwareHardware)
      .filter(slug => !this.results[slug]?.answer)[0],
  };

  reset = () => {
    WizardData.reset();
    this.setState({
      results: {},
      stepOpen: WIZARD_STEP_SLUGS(this.firmwareHardware)[0],
      ...this.sectionsOpen({}),
    });
  }

  get results() { return WizardData.fetch(); }

  updateData = (
    update: WizardResults,
    nextStepSlug?: WizardStepSlug,
  ) => () => {
    const updatedResults = WizardData.update(update);
    this.setState({
      results: updatedResults,
      ...this.sectionsOpen(updatedResults),
      stepOpen: nextStepSlug || this.state.stepOpen,
    });
    WizardData.doneCount() == WIZARD_STEPS(this.firmwareHardware).length
      && WizardData.setComplete();
  }

  getNextStepSlug = (stepSlug: WizardStepSlug) => {
    const slugs = WIZARD_STEP_SLUGS(this.firmwareHardware);
    return slugs[slugs.indexOf(stepSlug) + 1];
  };

  setStepSuccess = (stepSlug: WizardStepSlug) =>
    (success: boolean, outcome?: string) =>
      this.updateData({
        [stepSlug]: {
          timestamp: new Date().getTime(),
          outcome: success
            ? undefined
            : (outcome || this.results[stepSlug]?.outcome),
          answer: success,
        },
      }, success ? this.getNextStepSlug(stepSlug) : undefined);

  toggleSection = (slug: WizardSectionSlug) => () =>
    this.setState({ ...this.state, [slug]: !this.state[slug] });

  openStep = (stepSlug: WizardStepSlug) => () => this.setState({
    stepOpen: this.state.stepOpen == stepSlug ? undefined : stepSlug,
  });

  render() {
    const panelName = "setup";
    return <DesignerPanel panelName={panelName} panel={Panel.Controls}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Controls} />
      <DesignerPanelContent panelName={panelName}>
        <WizardHeader reset={this.reset}
          firmwareHardware={this.firmwareHardware} />
        {WIZARD_SECTIONS(this.firmwareHardware).map(section =>
          <div className={"wizard-section"} key={section.slug}>
            <WizardSectionHeader
              toggleSection={this.toggleSection}
              results={this.state.results}
              section={section}
              sectionOpen={this.state[section.slug]} />
            <Collapse isOpen={this.state[section.slug]}>
              {section.steps.map(step =>
                <WizardStepContainer
                  key={step.slug}
                  step={step}
                  results={this.state.results}
                  section={section}
                  stepOpen={this.state.stepOpen}
                  openStep={this.openStep}
                  setStepSuccess={this.setStepSuccess}
                  timeSettings={this.props.timeSettings}
                  bot={this.props.bot}
                  dispatch={this.props.dispatch}
                  getConfigValue={this.props.getConfigValue}
                  resources={this.props.resources} />)}
            </Collapse>
          </div>)}
        {WizardData.getComplete() &&
          <div className={"setup-complete"}>
            <Saucer color={"green"}><i className={"fa fa-check"} /></Saucer>
            <p>{t("Setup Complete!")}</p>
          </div>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

const WizardHeader = (props: WizardHeaderProps) =>
  <div className={"wizard-header"}>
    <h1>{t("Setup")}</h1>
    <p className={"progress-meter"}>
      {WizardData.progressPercent(props.firmwareHardware)}% {t("complete")}
    </p>
    <button className={"fb-button red start-over"} onClick={props.reset}>
      {t("start over")}
    </button>
  </div>;

const WizardSectionHeader = (props: WizardSectionHeaderProps) =>
  <h2 onClick={props.toggleSection(props.section.slug)}>
    {t(props.section.title)}
    {every(props.section.steps.map(step =>
      props.results[step.slug]?.answer)) &&
      <Saucer color={"green"}>
        <div className={"step-icon"}>
          <i className={"fa fa-check"} />
        </div>
      </Saucer>}
    <i className={
      `fa fa-caret-${props.sectionOpen ? "up" : "down"}`} />
  </h2>;

export const SetupWizard = connect(mapStateToProps)(RawSetupWizard);
