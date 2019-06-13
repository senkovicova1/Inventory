import { LOG_USER, LOG_OFF_USER, SET_LANG } from "../constants/action-types";

export function logUser(payload) {
  return { type: LOG_USER, payload }
};

export function setLang(payload) {
  return { type: SET_LANG, payload }
};

export function logOffUser(payload) {
  return { type: LOG_OFF_USER, payload }
};
