import React, { useEffect } from "react";
import { CannotConnectErrorPage } from "../shared/cannot-connect-error-page";
import { FullPageLoading } from "../shared/full-page-loading";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useCreateRoom } from "../shared/use-create-room";
import { useWebsocketConnection } from "../shared/use-websocket-connection";
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
        buttonText="Try to Reconnect"
        onPress={() => {
          resetClient();
        }}
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

  const { client, resetClient, websocketError } = useWebsocketConnection();
  const { isConnectedToRoom, connectToRoomError, connectToRoom } =
    useConnectToRoom(client);

  useEffect(() => {
    if (password && client && !isConnectedToRoom) connectToRoom(password);
  }, [isConnectedToRoom, client, password]);

  const shouldShowErrorPage =
    createRoomError || websocketError || connectToRoomError;

  const shouldShowLoadingIndicator =
    !canHideIndicator || isStillCreatingRoom || !isConnectedToRoom;

  return {
    resetClient,
    password,
    client,
    shouldShowErrorPage: shouldShowErrorPage,
    shouldShowLoadingIndicator:
      !shouldShowErrorPage && shouldShowLoadingIndicator,
  };
};
