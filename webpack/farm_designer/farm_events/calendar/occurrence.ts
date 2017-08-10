import * as moment from "moment";
import { CalendarOccurrence } from "../../interfaces";
import { FarmEventWithExecutable } from "./interfaces";
import { Calendar } from "./index";

/** An occurrence is a single event on the calendar, usually rendered as a
 * little white square on the farm event UI. This is the data representation for
 * single calendar entries. */
export function occurrence(m: moment.Moment, fe: FarmEventWithExecutable):
  CalendarOccurrence {
  return {
    mmddyy: m.format(Calendar.DATE_FORMAT),
    sortKey: m.unix(),
    timeStr: m.format("hh:mma"),
    heading: fe.executable.name || fe.executable_type,
    executableId: fe.executable_id || 0,
    id: fe.id || 0,
  };
}
