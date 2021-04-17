import AsyncStorage from "@react-native-async-storage/async-storage";

const newStorageItem = (storageKey) => ({
  save: async (valueToSave) => {
    AsyncStorage.setItem(storageKey, JSON.stringify(valueToSave));
  },
  read: async () => {
    const item = await AsyncStorage.getItem(storageKey);
    return item ? JSON.parse(item) : null;
  },
  clear: async () => AsyncStorage.removeItem(storageKey),
});

export const deviceId = newStorageItem("DEVICE_ID_KEY");

export const sessionId = newStorageItem("SESSION_ID_KEY");

export const mostRecentRoomKey = newStorageItem("MOST_RECENT_ROOM_KEY");

export const lastActiveVibrationPattern = newStorageItem(
  "LAST_ACTIVE_LOCAL_VIBRATION"
);

export const lastUsedVibrationSpeed = newStorageItem(
  "LAST_USED_VIBRATION_SPEED"
);
