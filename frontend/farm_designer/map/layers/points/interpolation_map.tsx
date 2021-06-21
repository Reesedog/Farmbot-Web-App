import React from "react";
import { TaggedGenericPointer, TaggedPoint, Xyz } from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { isUndefined, range, round, sortBy, sum } from "lodash";
import { distance, findNearest } from "../../../../point_groups/paths";
import { groupItemsByLocation } from "../../../location_info";

export enum InterpolationKey {
  data = "interpolationData",
  hash = "interpolationHash",
  opts = "interpolationOpts",
}

export type InterpolationData = Record<Xyz, number>[];

export const getInterpolationData = (): InterpolationData =>
  JSON.parse(localStorage.getItem(InterpolationKey.data) || "[]");

interface InterpolationOptions {
  stepSize: number;
  useNearest: boolean;
  power: number;
}

export const DEFAULT_INTERPOLATION_OPTIONS: InterpolationOptions = {
  stepSize: 100,
  useNearest: false,
  power: 4,
};

export const fetchInterpolationOptions = (): InterpolationOptions => {
  const options = JSON.parse(localStorage.getItem(InterpolationKey.opts) || "{}");
  Object.entries(DEFAULT_INTERPOLATION_OPTIONS).map(([key, value]) => {
    if (isUndefined(options[key])) { options[key] = value; }
  });
  return options;
};

interface GenerateInterpolationMapDataProps {
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  options: InterpolationOptions;
}

export const generateData = (props: GenerateInterpolationMapDataProps) => {
  const soilHeightPoints = sortBy(groupItemsByLocation(props.genericPoints
    .filter(p => p.body.meta.at_soil_level), undefined), "points.body.created_at")
    .map(data => data.items[0]);
  const gridX = props.mapTransformProps.gridSize.x;
  const gridY = props.mapTransformProps.gridSize.y;
  const step = props.options.stepSize;
  const hash = [JSON.stringify(soilHeightPoints), gridX, gridY, step].join("");
  if (localStorage.getItem(InterpolationKey.hash) == hash) { return; }
  const data: InterpolationData = [];
  range(0, gridX, step).map(x =>
    range(0, gridY, step).map(y => {
      const z = interpolatedZ({ x, y }, soilHeightPoints, props.options);
      if (!isUndefined(z)) { data.push({ x, y, z }); }
    }));
  localStorage.setItem(InterpolationKey.data, JSON.stringify(data));
  localStorage.setItem(InterpolationKey.hash, hash);
};

export const interpolatedZ = (
  position: { x: number, y: number },
  points: TaggedPoint[],
  options: InterpolationOptions,
) => {
  const { useNearest, power } = options;
  const nearest = findNearest(position, points);
  if (!nearest) { return undefined; }
  if (distance(position, nearest.body) == 0 || useNearest) {
    return nearest.body.z;
  }
  return round(
    weightedSum(position, points, power, true)
    / weightedSum(position, points, power),
    2);
};

const weightedSum = (
  position: { x: number, y: number },
  points: TaggedPoint[],
  power: number,
  withZ = false,
) =>
  sum(points.map(point =>
    (1 / distance(position, point.body) ** power)
    * (withZ ? point.body.z : 1)));

interface InterpolationMapProps {
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  options: InterpolationOptions;
}

export const InterpolationMap = (props: InterpolationMapProps) => {
  const step = props.options.stepSize;
  return <g id={"interpolation-map"}>
    {getInterpolationData().map(p => {
      const { x, y, z } = p;
      const { qx, qy } = transformXY(x, y, props.mapTransformProps);
      return <rect key={`${x}-${y}`}
        x={qx} y={qy} width={step} height={step}
        fill={props.getColor(z)} fillOpacity={0.85} />;
    })}
  </g>;
};
