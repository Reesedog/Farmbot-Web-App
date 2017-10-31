import { t } from "i18next";
import { error } from "farmbot-toastr";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";
import * as _ from "lodash";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { Content } from "./constants";
import { dispatchNetworkUp, dispatchNetworkDown } from "./connectivity/index";
import { box } from "boxed_value";
import { UnsafeError } from "./interfaces";
import { store } from "./redux/store";

/** The input of an axios error interceptor is an "any" type.
 * Sometimes it will be a real Axios error, other times it will not be.
 */
export interface SafeError {
  response: {
    status: number;
  };
}

/** Prevents hard-to-find NPEs and type errors inside of interceptors. */
export function isSafeError(x: SafeError | UnsafeError): x is SafeError {
  return !!(
    (box(x).kind === "object") &&
    (box(x.response).kind === "object") &&
    (box(x.response.status).kind === "number"));
}

export function responseFulfilled(input: AxiosResponse): AxiosResponse {
  dispatchNetworkUp("user.api");
  return input;
}

export function responseRejected(x: SafeError | undefined) {
  if (x && isSafeError(x)) {
    dispatchNetworkUp("user.api");
    const a = ![451, 401, 422].includes(x.response.status);
    const b = x.response.status > 399;
    // Openfarm API was sending too many 404's.
    const c = !_.get(x, "response.config.url", "").includes("openfarm.cc/");

    if (a && b && c) {
      setTimeout(() => {
        // Explicitly throw error so error reporting tool will save it.
        const msg = `Bad response: ${x.response.status} ${JSON.stringify(x.response)}`;
        throw new Error(msg);
      }, 1);
    }
    switch (x.response.status) {
      case 404:
        // Log 404's, but don't generate any noise for the user.
        break;
      case 500:
        error(t("Unexpected error occurred, we've been notified of the problem."));
        break;
      case 451:
        // DONT REFACTOR: I want to use alert() because it's blocking.
        alert(t(Content.TOS_UPDATE));
        window.location.href = "/tos_update";
        break;
    }
    return Promise.reject(x);
  } else {
    dispatchNetworkDown("user.api");
    return Promise.reject(x);
  }
}

export function requestFulfilled(auth: AuthState) {
  return (config: AxiosRequestConfig) => {
    const req = config.url || "";
    const isAPIRequest = req.includes(API.current.baseUrl);
    if (isAPIRequest) {
      config.headers = config.headers || {};
      const headers: { Authorization: string | undefined } = (config.headers);
      const authn = store.getState().auth;
      headers.Authorization = authn ? authn.token.encoded : "CANT_FIND_TOKEN";
    }
    return config;
  };
}
