import { FBToast } from "./fb_toast";
import { CreateToastOnceProps, CreateToastProps } from "./interfaces";

/**
 * The function responsible for attaching the messages to the container.
 */
export const createToast = (props: CreateToastProps) => {

  /**
   * Container element for all of the messages.
   */
  const parent = document.querySelector(".toast-container");
  /**
   * If there's no container, throw an error.
   */
  if (!parent) { throw new Error("toast-container is null."); }

  /**
   * Create elements.
   */
  const t = new FBToast(parent, props);
  t.run();
};

export const createToastOnce = (props: CreateToastOnceProps) => {
  const { message, fallbackLogger } = props;
  if (FBToast.everyMessage[message]) {
    (fallbackLogger || console.log)(message);
  } else {
    createToast(props);
    FBToast.everyMessage[message] = true;
  }
};
