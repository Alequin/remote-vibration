import { last } from "lodash";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { Icon } from "../shared/icon";
import { copperRose, cyan, darkCyan, spaceCadet } from "../utilities/colours";
import { SerifText } from "./serif-text";

export const PatternList = ({
  patterns,
  listHeight,
  onSelectItem,
  activeVibrationName,
}) => {
  const containerStyle = useMemo(
    () =>
      !listHeight
        ? ViewStyles.patternListContainer
        : {
            ...ViewStyles.patternListContainer,
            maxHeight: listHeight,
          },
    [listHeight]
  );

  return (
    <View style={ViewStyles.patternListFlexWrapper}>
      <View style={containerStyle}>
        <FlatList
          data={patterns}
          keyExtractor={({ name }) => name}
          renderItem={({ item }) => (
            <ListPatternOption
              item={item}
              isLastButton={item.name === last(patterns).name}
              isThisPatternInUse={activeVibrationName === item.name}
              onPressPlay={(pattern) => {
                onSelectItem(pattern);
              }}
            />
          )}
        />
      </View>
    </View>
  );
};

const ListPatternOption = ({
  item,
  onPressPlay,
  isLastButton,
  isThisPatternInUse,
}) => {
  return (
    <View
      key={item.name}
      testID="vibration-pattern-option"
      style={isLastButton ? ViewStyles.lastItem : ViewStyles.item}
    >
      <SerifText style={ViewStyles.itemText}>{item.name}</SerifText>
      <View style={ViewStyles.itemButtonContainer}>
        <IconButton
          icon="play"
          color={isThisPatternInUse ? cyan : "white"}
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
  height: 75,
};

const ViewStyles = StyleSheet.create({
  patternListFlexWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  patternListContainer: {
    borderRadius,
    width: "100%",
    backgroundColor: spaceCadet,
    marginBottom: "4%",
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
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
