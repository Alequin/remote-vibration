import { last } from "lodash";
import React, { useState } from "react";
import { useEffect } from "react";
import { FlatList, StyleSheet, View, Text, Vibration } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { CheckBoxWithText } from "../shared/checkbox-with-text";
import { Icon } from "../shared/icon";
import {
  patterns,
  newRandomPattern,
  RANDOM_PATTERN_NAME,
} from "../shared/vibration-patterns";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const [
    keyOfCurrentlyPlayingExampleVibration,
    setKeyOfCurrentlyPlayingExampleVibration,
  ] = useState(null);

  const [isRepeatTurnedOn, setIsRepeatTurnedOn] = useState(false);

  useEffect(() => {
    return () => Vibration.cancel();
  }, []);

  return (
    <Background
      style={ViewStyles.container}
      testID="vibrate-on-current-phone-page"
    >
      <View style={ViewStyles.patternListContainer}>
        <FlatList
          data={patterns}
          onStartShouldSetResponderCapture={() => true}
          keyExtractor={({ key }) => key}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              isLastButton={item.key === last(patterns).key}
              keyOfCurrentlyPlayingExampleVibration={
                keyOfCurrentlyPlayingExampleVibration
              }
              onPressPlay={({ key, name, pattern }) => {
                if (keyOfCurrentlyPlayingExampleVibration === key) {
                  Vibration.cancel();
                  setKeyOfCurrentlyPlayingExampleVibration(null);
                  return;
                }

                setKeyOfCurrentlyPlayingExampleVibration(key);

                const patternToUse =
                  name !== RANDOM_PATTERN_NAME
                    ? pattern
                    : newRandomPattern().pattern;

                Vibration.vibrate(patternToUse, true);
              }}
            />
          )}
        />
      </View>
    </Background>
  );
};

const ListItem = ({
  item,
  keyOfCurrentlyPlayingExampleVibration,
  onPressPlay,
  isLastButton,
}) => {
  const isThisItemVibrating =
    keyOfCurrentlyPlayingExampleVibration === item.key;

  return (
    <View
      key={item.key}
      testID="vibration-pattern-option"
      style={isLastButton ? ViewStyles.lastItem : ViewStyles.item}
    >
      <Text style={ViewStyles.itemText}>{item.name}</Text>
      <View style={ViewStyles.itemButtonContainer}>
        <IconButton
          icon="play"
          color={isThisItemVibrating ? "green" : "white"}
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
    maxHeight: "100%",
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
});
