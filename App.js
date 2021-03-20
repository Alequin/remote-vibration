import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { AppContext } from "./app-context";
import { MainMenu } from "./src/pages/main-menu";
import * as pageNames from "./src/pages/page-names";
import { VibrateOnCurrentPhone } from "./src/pages/vibrate-on-current-phone";
import { Icon } from "./src/shared/icon";
import { useAppState } from "./src/utilities/use-app-state";

const Stack = createStackNavigator();

const App = () => {
  const appState = useAppState();

  return (
    <AppContext.Provider value={{ appState }}>
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
    </AppContext.Provider>
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
