import { t } from "i18next";
import axios from "axios";
import * as _ from "lodash";
import { success, warning, info, error } from "farmbot-toastr";
import { getDevice } from "../device";
import { Log, Everything } from "../interfaces";
import { GithubRelease, MoveRelProps } from "./interfaces";
import { Thunk, GetState } from "../redux/interfaces";
import { BotState } from "../devices/interfaces";
import {
  McuParams,
  Configuration,
  SyncStatus
} from "farmbot";
import { Sequence } from "../sequences/interfaces";
import { ControlPanelState } from "../devices/interfaces";
import { API } from "../api/index";
import { User } from "../auth/interfaces";
import { getDeviceAccountSettings } from "../resources/selectors";
import { TaggedDevice } from "../resources/tagged_resources";
import { versionOK } from "./reducer";
import { HttpData } from "../util";
import { Actions, Content } from "../constants";
import { mcuParamValidator } from "./update_interceptor";

const ON = 1, OFF = 0;
export type ConfigKey = keyof McuParams;
export const EXPECTED_MAJOR = 5;
export const EXPECTED_MINOR = 0;

export function isLog(x: object): x is Log {
  return _.isObject(x) && _.isString(_.get(x, "message" as keyof Log));
}
const commandErr = (noun = "Command") => (x: {}) => {
  console.dir(x);
  console.info("Took longer than 6 seconds: " + noun);
};

export const commandOK = (noun = "Command") => () => {
  const msg = noun + " request sent to device.";
  success(msg, t("Request sent"));
};

export function checkControllerUpdates() {
  const noun = "Check for Updates";
  getDevice()
    .checkUpdates()
    .then(commandOK(noun), commandErr(noun));
}

export function powerOff() {
  const noun = "Power Off Bot";
  getDevice()
    .powerOff()
    .then(commandOK(noun), commandErr(noun));
}

export function factoryReset() {
  if (!confirm(t(Content.FACTORY_RESET_ALERT))) {
    return;
  }
  getDevice().resetOS();
}

export function reboot() {
  const noun = "Reboot Bot";
  getDevice()
    .reboot()
    .then(commandOK(noun), commandErr(noun));
}

export function emergencyLock() {
  const noun = "Emergency stop";
  getDevice()
    .emergencyLock()
    .then(commandOK(noun), commandErr(noun));
}

export function emergencyUnlock() {
  const noun = "Emergency unlock";
  if (confirm(`Are you sure you want to unlock the device?`)) {
    getDevice()
      .emergencyUnlock()
      .then(commandOK(noun), commandErr(noun));
  }
}

export function sync(): Thunk {
  const noun = "Sync";
  return function (dispatch, getState) {
    const IS_OK = versionOK(getState()
      .bot
      .hardware
      .informational_settings
      .controller_version, EXPECTED_MAJOR, EXPECTED_MINOR);
    if (IS_OK) {
      dispatch(setSyncStatus("syncing"));
      getDevice()
        .sync()
        .then(() => {
          commandOK(noun);
          dispatch(setSyncStatus("synced"));
        }).catch(() => {
          commandErr(noun);
          dispatch(setSyncStatus("sync_error"));
        });
    } else {
      if (getState()
        .bot
        .hardware
        .informational_settings
        .controller_version) {
        badVersion();
      } else {
        info(t("FarmBot is not connected."), t("Disconnected"), "red");
      }
    }
  };
}

export function execSequence(sequence: Sequence) {
  const noun = "Sequence execution";
  if (sequence.id) {
    return getDevice()
      .execSequence(sequence.id)
      .then(commandOK(noun), commandErr(noun));
  } else {
    throw new Error("Can't execute unsaved sequences");
  }
}

export let saveAccountChanges: Thunk = function (dispatch, getState) {
  return save(getDeviceAccountSettings(getState().resources.index));
};

