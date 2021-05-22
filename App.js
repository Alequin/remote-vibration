import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { memo, useMemo, useState } from "react";
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
import { useAppEnvironment } from "./src/shared/use-app-environment";
import { darkCyan } from "./src/utilities/colours";

const Stack = createStackNavigator();

const App = () => {
  const appState = useAppEnvironment();

  return appState.isLoading ? (
    <View testID="initial-loading-page" />
  ) : (
    <AppRouter appState={appState} />
  );
};

export const AppRouter = ({ appState = {} }) => {
  const [shouldShowAds, setShouldShowAds] = useState(true);

  const appContext = useMemo(
    () => ({
      ...appState,
      showAds: () => setShouldShowAds(true),
      hideAds: () => setShouldShowAds(false),
    }),
    []
  );

  return (
    <AppContext.Provider value={appContext}>
      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <AppPages />
        <AdBanner
          environment={appState.environment}
          shouldShowAds={shouldShowAds}
        />
      </View>
    </AppContext.Provider>
  );
};

const AppPages = memo(() => (
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
          <Icon icon="backArrow" size={28} color="white" />
        ),
      }}
    >
      <Stack.Screen
        name={pageNames.mainMenu}
        component={withBackground(MainMenu)}
      />
      <Stack.Screen
        name={pageNames.vibrateOnCurrentDevice}
        component={withBackground(vibrateOnCurrentDevice)}
      />
      <Stack.Screen
        key={1}
        name={pageNames.sendVibrations}
        component={withBackground(SendVibrations)}
      />
      <Stack.Screen
        name={pageNames.receiveVibrations}
        component={withBackground(ReceiveVibrations)}
      />
    </Stack.Navigator>
  </NavigationContainer>
));

export default App;
