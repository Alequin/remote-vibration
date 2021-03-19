import { last } from "lodash";
import React, { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { FlatList, StyleSheet, View, Text, Vibration } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { CheckBoxWithText } from "../shared/checkbox-with-text";
import { Icon } from "../shared/icon";
import { newVibrationPattern } from "../shared/new-vibration-pattern";

const data = [
  newVibrationPattern("Constant", [4]),
  newVibrationPattern("Pulse", [0.5, 0.5, 0.5, 0.5]),
].map((obj, index) => ({
  ...obj,
  key: index,
}));

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
          data={data}
          onStartShouldSetResponderCapture={() => true}
          keyExtractor={({ id }) => id}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              isRepeatTurnedOn={isRepeatTurnedOn}
              keyOfCurrentlyPlayingExampleVibration={
                keyOfCurrentlyPlayingExampleVibration
              }
              onPressPlay={({ key, pattern }) => {
                setKeyOfCurrentlyPlayingExampleVibration(key);
                Vibration.vibrate(pattern, true);
              }}
            />
          )}
        />
      </View>
      <CheckBoxWithText
        isActive={isRepeatTurnedOn}
        onStatusChange={setIsRepeatTurnedOn}
        size={24}
        color="white"
        containerStyle={ViewStyles.checkBoxContainer}
        textStyle={ViewStyles.checkboxText}
      >
        Repeat
      </CheckBoxWithText>
    </Background>
  );
};

const useManageExampleVibrationButtons = () => {
  const [
    keyOfCurrentlyPlayingExampleVibration,
    setKeyOfCurrentlyPlayingExampleVibration,
  ] = useState(null);
  const [exampleVibrationTimeout, setExampleVibrationTimeout] = useState(null);

  return {
    keyOfCurrentlyPlayingExampleVibration,
    setPlayingExampleVibration: useCallback(
      ({ key: exampleVibrationKey, disablingTimeout }) => {
        clearTimeout(exampleVibrationTimeout);
        setExampleVibrationTimeout(disablingTimeout);
        setKeyOfCurrentlyPlayingExampleVibration(exampleVibrationKey);
      },
      [exampleVibrationTimeout, setKeyOfCurrentlyPlayingExampleVibration]
    ),
  };
};

const ListItem = ({
  item,
  keyOfCurrentlyPlayingExampleVibration,
  onPressPlay,
  isRepeatTurnedOn,
}) => {
  const isThisItemVibrating =
    keyOfCurrentlyPlayingExampleVibration === item.key;
  const isLastButton = item.key === last(data).key;

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
    <Icon icon={icon} size={25} color={color || "white"} />
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
    maxHeight: "80%",
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
  checkBoxContainer: {
    width: "100%",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 20,
  },
  checkboxText: {
    color: "white",
    fontSize: 24,
  },
});
