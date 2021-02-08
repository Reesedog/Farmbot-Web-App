import React from "react";
import { DirectionButton } from "./direction_button";
import { JogMovementControlsProps } from "./interfaces";
import { buildDirectionProps } from "./direction_axes_props";
import { TakePhotoButton } from "./take_photo_button";
import { HomeButton } from "./home_button";
import { BooleanSetting } from "../../session_keys";
const DEFAULT_STEP_SIZE = 100;

/*
 *        photo   |   ^   | ^
 * home find_home | < v > | v
 */

export function JogButtons(props: JogMovementControlsProps) {
  const { stepSize, disabled, getConfigValue } = props;
  const directionAxesProps = buildDirectionProps(props);
  const xySwap = !!getConfigValue(BooleanSetting.xy_swap);
  const rightLeft = xySwap ? "y" : "x";
  const upDown = xySwap ? "x" : "y";
  const commonProps = {
    steps: stepSize || DEFAULT_STEP_SIZE,
    disabled,
  };
  return <table className="jog-table">
    <tbody>
      <tr>
        <td />
        <td>
          <TakePhotoButton env={props.env} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis="z"
            direction="up"
            directionAxisProps={directionAxesProps.z} />
        </td>
      </tr>
      <tr>
        <td>
          <HomeButton doFindHome={false} disabled={disabled} />
        </td>
        <td>
          <HomeButton doFindHome={true} disabled={disabled} />
        </td>
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]} />
        </td>
        <td>
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]} />
        </td>
        <td>
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]} />
        </td>
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis="z"
            direction="down"
            directionAxisProps={directionAxesProps.z} />
        </td>
      </tr>
      <tr>
        <td />
      </tr>
    </tbody>
  </table>;
}
