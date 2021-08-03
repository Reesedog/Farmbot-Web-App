import React from "react";
import { AxisNumberProperty, MapTransformProps, TaggedPlant } from "../interfaces";
import { transformXY, round, getMapSize } from "../util";
import { BotPosition } from "../../../devices/interfaces";
import { isNumber, isUndefined } from "lodash";
import { Color } from "../../../ui";
import { TaggedImage, TaggedPoint, TaggedSensorReading } from "farmbot";

interface BaseProps {
  hoveredPlant: TaggedPlant | undefined;
  hoveredPoint: TaggedPoint | undefined;
  hoveredSensorReading: TaggedSensorReading | undefined;
  hoveredImage: TaggedImage | undefined;
  mapTransformProps: MapTransformProps;
}

export interface TargetCoordinateProps extends BaseProps {
  chosenLocation: BotPosition | undefined;
  plantAreaOffset: AxisNumberProperty;
  zoomLvl: number;
}

export function TargetCoordinate(props: TargetCoordinateProps) {
  const ID = "target-coordinate";
  if (!props.chosenLocation) { return <g id={ID} />; }
  const { x, y } = props.chosenLocation;
  if (isNumber(x) && isNumber(y)) {
    const { mapTransformProps, plantAreaOffset } = props;
    const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
    const mapSize = getMapSize(mapTransformProps, plantAreaOffset);
    const scaleFactor = 1 + Math.round(15 * (1.8 - props.zoomLvl)) / 10;
    return <g id={ID}>
      <defs>
        <g id={"target-coordinate-crosshair-segment"}>
          <rect
            x={qx - 10 * scaleFactor}
            y={qy - 2 * scaleFactor}
            width={10 * scaleFactor}
            height={4 * scaleFactor}
            fill={Color.darkGray} />
        </g>
      </defs>
      <g id="long-crosshair">
        <rect x={qx - 0.5} y={-plantAreaOffset.y} width={1} height={mapSize.h} />
        <rect x={-plantAreaOffset.x} y={qy - 0.5} width={mapSize.w} height={1} />
      </g>
      {[0, 90, 180, 270].map(rotation => {
        return <use key={rotation.toString()} stroke={Color.white} strokeWidth={2}
          xlinkHref={"#target-coordinate-crosshair-segment"}
          transform={`rotate(${rotation}, ${qx}, ${qy})`} />;
      })}
      {[0, 90, 180, 270].map(rotation => {
        return <use key={rotation.toString()}
          xlinkHref={"#target-coordinate-crosshair-segment"}
          transform={`rotate(${rotation}, ${qx}, ${qy})`} />;
      })}
      <TargetLine qx={qx} qy={qy} {...props} />
    </g>;
  } else {
    return <g id={ID} />;
  }
}

interface TargetLineProps extends BaseProps {
  qx: number;
  qy: number;
}

const TargetLine = (props: TargetLineProps) => {
  const {
    qx, qy, hoveredPlant, hoveredPoint,
    hoveredSensorReading, hoveredImage,
    mapTransformProps,
  } = props;

  const location = hoveredPlant?.body || hoveredPoint?.body
    || hoveredSensorReading?.body || hoveredImage?.body.meta;

  if (location && !isUndefined(location.x) && !isUndefined(location.y)) {
    const end = transformXY(location.x, location.y, mapTransformProps);
    return <line id={"target-line"} x1={qx} y1={qy} x2={end.qx} y2={end.qy}
      stroke={Color.darkGray} strokeWidth={4} strokeDasharray={10} />;
  }

  return <g id={"no-target-line"} />;
};
