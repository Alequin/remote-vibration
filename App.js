import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { View } from "react-native";
import { AppContext } from "./app-context";
import { MainMenu } from "./src/pages/main-menu";
import * as pageNames from "./src/pages/page-names";
import { ReceiveVibrations } from "./src/pages/receive-vibrations";
import { SendVibrations } from "./src/pages/send-vibrations";
import { vibrateOnCurrentDevice } from "./src/pages/vibrate-on-current-phone";
import { AdBanner } from "./src/shared/ad-banner";
import { withBackground } from "./src/shared/background";
import { Icon } from "./src/shared/icon";
import { useAppState } from "./src/shared/use-app-state";
import { darkCyan } from "./src/utilities/colours";

const Stack = createStackNavigator();

const App = () => {
  const appState = useAppState();

  if (appState.isLoading) {
    return <View testID="initial-loading-page" />;
  }

  return <AppRouter appState={appState} />;
};

export const AppRouter = ({ appState = {} }) => (
  <AppContext.Provider value={appState}>
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={pageNames.mainMenu}
          screenOptions={{
            headerStyle: {
              backgroundColor: darkCyan,
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
          {vibrateOnCurrentDevicePage()}
          {sendVibrationsPage()}
          {receiveVibrationsPage()}
        </Stack.Navigator>
      </NavigationContainer>
      <AdBanner environment={appState.environment} />
    </View>
  </AppContext.Provider>
);

const menuPage = () => (
  <Stack.Screen
    name={pageNames.mainMenu}
    component={withBackground(MainMenu)}
  />
);

const vibrateOnCurrentDevicePage = () => (
  <Stack.Screen
    name={pageNames.vibrateOnCurrentDevice}
    component={withBackground(vibrateOnCurrentDevice)}
  />
);

const sendVibrationsPage = () => (
  <Stack.Screen
    name={pageNames.sendVibrations}
    component={withBackground(SendVibrations)}
  />
);

const receiveVibrationsPage = () => (
  <Stack.Screen
    name={pageNames.receiveVibrations}
    component={withBackground(ReceiveVibrations)}
  />
);

export default App;
