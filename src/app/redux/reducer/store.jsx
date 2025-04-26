export const initialState = {
  selectedLocation: null,
  locations: [],
  dates: [],
  guestCounts: {
    adults: 0,
    children: 0,
    infants: 0,
  },
  openDate: false,
  guestOpen: false,
};

export function headerReducer(state, action) {
  switch (action.type) {
    case "SET_LOCATION":
      return { ...state, selectedLocation: action.payload };
    case "SET_DATES":
      return { ...state, dates: action.payload };
    case "TOGGLE_DATE":
      return { ...state, openDate: !state.openDate };
    case "TOGGLE_GUEST":
      return { ...state, guestOpen: !state.guestOpen };
    case "SET_LOCATIONS":
      return { ...state, locations: action.payload };
    case "SET_GUEST_COUNT":
      return {
        ...state,
        guestCounts: {
          ...state.guestCounts,
          [action.payload.type]: Math.max(
            0,
            state.guestCounts[action.payload.type] + action.payload.delta
          ),
        },
      };
    default:
      return state;
  }
}
