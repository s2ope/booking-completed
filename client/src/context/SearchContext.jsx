import { createContext, useReducer } from "react";

const getDefaultDates = () => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1);

  return [
    {
      startDate: new Date(),
      endDate,
      key: "selection",
    },
  ];
};

const createInitialState = () => ({
  destination: "",
  dates: getDefaultDates(),
  options: {
    adult: 1,
    children: 0,
    room: 1,
  },
  filters: {
    min: undefined,
    max: undefined,
    propertyType: "",
  },
});

const INITIAL_STATE = createInitialState();

export const SearchContext = createContext(INITIAL_STATE);

const SearchReducer = (state, action) => {
  switch (action.type) {
    case "NEW_SEARCH":
      return {
        ...createInitialState(),
        ...action.payload,
        options: {
          ...createInitialState().options,
          ...(action.payload.options || {}),
        },
        filters: {
          ...createInitialState().filters,
          ...(action.payload.filters || {}),
        },
      };
    case "RESET_SEARCH":
      return createInitialState();
    default:
      return state;
  }
};

export const SearchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SearchReducer, INITIAL_STATE);

  return (
    <SearchContext.Provider
      value={{
        city: state.destination,
        destination: state.destination,
        dates: state.dates,
        options: state.options,
        filters: state.filters,
        dispatch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
