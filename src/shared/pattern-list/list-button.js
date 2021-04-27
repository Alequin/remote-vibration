import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";
import { isSmallScreen } from "../../utilities/is-small-screen";
import { borderRadius } from "../border-radius";
import { Icon } from "../icon";
import { textShadow } from "../text-shadow-style";

export const ListButton = ({ item, onPress, isActiveButton }) => {
  const buttonTextStyle = useMemo(
    () => ({
      ...ViewStyles.listButtonText,
      fontWeight: isActiveButton ? "bold" : "normal",
      fontSize: dynamicFontSize(isActiveButton ? 20 : 19),
    }),
    [isActiveButton]
  );

  return (
    <View style={ViewStyles.listButtonWrapper}>
      <TouchableWithoutFeedback
        testID="vibration-pattern-option"
        accessibilityRole="button"
        style={ViewStyles.listButton}
        onPress={() => onPress(item)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Icon icon="play" color="white" size={dynamicFontSize(22)} />
          <Text style={buttonTextStyle}>{item.name}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {isActiveButton && (
            <Icon icon="vibrate" color="white" size={dynamicFontSize(22)} />
          )}
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
    padding: isSmallScreen() ? "1.5%" : "4%",
    justifyContent: "center",
    paddingHorizontal: "5%",
  },
  listButtonText: {
    color: "white",
    textAlign: "center",
    paddingLeft: "5%",
    ...textShadow,
  },
});
