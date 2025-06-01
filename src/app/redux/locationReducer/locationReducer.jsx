export const initialLocationState = {
  locations: [],
  loading: false,
};

export const locationReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOCATIONS":
      return { ...state, locations: action.payload };
    case "SET_LOADING":
      return { ...state, loading: true };
    case "CLEAR_LOADING":
      return { ...state, loading: false };
    default:
      return state;
  }
};
