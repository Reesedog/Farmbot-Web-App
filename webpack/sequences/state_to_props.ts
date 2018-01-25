import { Everything } from "../interfaces";
import { Props, HardwareFlags } from "./interfaces";
import {
  selectAllSequences,
  findSequence
} from "../resources/selectors";
import { getStepTag } from "../resources/sequence_tagging";
import { enabledAxisMap } from "../devices/components/axis_tracking_status";

export function mapStateToProps(props: Everything): Props {
  const uuid = props.resources.consumers.sequences.current;
  const sequence = uuid ? findSequence(props.resources.index, uuid) : undefined;
  sequence && (sequence.body.body || []).map(x => getStepTag(x));

  const hardwareFlags = (): HardwareFlags => {
    const { mcu_params } = props.bot.hardware;
    return {
      findHomeEnabled: enabledAxisMap(mcu_params),
      stopAtHome: {
        x: !!mcu_params.movement_stop_at_home_x,
        y: !!mcu_params.movement_stop_at_home_y,
        z: !!mcu_params.movement_stop_at_home_z
      },
      stopAtMax: {
        x: !!mcu_params.movement_stop_at_max_x,
        y: !!mcu_params.movement_stop_at_max_y,
        z: !!mcu_params.movement_stop_at_max_z
      },
      negativeOnly: {
        x: !!mcu_params.movement_home_up_x,
        y: !!mcu_params.movement_home_up_y,
        z: !!mcu_params.movement_home_up_z
      },
      axisLength: {
        x: (mcu_params.movement_axis_nr_steps_x || 0)
          / (mcu_params.movement_step_per_mm_x || 1),
        y: (mcu_params.movement_axis_nr_steps_y || 0)
          / (mcu_params.movement_step_per_mm_y || 1),
        z: (mcu_params.movement_axis_nr_steps_z || 0)
          / (mcu_params.movement_step_per_mm_z || 1)
      },
    };
  };

  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    sequence: sequence,
    auth: props.auth,
    resources: props.resources.index,
    syncStatus: (props
      .bot
      .hardware
      .informational_settings
      .sync_status || "unknown"),
    consistent: props.bot.consistent,
    autoSyncEnabled: !!props.bot.hardware.configuration.auto_sync,
    hardwareFlags: hardwareFlags(),
  };
}
