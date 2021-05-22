import { useNavigation } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { AppContext } from "../../app-context";
import { darkSpaceCadet } from "../utilities/colours";
import { dynamicFontSize } from "../utilities/dynamic-font-size";
import { Icon } from "./icon";
import { StyledText } from "./styled-text";

const dots = new Array(5).fill();

export const LockScreen = ({ onUnlock }) => {
  const { showAds, hideAds } = useContext(AppContext);
  useDisableBackHandler();
  useHideNavigationHeader();
  const [activeDotCount, setActiveDotCount] = useState(0);
  const shouldUnlock = activeDotCount >= dots.length;

  useEffect(() => {
    hideAds();
    return () => showAds();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (shouldUnlock) onUnlock();
      if (!shouldUnlock && activeDotCount > 0)
        setActiveDotCount(activeDotCount - 1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [activeDotCount, shouldUnlock]);

  return (
    <TouchableWithoutFeedback
      testID="lock-screen"
      style={ViewStyles.fullScreenButton}
      onPress={() => setActiveDotCount(activeDotCount + 1)}
    >
      <>
        <StyledText style={ViewStyles.header}>Lock Screen</StyledText>
        <View style={ViewStyles.lockIconsContainer}>
          <Icon
            icon={shouldUnlock ? "unlocked" : "locked"}
            color="white"
            size={dynamicFontSize(120)}
          />
          <View style={ViewStyles.dotContainer}>
            {dots.map((_, dotNumber) => (
              <Dot key={dotNumber} isActive={activeDotCount > dotNumber} />
            ))}
          </View>
        </View>
        <StyledText style={ViewStyles.informationText}>
          {`Press the screen\nto unlock`}
        </StyledText>
      </>
    </TouchableWithoutFeedback>
  );
};

const useDisableBackHandler = () =>
  useEffect(() => {
    const disableBackEvents = () => true;
    BackHandler.addEventListener("hardwareBackPress", disableBackEvents);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", disableBackEvents);
  }, []);

const useHideNavigationHeader = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    return () =>
      navigation.setOptions({
        headerShown: true,
      });
  }, []);
};

const Dot = ({ isActive }) => {
  return (
    <View
      testID={isActive ? "active-lock-dot" : "lock-dot"}
      style={isActive ? ViewStyles.activeDot : ViewStyles.dot}
    ></View>
  );
};

const ViewStyles = StyleSheet.create({
  fullScreenButton: {
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  header: {
    fontSize: dynamicFontSize(38),
  },
  informationText: {
    fontSize: dynamicFontSize(24),
    textAlign: "center",
  },
  lockIconsContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    maxWidth: "50%",
    width: 500,
  },
  dot: {
    backgroundColor: "white",
    borderRadius: 10000,
    width: 15,
    height: 15,
  },
  activeDot: {
    backgroundColor: "white",
    borderRadius: 10000,
    width: 15,
    height: 15,
    backgroundColor: darkSpaceCadet,
  },
});
