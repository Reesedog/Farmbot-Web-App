import * as React from "react";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { FBSelect, DropDownItem } from "../../ui";
import { t } from "../../i18next_wrapper";
import { shuffle, sortBy } from "lodash";
import { Content } from "../../constants";
import { TaggedPoint } from "farmbot";

export interface PointGroupSortSelectorProps {
  onChange(value: PointGroupSortType): void;
  value: PointGroupSortType;
}

export const sortOptionsTable = (): Record<PointGroupSortType, string> => ({
  "random": t("Random Order"),
  "xy_ascending": t("X/Y, Ascending"),
  "xy_descending": t("X/Y, Descending"),
  "yx_ascending": t("Y/X, Ascending"),
  "yx_descending": t("Y/X, Descending"),
}); // Typechecker will remind us when this needs an update. Don't simplify - RC

const optionPlusDescriptions = () =>
  (Object
    .entries(sortOptionsTable()) as [PointGroupSortType, string][])
    .map(x => ({ label: x[1], value: x[0] }));

const optionList =
  optionPlusDescriptions().map(x => x.value);

export const isSortType = (x: unknown): x is PointGroupSortType => {
  return optionList.includes(x as PointGroupSortType);
};

const selected = (value: PointGroupSortType) => ({
  label: t(sortOptionsTable()[value] || value),
  value: value
});

export const sortTypeChange = (cb: Function) => (ddi: DropDownItem) => {
  const { value } = ddi;
  isSortType(value) && cb(value);
};

export function PointGroupSortSelector(p: PointGroupSortSelectorProps) {

  return <div>
    <div className="default-value-tooltip">
      <label>
        {t("SORT BY")}
      </label>
    </div>
    <FBSelect
      key={p.value}
      list={optionPlusDescriptions()}
      selectedItem={selected(p.value as PointGroupSortType)}
      onChange={sortTypeChange(p.onChange)} />
    <p>
      {(p.value == "random") ? t(Content.SORT_DESCRIPTION) : ""}
    </p>
  </div>;
}

type Sorter = (p: TaggedPoint[]) => TaggedPoint[];
type SortDictionary = Record<PointGroupSortType, Sorter>;

export const SORT_OPTIONS: SortDictionary = {
  random(points) {
    return shuffle(points);
  },
  xy_ascending(points) {
    return sortBy(points, ["body.x", "body.y"]);
  },
  xy_descending(points) {
    return sortBy(points, ["body.x", "body.y"]).reverse();
  },
  yx_ascending(points) {
    return sortBy(points, ["body.y", "body.x"]);
  },
  yx_descending(points) {
    return sortBy(points, ["body.y", "body.x"]).reverse();
  }
};
export const sortGroupBy =
  (st: PointGroupSortType, p: TaggedPoint[]) => SORT_OPTIONS[st](p);
