import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { SaveBtn } from "../ui";
import { SpecialStatus, TaggedToolSlotPointer } from "farmbot";
import { init, save, edit, destroy } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { push } from "../history";
import { SlotEditRows } from "./tool_slot_edit_components";
import { hasUTM } from "../settings/firmware/firmware_hardware_support";
import { mapStateToPropsAdd } from "./state_to_props";
import { AddToolSlotState, AddToolSlotProps } from "./interfaces";
import { Path } from "../internal_urls";

export class RawAddToolSlot
  extends React.Component<AddToolSlotProps, AddToolSlotState> {
  state: AddToolSlotState = { uuid: undefined };

  componentDidMount() {
    const action = init("Point", {
      pointer_type: "ToolSlot", name: t("Slot"), meta: {},
      x: 0, y: 0, z: 0, tool_id: undefined,
      pullout_direction: ToolPulloutDirection.NONE,
      gantry_mounted: !hasUTM(this.props.firmwareHardware),
    });
    this.setState({ uuid: action.payload.uuid });
    this.props.dispatch(action);
  }

  componentWillUnmount() {
    if (this.state.uuid && this.toolSlot
      && this.toolSlot.specialStatus == SpecialStatus.DIRTY) {
      confirm(t("Save new slot?"))
        ? this.props.dispatch(save(this.state.uuid))
        : this.props.dispatch(destroy(this.state.uuid, true));
    }
  }

  get toolSlot() {
    return this.props.findToolSlot(this.state.uuid);
  }

  get tool() {
    return this.toolSlot
      ? this.props.findTool(this.toolSlot.body.tool_id || 0)
      : undefined;
  }

  updateSlot = (toolSlot: TaggedToolSlotPointer) =>
    (update: Partial<TaggedToolSlotPointer["body"]>) =>
      this.props.dispatch(edit(toolSlot, update));

  save = () => {
    this.state.uuid && this.props.dispatch(save(this.state.uuid));
    push(Path.tools());
  };

  render() {
    const panelName = "add-tool-slot";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add new slot")}
        backTo={Path.tools()}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {this.toolSlot
          ? <SlotEditRows
            noUTM={!hasUTM(this.props.firmwareHardware)}
            toolSlot={this.toolSlot}
            tools={this.props.tools}
            tool={this.tool}
            botOnline={this.props.botOnline}
            botPosition={this.props.botPosition}
            toolTransformProps={this.props.toolTransformProps}
            isActive={this.props.isActive}
            updateToolSlot={this.updateSlot(this.toolSlot)} />
          : "initializing"}
        <SaveBtn onClick={this.save} status={SpecialStatus.DIRTY} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddToolSlot = connect(mapStateToPropsAdd)(RawAddToolSlot);
