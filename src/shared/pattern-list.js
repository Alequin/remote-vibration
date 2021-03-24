import { last } from "lodash";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { Icon } from "../shared/icon";

export const PatternList = ({
  patterns,
  listHeight,
  onSelectItem,
  nameOfCurrentlyPlayingExampleVibration,
}) => {
  const containerStyle = useMemo(() => {
    if (!listHeight) return ViewStyles.patternListContainer;

    return {
      ...ViewStyles.patternListContainer,
      height: listHeight,
    };
  }, [listHeight]);

  return (
    <View style={containerStyle}>
      <FlatList
        data={patterns}
        keyExtractor={({ name }) => name}
        renderItem={({ item }) => (
          <ListPatternOption
            item={item}
            isLastButton={item.name === last(patterns).name}
            isThisPatternInUse={
              nameOfCurrentlyPlayingExampleVibration === item.name
            }
            onPressPlay={(pattern) => {
              onSelectItem(pattern);
            }}
          />
        )}
      />
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
      <Text style={ViewStyles.itemText}>{item.name}</Text>
      <View style={ViewStyles.itemButtonContainer}>
        <IconButton
          icon="play"
          color={isThisPatternInUse ? "cyan" : "white"}
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
  patternListContainer: {
    borderRadius,
    width: "100%",
    maxHeight: "900%",
    borderColor: "white",
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
