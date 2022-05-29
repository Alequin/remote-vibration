import { noop } from "lodash";
import React from "react";
import { spaceCadet, transparency, white } from "../utilities/colours";
import { Button } from "./button";

export const HighlightButton = ({ style = {}, isActive, ...otherProps }) => {
  return (
    <Button
      style={[
        {
          backgroundColor: isActive
            ? transparency(white, "90")
            : transparency(white, "30"),
          borderColor: spaceCadet,
          borderWidth: 1,
        },
        style,
      ]}
      {...otherProps}
    />
  );
};
