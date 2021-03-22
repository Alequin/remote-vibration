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
