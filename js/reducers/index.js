import { LOG_USER, LOG_OFF_USER } from "../constants/action-types";

const initialState = {
  user: null,
  withFB: false,
};

function rootReducer(state = initialState, action) {
  if (action.type === LOG_USER) {
    return Object.assign({}, state, {
      user: action.payload.user,
      withFB: action.payload.withFB,
    });
  } else if (action.type === LOG_OFF_USER) {
    return Object.assign({}, state, {
      user: action.payload,
      withFB: false,
    });
  }
  return state;
};

export default rootReducer;
