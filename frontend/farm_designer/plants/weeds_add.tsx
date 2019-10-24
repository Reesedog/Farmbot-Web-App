import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../plants/designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";

export interface AddWeedProps {
  dispatch: Function;
}

export interface AddWeedState {
}

export const mapStateToProps = (props: Everything): AddWeedProps => ({
  dispatch: props.dispatch,
});

export class RawAddWeed extends React.Component<AddWeedProps, AddWeedState> {
  state: AddWeedState = {};
  render() {
    return <DesignerPanel panelName={"add-weed"} panelColor={"red"}>
      <DesignerPanelHeader
        panelName={"weeds"}
        title={t("Add new weed")}
        backTo={"/app/designer/weeds"}
        panelColor={"red"} />
      <DesignerPanelContent panelName={"add-weed"}>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddWeed = connect(mapStateToProps)(RawAddWeed);
