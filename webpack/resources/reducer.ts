import { generateReducer } from "../redux/generate_reducer";
import { RestResources } from "./interfaces";
import {
  indexUpsert,
  mutateSpecialStatus,
  findByUuid,
  indexRemove,
  initResourceReducer,
  afterEach,
  reindexAllFarmEventUsage
} from "./reducer_support";
import { TaggedResource, SpecialStatus } from "farmbot";
import { Actions } from "../constants";
import { EditResourceParams } from "../api/interfaces";
import { defensiveClone, equals } from "../util";
import { merge } from "lodash";
import { SyncBodyContents } from "../sync/actions";
import { GeneralizedError } from "./actions";
import { initialState as helpState } from "../help/reducer";
import { initialState as designerState } from "../farm_designer/reducer";
import { farmwareState } from "../farmware/reducer";
import { initialState as regimenState } from "../regimens/reducer";
import { initialState as sequenceState } from "../sequences/reducer";

export const emptyState = (): RestResources => {
  return {
    consumers: {
      sequences: sequenceState,
      regimens: regimenState,
      farm_designer: designerState,
      farmware: farmwareState,
      help: helpState,
    },
    loaded: [],
    index: {
      all: {}, // TODO: Make this a map to reduce iterations?
      byKind: {
        WebcamFeed: {},
        Device: {},
        FarmEvent: {},
        Image: {},
        Plant: {},
        Log: {},
        Peripheral: {},
        Crop: {},
        Point: {},
        Regimen: {},
        Sequence: {},
        Tool: {},
        User: {},
        FbosConfig: {},
        FirmwareConfig: {},
        WebAppConfig: {},
        SensorReading: {},
        Sensor: {},
        FarmwareInstallation: {},
        FarmwareEnv: {},
        PinBinding: {},
        PlantTemplate: {},
        SavedGarden: {},
        DiagnosticDump: {}
      },
      byKindAndId: {},
      references: {},
      sequenceMeta: {},
      inUse: {
        "Regimen.FarmEvent": {},
        "Sequence.FarmEvent": {},
        "Regimen.Sequence": {},
        "Sequence.Sequence": {},
      }
    }
  };
};

/** Responsible for all RESTful resources. */
export let resourceReducer =
  generateReducer<RestResources>(emptyState(), (s, a) => afterEach(s, a))
    .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
      indexUpsert(s.index, payload);
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVED);
      return s;
    })
    .add<EditResourceParams>(Actions.EDIT_RESOURCE, (s, { payload }) => {
      const { update } = payload;
      const target = findByUuid(s.index, payload.uuid);
      const before = defensiveClone(target.body);
      merge(target, { body: update });
      const didChange = !equals(before, target.body);
      didChange && mutateSpecialStatus(target.uuid, s.index, SpecialStatus.DIRTY);
      return s;
    })
    .add<EditResourceParams>(Actions.OVERWRITE_RESOURCE, (s, { payload }) => {
      const { uuid, update, specialStatus } = payload;
      const original = findByUuid(s.index, uuid);
      original.body = update;
      indexUpsert(s.index, original);
      mutateSpecialStatus(uuid, s.index, specialStatus);
      return s;
    })
    .add<SyncBodyContents<TaggedResource>>(Actions.RESOURCE_READY, (s, { payload }) => {
      const before = s.loaded.length;
      !s.loaded.includes(payload.kind) && s.loaded.push(payload.kind);
      const after = s.loaded.length;
      const isLoaded = (before === 21) && (after === 22);
      isLoaded && reindexAllFarmEventUsage(s.index);
      /** Example Use Case: Refreshing a group of logs after the application
       * is already bootstrapped. */
      Object.keys(s.index.byKind[payload.kind]).map(uuid => {
        const ref = s.index.references[uuid];
        ref && indexRemove(s.index, ref);
      });
      payload.body.map(x => indexUpsert(s.index, x));
      // MISFORTUNE: 1. Sequences can depend on other sequences.
      //             2. We need to keep track of this.
      //             3. We don't have control over resource load order.
      //             4. A sequence might depend on a sequence that is behind it
      //                  in the array, leading to missing ID errors.
      // SOLUTION: For now, just run the index sequence resources twice.
      // TODO: Use topological sorting or sth to avoid this (if it matter at
      //         all). RC 18 NOV 18
      payload.kind === "Sequence" &&
        payload.body.map(x => indexUpsert(s.index, x));

      return s;
    })
    .add<TaggedResource>(Actions.REFRESH_RESOURCE_OK, (s, { payload }) => {
      indexUpsert(s.index, payload);
      mutateSpecialStatus(payload.uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
      indexRemove(s.index, payload);
      return s;
    })
    .add<GeneralizedError>(Actions._RESOURCE_NO, (s, { payload }) => {
      merge(findByUuid(s.index, payload.uuid), payload);
      mutateSpecialStatus(payload.uuid, s.index, payload.statusBeforeError);
      return s;
    })
    .add<TaggedResource>(Actions.INIT_RESOURCE, initResourceReducer)
    .add<string>(Actions.REFRESH_RESOURCE_START, (s, a) => {
      mutateSpecialStatus(a.payload, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<GeneralizedError>(Actions.REFRESH_RESOURCE_NO, (s, { payload }) => {
      mutateSpecialStatus(payload.uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.SAVE_RESOURCE_START, (s, { payload }) => {
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<TaggedResource[]>(Actions.BATCH_INIT, (s, { payload }) => {
      return payload.reduce((state, resource) => {
        return initResourceReducer(state, {
          type: Actions.INIT_RESOURCE,
          payload: resource
        });
      }, s);
    });
