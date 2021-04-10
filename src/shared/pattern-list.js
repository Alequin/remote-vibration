import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { borderRadius } from "../shared/border-radius";
import { spaceCadet, darkSpaceCadet } from "../utilities/colours";

export const PatternList = ({
  patterns,
  onSelectItem,
  activeVibrationName,
}) => {
  return (
    <View style={ViewStyles.patternListFlexWrapper}>
      <View style={ViewStyles.patternListContainer}>
        <FlatList
          data={patterns}
          keyExtractor={({ name }) => name}
          renderItem={({ item }) => (
            <ListButton
              item={item}
              onPress={onSelectItem}
              isActiveButton={activeVibrationName === item.name}
            />
          )}
        />
      </View>
    </View>
  );
};

const ListButton = ({ item, onPress, isActiveButton }) => {
  const buttonStyle = useMemo(
    () => ({
      ...ViewStyles.listButton,
      backgroundColor: isActiveButton ? darkSpaceCadet : spaceCadet,
    }),
    [isActiveButton]
  );

  const buttonTextStyle = useMemo(
    () => ({
      ...ViewStyles.listButtonText,
      fontWeight: isActiveButton ? "bold" : "normal",
      fontSize: isActiveButton ? 24 : 20,
    }),
    [isActiveButton]
  );

  return (
    <View style={ViewStyles.listButtonWrapper}>
      <TouchableWithoutFeedback
        testID="vibration-pattern-option"
        accessibilityRole="button"
        style={buttonStyle}
        onPress={() => onPress(item)}
      >
        <Text style={buttonTextStyle}>{item.name}</Text>
      </TouchableWithoutFeedback>
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  patternListFlexWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  patternListContainer: {
    borderRadius,
    width: "100%",
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
  },
  listButtonWrapper: {
    width: "100%",
    justifyContent: "center",
    paddingBottom: 3,
    paddingHorizontal: 10,
  },
  listButton: {
    borderRadius,
    backgroundColor: spaceCadet,
    height: 60,
    justifyContent: "center",
  },
  listButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
  },
});
