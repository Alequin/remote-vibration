import { chunk } from "lodash";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { borderRadius } from "../shared/border-radius";
import { isSmallScreen } from "../utilities/is-small-screen";
import { HighlightButton } from "./highlight-button";
import { StyledText } from "./styled-text";

const windowWidth = Dimensions.get("window").width;

export const PatternList = ({
  patterns,
  onSelectItem,
  activeVibrationName,
}) => {
  const patternRows = chunk(patterns, isSmallScreen() ? 3 : 4);

  return (
    <ScrollView style={{ width: "100%", flex: 1 }}>
      <View style={ViewStyles.patternListFlexWrapper}>
        {patternRows.map((patternRow) => {
          const rowKey = patternRow.map(({ name }) => name).join();
          return (
            <View
              key={rowKey}
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                width: "90%",
                marginVertical: "2%",
              }}
            >
              <ButtonRow
                onSelectItem={onSelectItem}
                patternRow={patternRow}
                activeVibrationName={activeVibrationName}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const ButtonRow = ({ patternRow, activeVibrationName, onSelectItem }) => {
  return patternRow.map((pattern) => {
    const patternName = pattern.name;
    const isButtonActive = activeVibrationName === patternName;

    return (
      <PatternButton
        key={patternName}
        name={patternName}
        emoji={pattern.emoji}
        onPress={() => onSelectItem(pattern)}
        isButtonActive={isButtonActive}
      />
    );
  });
};

const PatternButton = ({ name, emoji, isButtonActive, onPress }) => {
  return (
    <HighlightButton
      testID="vibration-pattern-option"
      isActive={isButtonActive}
      style={{
        height: windowWidth * (isSmallScreen() ? 0.25 : 0.2),
        width: windowWidth * (isSmallScreen() ? 0.25 : 0.2),
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
      }}
      onPress={onPress}
    >
      <StyledText
        style={{
          fontSize: isSmallScreen() ? 30 : 30,
          textAlign: "center",
        }}
      >
        {emoji}
      </StyledText>
      <StyledText
        style={{
          marginTop: 5,
          fontSize: 10,
          textAlign: "center",
          color: "white",
        }}
      >
        {name}
      </StyledText>
    </HighlightButton>
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
    flex: 1,
  },
});
