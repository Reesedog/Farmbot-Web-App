import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { Panel } from "../farm_designer/panel_header";
import { Everything, ResourceColor } from "../interfaces";
import { TaggedGenericPointer } from "farmbot";
import { maybeFindGenericPointerById } from "../resources/selectors";
import { Actions } from "../constants";
import {
  EditPointProperties, updatePoint, PointActions, lookupPointSource,
} from "./point_edit_actions";
import { ListItem } from "../plants/plant_panel";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { save } from "../api/crud";
import { Path } from "../internal_urls";
import { ColorPicker } from "../ui";
import { ResourceTitle } from "../sequences/panel/editor";

export interface EditPointProps {
  dispatch: Function;
  findPoint(id: number): TaggedGenericPointer | undefined;
  botOnline: boolean;
}

export const mapStateToProps = (props: Everything): EditPointProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindGenericPointerById(props.resources.index, id),
  botOnline: isBotOnlineFromState(props.bot),
});

export class RawEditPoint extends React.Component<EditPointProps, {}> {
  get stringyID() { return Path.getSlug(Path.points()); }
  get point() {
    if (this.stringyID) {
      return this.props.findPoint(parseInt(this.stringyID));
    }
  }
  get panelName() { return "point-info"; }

  render() {
    const { dispatch } = this.props;
    const pointsPath = Path.points();
    !this.point && Path.startsWith(pointsPath) && push(pointsPath);
    return <DesignerPanel panelName={this.panelName} panel={Panel.Points}>
      <DesignerPanelHeader
        panelName={this.panelName}
        panel={Panel.Points}
        colorClass={this.point?.body.meta.color}
        titleElement={<ResourceTitle
          key={this.point?.body.name}
          resource={this.point}
          fallback={t("Edit weed")}
          dispatch={dispatch} />}
        specialStatus={this.point?.specialStatus}
        onSave={() => this.point?.uuid &&
          dispatch(save(this.point.uuid))}
        backTo={pointsPath}
        onBack={() => dispatch({
          type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
        })}>
        <ColorPicker
          current={(this.point?.body.meta.color || "green") as ResourceColor}
          targetElement={<i title={t("select color")}
            className={"icon-saucer fa fa-paint-brush"} />}
          onChange={color =>
            updatePoint(this.point, dispatch)({ meta: { color } })} />
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={this.panelName}>
        {this.point
          ? <div className={"point-panel-content-wrapper"}>
            <EditPointProperties point={this.point}
              botOnline={this.props.botOnline}
              updatePoint={updatePoint(this.point, dispatch)} />
            <ul className="meta">
              {Object.entries(this.point.body.meta).map(([key, value]) => {
                switch (key) {
                  case "color":
                  case "at_soil_level":
                  case "removal_method":
                  case "type":
                  case "gridId":
                    return <div key={key}
                      className={`meta-${key}-not-displayed`} />;
                  case "created_by":
                    return <ListItem name={t("Source")} key={key}>
                      {lookupPointSource(value)}
                    </ListItem>;
                  default:
                    return <ListItem key={key} name={key}>
                      {value || ""}
                    </ListItem>;
                }
              })}
            </ul>
            <PointActions uuid={this.point.uuid} dispatch={dispatch} />
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditPoint = connect(mapStateToProps)(RawEditPoint);
