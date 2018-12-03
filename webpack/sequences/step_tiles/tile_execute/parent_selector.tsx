import * as React from "react";
import { TileMoveAbsSelect } from "../tile_move_absolute/select";
import { t } from "i18next";
import { ResourceIndex } from "../../../resources/interfaces";
import { CALLBACK, LocationData } from "../tile_move_absolute/interfaces";
import { betterCompact } from "../../../util/util";

interface Props {
  targetUuid: string;
  currentUuid: string;
  deprecatedResources: ResourceIndex;
  selected: LocationData;
  onChange: CALLBACK;
}

export function ParentSelector(p: Props) {
  const { deprecatedResources, selected, onChange, targetUuid } = p;
  const meta = Object.values(deprecatedResources.sequenceMetas[targetUuid] || {});
  return <div>
    {betterCompact(meta).map(val => {
      return <div key={val.celeryNode.args.label}>
        <label>{t(`Set '${val.celeryNode.args.label}' value to:`)}</label>
        <TileMoveAbsSelect
          resources={deprecatedResources}
          selectedItem={selected}
          onChange={onChange}
          uuid={targetUuid}
          shouldDisplay={() => /* Handled by the parent of this comp. */ true} />
      </div>;
    })}
  </div>;
}
