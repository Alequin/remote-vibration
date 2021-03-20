import Slider from "@react-native-community/slider";
import { last, round } from "lodash";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, Vibration, View } from "react-native";
import { AppContext } from "../../app-context";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { Icon } from "../shared/icon";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const { appState } = useContext(AppContext);

  const [
    nameOfCurrentlyPlayingExampleVibration,
    setNameOfCurrentlyPlayingExampleVibration,
  ] = useState(null);

  const [
    hasSpeedModifierBeingPicked,
    setHasSpeedModifierBeingPicked,
  ] = useState(true);
  const {
    speedModifier,
    setSpeedModifier,
    applySpeedModifier,
  } = useSpeedModifier();

  useEffect(() => {
    if (nameOfCurrentlyPlayingExampleVibration && hasSpeedModifierBeingPicked) {
      const pattern =
        nameOfCurrentlyPlayingExampleVibration === RANDOM_PATTERN_NAME
          ? newRandomPattern()
          : patterns[nameOfCurrentlyPlayingExampleVibration];

      Vibration.vibrate(applySpeedModifier(pattern), true);
    }
  }, [speedModifier, hasSpeedModifierBeingPicked]);

  useEffect(() => () => Vibration.cancel(), [appState]);

  return (
    <Background
      style={ViewStyles.container}
      testID="vibrate-on-current-phone-page"
    >
      <PatternList
        patterns={Object.values(patterns)}
        applySpeedModifier={applySpeedModifier}
        nameOfCurrentlyPlayingExampleVibration={
          nameOfCurrentlyPlayingExampleVibration
        }
        setNameOfCurrentlyPlayingExampleVibration={
          setNameOfCurrentlyPlayingExampleVibration
        }
      />
      <Text style={ViewStyles.sliderText}>{`Speed ${speedModifier}X`}</Text>
      <Slider
        testID="speed-slider"
        style={ViewStyles.slider}
        minimumValue={0.1}
        value={speedModifier}
        maximumValue={2}
        onSlidingStart={() => setHasSpeedModifierBeingPicked(false)}
        onSlidingComplete={() => setHasSpeedModifierBeingPicked(true)}
        onValueChange={(value) => setSpeedModifier(value)}
        thumbTintColor="cyan"
        minimumTrackTintColor="white"
        maximumTrackTintColor="white"
      />
    </Background>
  );
};

const useSpeedModifier = () => {
  const [speedModifier, setSpeedModifier] = useState(1);

  const applySpeedModifier = useCallback(
    ({ pattern }) => {
      return pattern.map((time) => time * speedModifier);
    },
    [speedModifier]
  );

  return {
    speedModifier,
    setSpeedModifier: useCallback((value) => {
      setSpeedModifier(round(value, 1));
    }),
    applySpeedModifier,
  };
};

const PatternList = ({
  patterns,
  applySpeedModifier,
  nameOfCurrentlyPlayingExampleVibration,
  setNameOfCurrentlyPlayingExampleVibration,
}) => {
  return (
    <View style={ViewStyles.patternListContainer}>
      <FlatList
        data={patterns}
        onStartShouldSetResponderCapture={() => true}
        keyExtractor={({ name }) => name}
        renderItem={({ item }) => (
          <ListItem
            item={item}
            isLastButton={item.name === last(patterns).name}
            nameOfCurrentlyPlayingExampleVibration={
              nameOfCurrentlyPlayingExampleVibration
            }
            onPressPlay={(pattern) => {
              if (nameOfCurrentlyPlayingExampleVibration === pattern.name) {
                Vibration.cancel();
                setNameOfCurrentlyPlayingExampleVibration(null);
                return;
              }

              setNameOfCurrentlyPlayingExampleVibration(pattern.name);

              const patternToUse =
                pattern.name !== RANDOM_PATTERN_NAME
                  ? pattern
                  : newRandomPattern();

              Vibration.vibrate(applySpeedModifier(patternToUse), true);
            }}
          />
        )}
      />
    </View>
  );
};

const ListItem = ({
  item,
  nameOfCurrentlyPlayingExampleVibration,
  onPressPlay,
  isLastButton,
}) => {
  const isThisItemVibrating =
    nameOfCurrentlyPlayingExampleVibration === item.name;

  return (
    <View
      key={item.name}
      testID="vibration-pattern-option"
      style={isLastButton ? ViewStyles.lastItem : ViewStyles.item}
    >
      <Text style={ViewStyles.itemText}>{item.name}</Text>
      <View style={ViewStyles.itemButtonContainer}>
        <IconButton
          icon="play"
          color={isThisItemVibrating ? "cyan" : "white"}
          onPress={() => onPressPlay(item)}
        />
      </View>
    </View>
  );
};

const IconButton = ({ icon, color, onPress }) => (
  <BorderlessButton style={ViewStyles.itemButton} onPress={onPress}>
    <Icon icon={icon} size={32} color={color || "white"} />
  </BorderlessButton>
);

const baseItem = {
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "white",
  height: 75,
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: "2%",
  },
  patternListContainer: {
    width: "100%",
    maxHeight: "900%",
    borderColor: "white",
    borderRadius: borderRadius,
    borderWidth: 1,
    marginBottom: "4%",
    paddingTop: 8,
    paddingBottom: 8,
  },
  item: baseItem,
  lastItem: {
    ...baseItem,
    borderBottomWidth: 0,
  },
  itemText: {
    color: "white",
    fontSize: 18,
    paddingLeft: 40,
    width: "50%",
  },
  itemButtonContainer: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  itemButton: {
    height: "100%",
    justifyContent: "center",
    padding: 20,
  },
  sliderText: {
    color: "white",
    fontSize: 20,
    marginTop: 20,
  },
  slider: {
    marginTop: 10,
    width: "100%",
  },
});
