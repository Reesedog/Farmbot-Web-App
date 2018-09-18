import * as React from "react";
import { WidgetHeader, Widget, WidgetBody } from "../../ui/index";
import { LabsFeaturesList } from "./labs_features_list_ui";
import { maybeToggleFeature } from "./labs_features_list_data";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { GetWebAppConfigValue } from "../../config_storage/actions";

interface LabsFeaturesProps {
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

export class LabsFeatures extends React.Component<LabsFeaturesProps, {}> {
  state = {};

  render() {
    const { getConfigValue, dispatch } = this.props;
    return <Widget className="peripherals-widget">
      <WidgetHeader title={t("App Settings")}
        helpText={ToolTips.LABS}>
      </WidgetHeader>
      <WidgetBody>
        <LabsFeaturesList
          getConfigValue={getConfigValue}
          onToggle={x => {
            maybeToggleFeature(getConfigValue, dispatch)(x);
            this.forceUpdate();
          }} />
      </WidgetBody>
    </Widget>;
  }
}
