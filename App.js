import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { MainMenu } from "./src/main-menu";
import { VibrateOnCurrentPhone } from "./src/vibrate-on-current-phone";
import { Icon } from "./src/shared/icon";
import * as pages from "./src/shared/pages";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={pages.mainMenu}
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
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name={pages.mainMenu}
          component={MainMenu}
        />
        <Stack.Screen
          name={pages.localVibration}
          component={VibrateOnCurrentPhone}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
