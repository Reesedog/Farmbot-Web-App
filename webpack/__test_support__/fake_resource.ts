import {
  Resource as Res,
  ResourceName as Name,
  TaggedResource
} from "../resources/tagged_resources";
import { generateUuid } from "../resources/util";

let ID_COUNTER = 0;

// tslint:disable-next-line:max-line-length
export function fakeResource<T extends Name,
  U extends TaggedResource["body"]>(kind: T, body: U): Res<T, U> {
  return {
    status: undefined,
    kind,
    uuid: generateUuid(ID_COUNTER++, kind),
    body
  };
}
