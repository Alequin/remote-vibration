import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "DEVICE_ID_KEY";
export const deviceId = {
  save: async (id) => AsyncStorage.setItem(DEVICE_ID_KEY, id),
  read: async () => AsyncStorage.getItem(DEVICE_ID_KEY),
};

const SESSION_ID_KEY = "SESSION_ID_KEY";
export const sessionId = {
  save: async (id) => AsyncStorage.setItem(SESSION_ID_KEY, id),
  read: async () => AsyncStorage.getItem(SESSION_ID_KEY),
};

const MOST_RECENT_ROOM_KEY = "MOST_RECENT_ROOM_KEY";
export const mostRecentRoomKey = {
  save: async (key) => AsyncStorage.setItem(MOST_RECENT_ROOM_KEY, key),
  read: async () => AsyncStorage.getItem(MOST_RECENT_ROOM_KEY),
};
