import { isLog } from "../devices/actions";
import {
  actOnChannelName,
  showLogOnScreen,
  speakLogAloud,
  initLog
} from "./connect_device";
import { GetState } from "../redux/interfaces";
import { Log } from "farmbot/dist/resources/api_resources";
import { globalQueue } from "./batch_queue";

export const onLogs =
  (_dispatch: Function, getState: GetState) => (msg: Log) => {
    if (isLog(msg)) {
      actOnChannelName(msg, "toast", showLogOnScreen);
      actOnChannelName(msg, "espeak", speakLogAloud(getState));
      const log = initLog(msg).payload;
      log.kind == "Log" && globalQueue.push(log);
    }
  };
