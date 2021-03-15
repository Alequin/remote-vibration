import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { Icon } from "./src/shared/icon";
import * as pageNames from "./src/pages/page-names";

import { MainMenu } from "./src/pages/main-menu";
import { VibrateOnCurrentPhone } from "./src/pages/vibrate-on-current-phone";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={pageNames.mainMenu}
        screenOptions={{
          headerStyle: {
            backgroundColor: "black",
          },
          headerTitleStyle: {
            color: "white",
          },
          headerBackImage: () => (
            <Icon icon="backArrow" size={32} color="white" />
          ),
        }}
      >
        {menuPage()}
        {vibrateOnCurrentPhonePage()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const menuPage = () => (
  <Stack.Screen
    options={{
      headerShown: false,
    }}
    name={pageNames.mainMenu}
    component={MainMenu}
  />
);

const vibrateOnCurrentPhonePage = () => (
  <Stack.Screen
    name={pageNames.vibrateOnCurrentPhone}
    component={VibrateOnCurrentPhone}
  />
);

export default App;