export let fetchReleases =
  (url: string) => (dispatch: Function, getState: Function) => {
    axios
      .get(url)
      .then((resp: HttpData<GithubRelease>) => {
        const version = resp.data.tag_name;
        const versionWithoutV = version.toLowerCase().replace("v", "");
        dispatch({
          type: "FETCH_OS_UPDATE_INFO_OK",
          payload: versionWithoutV
        });
      })
      .catch((ferror) => {
        error(t("Could not download firmware update information."));
        dispatch({
          type: "FETCH_OS_UPDATE_INFO_ERROR",
          payload: ferror
        });
      });
  };

export function save(input: TaggedDevice) {
  return function (dispatch: Function, getState: GetState) {
    return axios
      .put(API.current.devicePath, input.body)
      .then((resp: HttpData<User>) => dispatch({ type: "SAVE_DEVICE_OK", payload: resp.data }))
      .catch(resp => error(t("Error saving device settings.")));
  };
}

/**
 * Toggles visibility of individual sections in the giant controls panel
 * found on the Devices page.
 */
export function toggleControlPanel(payload: keyof ControlPanelState) {
  return { type: "TOGGLE_CONTROL_PANEL_OPTION", payload };
}

export function MCUFactoryReset() {
  return getDevice().resetMCU();
}

export function botConfigChange(key: ConfigKey, value: number) {
  const noun = "Setting toggle";

  return getDevice()
    .updateMcu({ [key]: value })
    .then(_.noop, commandErr(noun));
}

export function settingToggle(
  name: ConfigKey, bot: BotState, displayAlert: string | undefined
) {
  if (displayAlert) { alert(displayAlert.replace(/\s+/g, " ")); }
  const noun = "Setting toggle";
  return getDevice()
    .updateMcu({
      [name]: ((bot.hardware.mcu_params)[name] === 0) ? ON : OFF
    })
    .then(_.noop, commandErr(noun));
}

export function moveRelative(props: MoveRelProps) {
  return getDevice()
    .moveRelative(props)
    .then(_.noop, commandErr("Relative movement"));
}

export function moveAbs(props: MoveRelProps) {
  const noun = "Absolute movement";
  return getDevice()
    .moveAbsolute(props)
    .then(_.noop, commandErr(noun));
}

export function pinToggle(pin_number: number) {
  const noun = "Setting toggle";
  return getDevice()
    .togglePin({ pin_number })
    .then(_.noop, commandErr(noun));
}

export function homeAll(speed: number) {
  const noun = "'Home All' command";
  getDevice()
    .home({ axis: "all", speed })
    .then(commandOK(noun), commandErr(noun));
}

const startUpdate = () => {
  return {
    type: Actions.SETTING_UPDATE_START,
    payload: undefined
  };
};

const updateOK = (dispatch: Function, noun: string) => {
  dispatch({ type: "SETTING_UPDATE_END", payload: undefined });
  commandOK(noun);
};

const updateNO = (dispatch: Function, noun: string) => {
  dispatch({ type: "SETTING_UPDATE_END", payload: undefined });
  commandErr(noun);
};

export function updateMCU(key: ConfigKey, val: string) {
  const noun = "configuration update";
  return function (dispatch: Function, getState: () => Everything) {
    const state = getState().bot.hardware.mcu_params;

    function proceed() {
      dispatch(startUpdate());
      getDevice()
        .updateMcu({ [key]: val })
        .then(() => updateOK(dispatch, noun))
        .catch(() => updateNO(dispatch, noun));
    }

    const dont = (err: string) => warning(err);

    const validate = mcuParamValidator(key, parseInt(val, 10), state);
    validate(proceed, dont);
  };
}

export function updateConfig(config: Configuration) {
  const noun = "Update Config";
  return function (dispatch: Function) {
    getDevice()
      .updateConfig(config)
      .then(() => updateOK(dispatch, noun))
      .catch(() => updateNO(dispatch, noun));
  };
}

export function changeStepSize(integer: number) {
  return {
    type: "CHANGE_STEP_SIZE",
    payload: integer
  };
}

export function setSyncStatus(payload: SyncStatus) {
  return { type: "SET_SYNC_STATUS", payload };
}

export function badVersion() {
  info(t("You are running an old version of FarmBot OS."), t("Please Update"), "red");
}
