import * as React from "react";
import { SensorReadingsTableProps } from "./interfaces";
import { t } from "i18next";
import { xyzTableEntry } from "../../logs/components/logs_table";
import { formatLogTime } from "../../logs";
import * as moment from "moment";
import { TaggedSensorReading } from "../../resources/tagged_resources";

enum TableColWidth {
  sensor = 125,
  value = 50,
  mode = 50,
  location = 110,
  date = 100,
}

/** Separated to allow frozen header row while scrolling table body. */
const TableHeader = () =>
  <table className="sensor-history-table-header">
    <thead>
      <tr>
        <th style={{ width: `${TableColWidth.sensor}px` }}>
          <label>
            {t("Sensor")}
          </label>
        </th>
        <th style={{ width: `${TableColWidth.value}px` }}>
          <label>
            {t("Value")}
          </label>
        </th>
        <th style={{ width: `${TableColWidth.mode}px` }}>
          <label>
            {t("Mode")}
          </label>
        </th>
        <th style={{ width: `${TableColWidth.location}px` }}>
          <label>
            {t("Position (x, y, z)")}
          </label>
        </th>
        <th style={{ width: `${TableColWidth.date}px` }}>
          <label>
            {t("Time")}
          </label>
        </th>
      </tr>
    </thead>
  </table>;

/** Sensor reading. */
const TableRow = (props: {
  sensorReading: TaggedSensorReading,
  sensorName: string,
  timeOffset: number,
  period: "previous" | "current"
}) => {
  const { sensorReading, timeOffset, period, sensorName } = props;
  const { uuid, body } = sensorReading;
  const { value, x, y, z, created_at } = body;
  const color = period === "previous" ? "gray" : "";
  return <tr key={uuid} style={{ color }}>
    <td style={{ width: `${TableColWidth.sensor}px` }}>
      {sensorName}
    </td>
    <td style={{ width: `${TableColWidth.value}px` }}>
      {value}
    </td>
    <td style={{ width: `${TableColWidth.mode}px` }}>
      {-1/* {mode} */}
    </td>
    <td style={{ width: `${TableColWidth.location}px` }}>
      {xyzTableEntry(x, y, z)}
    </td>
    <td style={{ width: `${TableColWidth.date}px` }}>
      {formatLogTime(moment(created_at).unix(),
        timeOffset)}
    </td>
  </tr>;
};

export class SensorReadingsTable
  extends React.Component<SensorReadingsTableProps, {}> {

  render() {
    const sensorNameByPinLookup: { [x: number]: string } = {};
    this.props.sensors.map(x => {
      sensorNameByPinLookup[x.body.pin || 0] = x.body.label;
    });
    return <div className="sensor-history-table">
      <TableHeader />
      <table className="sensor-history-table-contents">
        <tbody>
          {["current", "previous"].map((period: "current" | "previous") => {
            return this.props.readingsForPeriod(period).map(sensorReading => {
              const pin = sensorReading.body.pin;
              const sensorName = `${sensorNameByPinLookup[pin]} (pin ${pin})`;
              return <TableRow
                key={sensorReading.uuid}
                sensorName={sensorName}
                sensorReading={sensorReading}
                timeOffset={this.props.timeOffset}
                period={period} />;
            });
          })}
        </tbody>
      </table>
    </div>;
  }
}
