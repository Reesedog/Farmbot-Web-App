import { ResourceUpdate, TaggedSequence } from "farmbot";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  fakeTool,
  fakePlant,
  fakePoint,
  fakeSequence
} from "../../../__test_support__/fake_state/resources";
import { betterMerge } from "../../../util";
import { MarkAs } from "../mark_as";

type Args = Partial<ResourceUpdate["args"]>;

export function resourceUpdate(i: Args): ResourceUpdate {
  return {
    kind: "resource_update",
    args: {
      resource_type: "Other",
      resource_id: 1,
      label: "some_attr",
      value: "some_value",
      ...i
    }
  };
}

export const markAsResourceFixture = () => buildResourceIndex([
  betterMerge(fakeTool(), { body: { name: "T1", id: 1 } }),
  fakePlant(),
  betterMerge(fakeTool(), { body: { name: "T2", id: 2 } }),
  betterMerge(fakePoint(), { body: { name: "my point", id: 7 } }),
  betterMerge(fakeTool(), { body: { name: "T3", id: undefined } }),
]);

export function fakeMarkAsProps() {
  const steps: TaggedSequence["body"]["body"] = [
    {
      kind: "resource_update",
      args: {
        resource_type: "Device",
        resource_id: 0,
        label: "mounted_tool_id",
        value: 0
      }
    }
  ];
  const currentSequence: TaggedSequence =
    betterMerge(fakeSequence(), { body: { body: steps } });
  const props: MarkAs["props"] = {
    currentSequence,
    dispatch: jest.fn(),
    index: 0,
    currentStep: steps[0],
    resources: buildResourceIndex([currentSequence]).index,
    confirmStepDeletion: false
  };

  return props;
}
