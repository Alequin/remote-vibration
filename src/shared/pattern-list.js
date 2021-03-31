import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { borderRadius } from "../shared/border-radius";
import { BorderlessButton } from "../shared/borderless-button";
import { Icon } from "../shared/icon";
import { cyan, spaceCadet } from "../utilities/colours";
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

const ListPatternOption = ({ item, onPressPlay, isThisPatternInUse }) => {
  const baseColour = isThisPatternInUse ? cyan : "white";

  const textStyle = useMemo(() => {
    return {
      ...ViewStyles.itemText,
      color: baseColour,
    };
  }, [baseColour]);

  return (
    <TouchableWithoutFeedback
      testID="vibration-pattern-option"
      onPress={() => onPressPlay(item)}
      accessibilityRole="button"
    >
      <View key={item.name} style={ViewStyles.item}>
        <SerifText style={textStyle}>{item.name}</SerifText>
      </View>
    </TouchableWithoutFeedback>
  );
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    height: 75,
    width: "100%",
  },
  itemText: {
    color: "white",
    fontSize: 18,
    width: "100%",
    textAlign: "center",
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
