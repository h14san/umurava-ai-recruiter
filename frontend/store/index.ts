import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobsReducer from "./slices/jobsSlice";
import applicantsReducer from "./slices/applicantsSlice";
import screeningReducer from "./slices/screeningSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobsReducer,
      applicants: applicantsReducer,
      screening: screeningReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
