import { store } from "../redux/store";
import { getWebAppConfig } from "../resources/selectors";
import { BooleanConfigKey } from "../config_storage/web_app_configs";
import { edit, save } from "../api/crud";

/**
 * HISTORICAL CONTEXT: We once stored user settings (like map zoom level) in localStorage and
 *    would retrieve values via `Session.getBool("zoom_level")`
 *
 * PROBLEM: localStorage is no longer used. Many parts of the were accessing
 *          values in places that did not have access to the Redux store.
 *
 * SOLUTION: Create a temporary shim that will "cheat" and directly call Redux
 *           store without a lot of boilerplate props passing.
 *
 * WHY NOT JUST INLINE THESE FUNCTIONS?: It's easier to stub out calls in tests
 *                                       that already exist.
 */

/** Avoid using this function in new places. Pass props instead. */
export function getBoolViaRedux(key: BooleanConfigKey): boolean | undefined {
  const conf = getWebAppConfig(store.getState().resources.index);
  return conf && conf.body[key];
}

/** Avoid using this function in new places. Pass props instead. */
export function setBoolViaRedux(key: BooleanConfigKey, val: boolean) {
  const conf = getWebAppConfig(store.getState().resources.index);
  if (conf) {
    store.dispatch(edit(conf, { [key]: val }));
    store.dispatch(save(conf.uuid));
  } else {
    console.log("Be concerned.");
    debugger;
  }
  return val;
}
