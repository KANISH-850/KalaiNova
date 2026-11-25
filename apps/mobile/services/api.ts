import axios from "axios";
import { Platform } from "react-native";

const DEFAULT_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:8000/api/v1" : "http://localhost:8000/api/v1";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE;
export const SERVER_ROOT = API_URL.replace(/\/api\/v1$/, "");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
