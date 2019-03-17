import { LOG_USER, LOG_OFF_USER } from "../constants/action-types";

const initialState = {
  user: null,
};

function rootReducer(state = initialState, action) {
  if (action.type === LOG_USER) {
    return Object.assign({}, state, {
      user: action.payload.user,
    });
  } else if (action.type === LOG_OFF_USER) {
    return Object.assign({}, state, {
      user: action.payload,
    });
  }
  return state;
};

export default rootReducer;
