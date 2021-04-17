import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { darkSpaceCadet, spaceCadet } from "../../utilities/colours";
import { borderRadius } from "../border-radius";
import { Icon } from "../icon";

export const ListButton = ({ item, onPress, isActiveButton }) => {
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
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Icon icon="play" color="white" size={24} />
          <Text style={buttonTextStyle}>{item.name}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {isActiveButton && <Icon icon="vibrate" color="white" size={24} />}
        </View>
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
    borderRadius: borderRadius,
    width: "100%",
    flex: 1,
  },
  listButtonWrapper: {
    width: "100%",
    justifyContent: "center",
  },
  listButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: spaceCadet,
    height: 60,
    justifyContent: "center",
    paddingHorizontal: "5%",
  },
  listButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    paddingLeft: "5%",
  },
});
