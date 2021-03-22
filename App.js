import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { AppContext } from "./app-context";
import { ConnectToAnotherDevice } from "./src/pages/connect-to-another-device";
import { createAConnection } from "./src/pages/create-a-connection";
import { MainMenu } from "./src/pages/main-menu";
import * as pageNames from "./src/pages/page-names";
import { VibrateOnCurrentPhone } from "./src/pages/vibrate-on-current-phone";
import { Icon } from "./src/shared/icon";
import { useAppState } from "./src/utilities/use-app-state";
import * as asyncStorage from "./src/utilities/async-storage";
import { newDeviceKey } from "./src/utilities/new-device-key";
import { Background } from "./src/shared/background";

const Stack = createStackNavigator();

const App = () => {
  const appState = useAppState();

  if (appState.isLoading) {
    return <Background testID="initial-loading-page" />;
  }

  return <AppRouter appState={appState} />;
};

export const AppRouter = ({ appState }) => (
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
        {connectToAnotherDevicePage()}
        {createAConnectionPage()}
      </Stack.Navigator>
    </NavigationContainer>
  </AppContext.Provider>
);

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

const connectToAnotherDevicePage = () => (
  <Stack.Screen
    name={pageNames.connectToAnotherDevice}
    component={ConnectToAnotherDevice}
  />
);

const createAConnectionPage = () => (
  <Stack.Screen
    name={pageNames.createAConnection}
    component={createAConnection}
  />
);

export default App;
