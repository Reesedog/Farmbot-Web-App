import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { history, getPathArray } from "../../history";
import { Everything } from "../../interfaces";
import { Panel } from "../panel_header";
import { selectAllPointGroups } from "../../resources/selectors";
import { TaggedPointGroup } from "farmbot";
import { edit, save } from "../../api/crud";
import { LocationSelection } from "../point_groups/criteria";
import { BotSize } from "../map/interfaces";
import { botSize } from "../state_to_props";

export interface EditZoneProps {
  dispatch: Function;
  findZone(id: number): TaggedPointGroup | undefined;
  botSize: BotSize;
}

export const mapStateToProps = (props: Everything): EditZoneProps => ({
  dispatch: props.dispatch,
  findZone: id => selectAllPointGroups(props.resources.index)
    .filter(g => g.body.id == id)[0],
  botSize: botSize(props),
});

export class RawEditZone extends React.Component<EditZoneProps, {}> {
  get stringyID() { return getPathArray()[4] || ""; }
  get zone() {
    if (this.stringyID) {
      return this.props.findZone(parseInt(this.stringyID));
    }
  }

  render() {
    const { zone } = this;
    !zone && history.push("/app/designer/zones");
    return <DesignerPanel panelName={"zone-info"} panel={Panel.Zones}>
      <DesignerPanelHeader
        panelName={"zone-info"}
        panel={Panel.Zones}
        title={`${t("Edit")} zone`}
        backTo={"/app/designer/zones"} />
      <DesignerPanelContent panelName={"zone-info"}>
        {zone
          ? <div className={"zone-info-panel-content-wrapper"}>
            <label>{t("zone name")}</label>
            <input name="name"
              defaultValue={zone.body.name}
              onBlur={e => {
                this.props.dispatch(edit(zone, { name: e.currentTarget.value }));
                this.props.dispatch(save(zone.uuid));
              }} />
            <LocationSelection
              group={zone}
              criteria={zone.body.criteria}
              dispatch={this.props.dispatch}
              botSize={this.props.botSize}
              editGroupAreaInMap={true} />
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditZone = connect(mapStateToProps)(RawEditZone);
