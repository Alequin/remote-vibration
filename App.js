import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { View } from "react-native";
import { AppContext } from "./app-context";
import { MainMenu } from "./src/pages/main-menu";
import * as pageNames from "./src/pages/page-names";
import { ReceiveVibrations } from "./src/pages/receive-vibrations";
import { SendVibrations } from "./src/pages/send-vibrations";
import { VibrateOnCurrentPhone } from "./src/pages/vibrate-on-current-phone";
import { Background } from "./src/shared/background";
import { Icon } from "./src/shared/icon";
import { useAppState } from "./src/shared/use-app-state";
import { spaceCadet } from "./src/utilities/colours";

const Stack = createStackNavigator();

const App = () => {
  const appState = useAppState();

  if (appState.isLoading) {
    return <Background testID="initial-loading-page" />;
  }

  return <AppRouter appState={appState} />;
};

export const AppRouter = ({ appState }) => (
  <Background>
    <AppContext.Provider value={{ ...appState }}>
      <View style={{ width: "100%", height: "100%" }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={pageNames.mainMenu}
            screenOptions={{
              headerStyle: {
                backgroundColor: spaceCadet,
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
            {sendVibrationsPage()}
            {receiveVibrationsPage()}
          </Stack.Navigator>
        </NavigationContainer>
        {/* <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
        servePersonalizedAds // true or false
        onDidFailToReceiveAdWithError={this.bannerError}
      /> */}
      </View>
    </AppContext.Provider>
  </Background>
);

const menuPage = () => (
  <Stack.Screen name={pageNames.mainMenu} component={MainMenu} />
);

const vibrateOnCurrentPhonePage = () => (
  <Stack.Screen
    name={pageNames.vibrateOnCurrentPhone}
    component={VibrateOnCurrentPhone}
  />
);

const sendVibrationsPage = () => (
  <Stack.Screen name={pageNames.sendVibrations} component={SendVibrations} />
);

const receiveVibrationsPage = () => (
  <Stack.Screen
    name={pageNames.receiveVibrations}
    component={ReceiveVibrations}
  />
);

export default App;
