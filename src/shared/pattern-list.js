import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { borderRadius } from "../shared/border-radius";
import { gray } from "../utilities/colours";
import { ListButton } from "./pattern-list/list-button";
import { ItemSeparator } from "./pattern-list/list-separator";

export const PatternList = ({
  patterns,
  onSelectItem,
  activeVibrationName,
}) => (
  <View style={ViewStyles.patternListFlexWrapper}>
    <View style={ViewStyles.patternListContainer}>
      <FlatList
        data={patterns}
        ItemSeparatorComponent={ItemSeparator}
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
    flex: 1,
  },
});
