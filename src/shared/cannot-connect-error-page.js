import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Background } from "./background";
import { Button, ButtonText } from "./button";
import { useCheckInternetAccessOnMount } from "./use-check-internet-access-on-mount";

export const CannotConnectErrorPage = ({ testID, onPress }) => {
  const hasInternetAccess = useCheckInternetAccessOnMount();

  return (
    <Background testID={testID}>
      <View style={ViewStyles.container}>
        <Text style={ViewStyles.headerText}>Oops</Text>
        <Text style={ViewStyles.text}>
          Sorry but it looks like there was a connection issue. Return to the
          menu and try again
        </Text>
        <Button style={ViewStyles.button} onPress={onPress}>
          <ButtonText style={ViewStyles.buttonText}>Return to Menu</ButtonText>
        </Button>
        {hasInternetAccess && (
          <Text style={ViewStyles.text}>
            It looks like you might not be connected to the internet
          </Text>
        )}
      </View>
    </Background>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "50%",
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
    width: "100%",
    padding: 10,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
  },
});
