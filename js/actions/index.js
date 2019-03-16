import { LOG_USER, LOG_OFF_USER } from "../constants/action-types";

export function logUser(payload) {
  return { type: LOG_USER, payload }
};

export function logOffUser(payload) {
  return { type: LOG_OFF_USER, payload }
};
