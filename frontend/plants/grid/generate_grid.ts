import {
  PlantPointer, GenericPointer,
} from "farmbot/dist/resources/api_resources";
import { range } from "lodash";
import { PlantGridData, PlantGridInitOption } from "./interfaces";

const generateXs =
  (start: number, count: number, spacing: number, offsetCol: boolean) =>
    range(start, start + (count * spacing), spacing * (offsetCol ? 2 : 1));

const generateYs =
  (start: number, count: number, spacing: number) =>
    range(start, start + (count * spacing), spacing);

export function vectorGrid(params: PlantGridData, offsetPacking: boolean):
  [number, number][] {
  const { startX, startY, numPlantsH, numPlantsV, spacingH, spacingV } = params;
  const rows = generateYs(startY, numPlantsV, spacingV);
  const cols = generateXs(startX, numPlantsH, spacingH, offsetPacking);

  const results: [number, number][] = [];
  cols.map(x => rows.map(y => results.push([x, y])));

  if (offsetPacking) {
    const offsetRows = generateYs(startY + spacingV / 2, numPlantsV, spacingV);
    const numOffsetCols = numPlantsH % 2 == 0 ? numPlantsH : numPlantsH - 1;
    const offsetCols = generateXs(startX + spacingH, numOffsetCols, spacingH,
      offsetPacking);
    offsetCols.map(x => offsetRows.map(y => results.push([x, y])));
  }

  return results;
}

const createPlantGridMapper = (
  openfarm_slug: string,
  cropName: string,
  meta: Record<string, string | undefined>,
) =>
  (vec: [number, number]): PlantPointer => {
    const [x, y] = vec;
    return {
      name: cropName,
      radius: 25,
      z: 0,
      x,
      y,
      openfarm_slug,
      pointer_type: "Plant",
      plant_stage: "planted",
      meta,
    };
  };

const createPointGridMapper = (
  radius: number | undefined,
  z: number | undefined,
  pointName: string,
  meta: Record<string, string | undefined>,
) =>
  (vec: [number, number]): GenericPointer => {
    const [x, y] = vec;
    return {
      name: pointName,
      radius: radius || 25,
      z: z || 0,
      x,
      y,
      pointer_type: "GenericPointer",
      meta,
    };
  };

export const initPlantGrid =
  (p: PlantGridInitOption): (GenericPointer | PlantPointer)[] => {
    const meta: Record<string, string> = { gridId: p.gridId, ...p.meta };
    const mapper: (vec: [number, number]) => GenericPointer | PlantPointer =
      !p.openfarm_slug
        ? createPointGridMapper(p.radius, p.z, p.itemName, meta)
        : createPlantGridMapper(p.openfarm_slug, p.itemName, meta);
    return vectorGrid(p.grid, p.offsetPacking).map(mapper);
  };
