import React from "react";
import { StyleSheet } from "react-native";
import { borderRadius } from "./border-radius";
import { Button } from "./button";
import { Page } from "./page";
import { StyledText } from "./styled-text";
import { useCheckInternetAccessOnMount } from "./use-check-internet-access-on-mount";

export const CannotConnectErrorPage = ({ testID, onPress, buttonText }) => {
  const hasInternetAccess = useCheckInternetAccessOnMount();

  return (
    <Page testID={testID} style={ViewStyles.container}>
      <StyledText style={ViewStyles.headerText}>Oops</StyledText>
      <StyledText style={ViewStyles.text}>
        Sorry but it looks like there was a connection issue
      </StyledText>
      <Button style={ViewStyles.button} onPress={onPress}>
        <StyledText style={ViewStyles.buttonText}>{buttonText}</StyledText>
      </Button>
      {hasInternetAccess && (
        <StyledText style={ViewStyles.text}>
          It looks like you might not be connected to the internet
        </StyledText>
      )}
    </Page>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "50%",
    padding: "5%",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 32,
    marginVertical: 10,
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    marginVertical: 10,
  },
  button: {
    width: 250,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: borderRadius,
    borderColor: "white",
  },
  buttonText: {
    fontSize: 19,
  },
});
