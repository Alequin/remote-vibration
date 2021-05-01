import React from "react";
import { useEffect } from "react/cjs/react.development";
import { CannotConnectErrorPage } from "../shared/cannot-connect-error-page";
import { FullPageLoading } from "../shared/full-page-loading";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useCreateRoom } from "../shared/use-create-room";
import { SendVibrationsInterface } from "./send-vibrations/send-vibrations-interface";
import { useHasEnoughTimePassedToHideLoadingIndicator } from "./send-vibrations/use-has-enough-time-to-hide-loading-indicator";

export const SendVibrations = ({ navigation }) => {
  const {
    resetClient,
    password,
    client,
    shouldShowErrorPage,
    shouldShowLoadingIndicator,
  } = useSendVibrations();

  if (shouldShowErrorPage)
    return (
      <CannotConnectErrorPage
        testID="send-vibrations-page"
        buttonText={"Try to Reconnect"}
        onPress={resetClient}
      />
    );

  if (shouldShowLoadingIndicator)
    return <FullPageLoading testID="send-vibrations-page" />;

  return (
    <SendVibrationsInterface
      testID="send-vibrations-page"
      password={password}
      client={client}
    />
  );
};

const useSendVibrations = () => {
  // Add in false loading time to stop screen flashing the loading spinner
  // if the connection is create really fast
  const canHideIndicator = useHasEnoughTimePassedToHideLoadingIndicator();

  const {
    password,
    isLoading: isStillCreatingRoom,
    error: createRoomError,
  } = useCreateRoom();

  const {
    client,
    resetClient,
    isConnected,
    connectToRoomError,
    websocketError,
    connectToRoom,
  } = useConnectToRoom();

  useEffect(() => {
    if (password && client) connectToRoom(password);
  }, [password, client]);

  const shouldShowErrorPage =
    createRoomError || websocketError || connectToRoomError;

  const shouldShowLoadingIndicator =
    !canHideIndicator || isStillCreatingRoom || !isConnected;

  return {
    resetClient,
    password,
    client,
    shouldShowErrorPage: shouldShowErrorPage,
    shouldShowLoadingIndicator:
      !shouldShowErrorPage && shouldShowLoadingIndicator,
  };
};
