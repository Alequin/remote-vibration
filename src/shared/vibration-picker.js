import { round } from "lodash";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { lastUsedVibrationSpeed } from "../utilities/async-storage";
import { patterns } from "../utilities/vibration-patterns";
import { borderRadius } from "./border-radius";
import { PatternList } from "./pattern-list";
import { textShadow } from "./text-shadow-style";
import { SpeedSelector } from "./vibration-picker/speed-selector";

export const VibrationPicker = ({
  onChangeVibrationSpeed,
  onPickPattern,
  listHeight,
  activeVibrationName,
}) => {
  const {
    speedModifier,
    setSpeedModifier,
    setHasSpeedModifierBeingPicked,
  } = useSpeedModifier(onChangeVibrationSpeed);

  return (
    <>
      <PatternList
        listHeight={listHeight}
        patterns={Object.values(patterns)}
        activeVibrationName={activeVibrationName}
        onSelectItem={(pattern) => onPickPattern && onPickPattern(pattern)}
      />
      <SpeedSelector
        speedModifier={speedModifier}
        onSlidingStart={() => setHasSpeedModifierBeingPicked(false)}
        onSlidingComplete={() => setHasSpeedModifierBeingPicked(true)}
        onValueChange={(value) => setSpeedModifier(round(value, 1))}
      />
    </>
  );
};

const useSpeedModifier = (onChangeVibrationSpeed) => {
  const [speedModifier, setSpeedModifier] = useState(1);

  const [
    hasSpeedModifierBeingPicked,
    setHasSpeedModifierBeingPicked,
  ] = useState(true);

  useEffect(() => {
    if (hasSpeedModifierBeingPicked && onChangeVibrationSpeed) {
      lastUsedVibrationSpeed.save(speedModifier);
      onChangeVibrationSpeed(speedModifier);
    }
  }, [hasSpeedModifierBeingPicked, speedModifier]);

  return { speedModifier, setSpeedModifier, setHasSpeedModifierBeingPicked };
};

const ViewStyles = StyleSheet.create({
  sliderTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderText: {
    color: "white",
    fontSize: 21,
    textAlign: "center",
    flexDirection: "row",
    marginLeft: 5,
    ...textShadow,
  },
  slider: {
    marginTop: 10,
    width: "100%",
  },
  speedSelectorContainer: {
    width: "100%",
    borderRadius,
    padding: 20,
  },
});
