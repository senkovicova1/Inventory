import { LOG_USER, LOG_OFF_USER, SET_LANG } from "../constants/action-types";

const initialState = {
  user: null,
  lang: null
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
  } else if (action.type === SET_LANG) {
    return Object.assign({}, state, {
      lang: (action.payload.lang === "sk" ? 0 : 1) ,
    });
  }
  return state;
};

export default rootReducer;
