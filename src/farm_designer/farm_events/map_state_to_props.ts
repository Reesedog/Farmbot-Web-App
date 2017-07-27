import { Everything } from "../../interfaces";
import * as moment from "moment";
import { FarmEventProps } from "../interfaces";
import { joinFarmEventsToExecutable } from "./calendar/selectors";
import { Calendar } from "./calendar/index";
import { occurrence } from "./calendar/occurrence";
import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";

/** Prepares a FarmEvent[] for use with <FBSelect /> */
export function mapStateToProps(state: Everything): FarmEventProps {
  let x = joinFarmEventsToExecutable(state.resources.index);
  let push = (state && state.router && state.router.push) || (() => { });
  let calendar = mapResourcesToCalendar(state.resources.index, moment.now());
  let calendarRows = calendar.getAll();
  return { calendarRows, push };
}

/** TODO: Reduce complexity, but write *good* unit tests *before* refactoring.*/
export function mapResourcesToCalendar(ri: ResourceIndex, unixNow = moment.now()): Calendar {
  let x = joinFarmEventsToExecutable(ri);
  let calendar = new Calendar();
  console.group("WOW");
  x.map(function (fe) {
    console.dir(fe);
    console.log("!!calendar = " + !!calendar);
    console.log("Calendar is empty, so it doesn't even *try* to render the" +
      "regimen items. We need to check fe.executable_type early, maybe?");
    (fe.calendar || []).map(function (date) {
      let m = moment(date);
      calendar.insert(occurrence(m, fe));
      console.log("Hmmm");
      if (fe.executable_type === "Regimen") {
        console.dir(fe.executable.regimen_items.length);
        fe.executable.regimen_items.map((regi, i) => {
          // Add the offset, give it a special name, push it into the calendar.
          let m2 = m
            .clone()
            .startOf("day")
            .add(regi.time_offset, "milliseconds");
          if (m2.isBefore(m)) {
            console.log("Bailed early");
            return;
          } else {
            console.log("Kept going");
            let o = occurrence(m2, fe);
            let seq = findSequenceById(ri, regi.sequence_id);
            let sequenceName = seq.body.name;
            o.parentExecutableName = fe.executable.name;
            o.childExecutableName = sequenceName;
            calendar.insert(o);
          }
        });
      }
    });
  });
  console.groupEnd();
  return calendar;
}
