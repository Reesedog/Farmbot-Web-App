import * as React from "react";
import { TaggedGenericPointer } from "farmbot";
import { GardenPoint } from "./garden_point";
import { MapTransformProps, Mode } from "../../interfaces";
import { getMode } from "../../util";

export interface PointLayerProps {
  visible: boolean;
  points: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  hoveredPoint: string | undefined;
  dispatch: Function;
}

export function PointLayer(props: PointLayerProps) {
  const { visible, points, mapTransformProps, hoveredPoint } = props;
  const style: React.CSSProperties =
    getMode() === Mode.points ? {} : { pointerEvents: "none" };
  return <g id="point-layer" style={style}>
    {visible &&
      points.map(p =>
        <GardenPoint
          point={p}
          key={p.uuid}
          hovered={hoveredPoint == p.uuid}
          dispatch={props.dispatch}
          mapTransformProps={mapTransformProps} />
      )}
  </g>;
}
