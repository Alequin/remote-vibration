import React from "react";
import { StyleSheet, View } from "react-native";
import { gray } from "../../utilities/colours";

export const ItemSeparator = () => <View style={ViewStyles.separator} />;

const ViewStyles = StyleSheet.create({
  separator: {
    width: "100%",
    backgroundColor: gray,
    opacity: 0.5,
    height: 1.5,
  },
});
