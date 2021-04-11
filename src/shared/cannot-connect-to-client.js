import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Background } from "./background";
import { Button, ButtonText } from "./button";

export const CannotConnectToClient = ({ testID, onPress }) => (
  <Background testID={testID}>
    <View style={ViewStyles.container}>
      <Text style={ViewStyles.headerText}>Oops</Text>
      <Text style={ViewStyles.text}>
        Sorry but it looks like there was a connection issue. Return to the menu
        and try again
      </Text>
      <Button style={ViewStyles.button} onPress={onPress}>
        <ButtonText style={ViewStyles.buttonText}>Return to Menu</ButtonText>
      </Button>
    </View>
  </Background>
);

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
