import { last } from "lodash";
import React, { useState } from "react";
import { useCallback } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { Icon } from "../shared/icon";
import { newVibrationPattern } from "../shared/new-vibration-pattern";
import { vibrate } from "../shared/vibrate";

const data = [
  newVibrationPattern("Constant", [4]),
  newVibrationPattern("Pulse", [0.5, 0.5, 0.5, 0.5]),
].map((obj, index) => ({
  ...obj,
  key: index,
}));

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const {
    keyOfCurrentlyPlayingExampleVibration,
    setPlayingExampleVibration,
  } = useManageExampleVibrationButtons();

  return (
    <Background
      style={ViewStyles.container}
      testID="vibrate-on-current-phone-page"
    >
      <View style={ViewStyles.patternListContainer}>
        <FlatList
          data={data}
          onStartShouldSetResponderCapture={() => true}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              keyOfCurrentlyPlayingExampleVibration={
                keyOfCurrentlyPlayingExampleVibration
              }
              setPlayingExampleVibration={setPlayingExampleVibration}
            />
          )}
        />
      </View>
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
  setPlayingExampleVibration,
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
          onPress={() => {
            vibrate.stop();

            setPlayingExampleVibration({
              key: item.key,
              disablingTimeout: setTimeout(
                () =>
                  setPlayingExampleVibration({
                    key: null,
                    disablingTimeout: null,
                  }),
                item.runTime
              ),
            });
            vibrate.start(item.pattern);
          }}
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
});
