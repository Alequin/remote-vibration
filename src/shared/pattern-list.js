import { chunk } from "lodash";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { borderRadius } from "../shared/border-radius";
import {
  islargeScreenWidth,
  isSmallScreenWidth,
} from "../utilities/is-small-screen";
import { HighlightButton } from "./highlight-button";
import { StyledText } from "./styled-text";

const windowWidth = Dimensions.get("window").width;

export const PatternList = ({
  patterns,
  onSelectItem,
  activeVibrationName,
}) => {
  const patternRows = chunk(patterns, isSmallScreenWidth() ? 3 : 4);

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
  const isSmallScreen = isSmallScreenWidth();
  const buttonSize = useMemo(
    () => windowWidth * (isSmallScreen ? 0.25 : 0.21),
    [windowWidth, isSmallScreen]
  );

  return (
    <HighlightButton
      testID="vibration-pattern-option"
      isActive={isButtonActive}
      style={{
        height: buttonSize,
        width: buttonSize,
        borderRadius: 20,
        justifyContent: "space-around",
        alignItems: "center",
        padding: 5,
      }}
      onPress={onPress}
    >
      <ButtonItemWrapper>
        <StyledText
          style={{
            fontSize: islargeScreenWidth() ? 32 : 25,
            textAlign: "center",
          }}
        >
          {emoji}
        </StyledText>
      </ButtonItemWrapper>
      <ButtonItemWrapper>
        <StyledText
          style={{
            fontSize: islargeScreenWidth() ? 13 : 10,
            textAlign: "center",
            color: "white",
            paddingHorizontal: 4,
          }}
        >
          {name}
        </StyledText>
      </ButtonItemWrapper>
    </HighlightButton>
  );
};

const ButtonItemWrapper = (props) => (
  <View
    style={{
      flex: 4,
      justifyContent: "center",
    }}
    {...props}
  />
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
