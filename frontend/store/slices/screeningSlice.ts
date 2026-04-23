import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getResultsApi, runScreeningApi, ApiError } from "@/lib/api";
import type { ScreeningResult, ShortlistSize } from "@/types";

export type ScreeningStep =
  | "idle"
  | "loading_job"
  | "calling_gemini"
  | "parsing"
  | "saving"
  | "done";

interface ScreeningState {
  resultsByJobId: Record<string, ScreeningResult | null>;
  status: "idle" | "running" | "done" | "error";
  step: ScreeningStep;
  error: string | null;
}

const initialState: ScreeningState = {
  resultsByJobId: {},
  status: "idle",
  step: "idle",
  error: null,
};

export const runScreening = createAsyncThunk<
  { jobId: string; result: ScreeningResult },
  { jobId: string; shortlistSize: ShortlistSize },
  { rejectValue: string }
>("screening/run", async ({ jobId, shortlistSize }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setStep("loading_job"));
    // brief visual delay so users see the first step
    await new Promise((r) => setTimeout(r, 250));
    dispatch(setStep("calling_gemini"));
    const result = await runScreeningApi(jobId, shortlistSize);
    dispatch(setStep("parsing"));
    await new Promise((r) => setTimeout(r, 150));
    dispatch(setStep("saving"));
    await new Promise((r) => setTimeout(r, 150));
    return { jobId, result };
  } catch (err) {
    return rejectWithValue(
      err instanceof ApiError ? err.message : "Screening failed. Please try again."
    );
  }
});

export const fetchResults = createAsyncThunk<
  { jobId: string; result: ScreeningResult | null },
  string,
  { rejectValue: string }
>("screening/fetch", async (jobId, { rejectWithValue }) => {
  try {
    const result = await getResultsApi(jobId);
    return { jobId, result };
  } catch (err) {
    return rejectWithValue(
      err instanceof ApiError ? err.message : "Could not load results."
    );
  }
});

const screeningSlice = createSlice({
  name: "screening",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<ScreeningStep>) {
      state.step = action.payload;
    },
    reset(state) {
      state.status = "idle";
      state.step = "idle";
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(runScreening.pending, (s) => {
      s.status = "running";
      s.step = "loading_job";
      s.error = null;
    });
    b.addCase(runScreening.fulfilled, (s, a) => {
      s.status = "done";
      s.step = "done";
      s.resultsByJobId[a.payload.jobId] = a.payload.result;
    });
    b.addCase(runScreening.rejected, (s, a) => {
      s.status = "error";
      s.step = "idle";
      s.error = a.payload ?? "Screening failed.";
    });
    b.addCase(fetchResults.fulfilled, (s, a) => {
      s.resultsByJobId[a.payload.jobId] = a.payload.result;
    });
  },
});

export const { setStep, reset } = screeningSlice.actions;
export default screeningSlice.reducer;
