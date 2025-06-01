export const initialDashboardState = {
  users: [],
  rooms: [],
  bookings: [],
  loading: true,
};

export const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true };
    case "SET_DATA":
      return {
        ...state,
        users: action.payload.users || [], 
        rooms: action.payload.rooms || [], 
        bookings: action.payload.bookings || [], 
        loading: false,
      };
    default:
      return state;
  }
};
