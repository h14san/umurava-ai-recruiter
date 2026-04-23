import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addApplicants, listApplicants, ApiError } from "@/lib/api";
import type { Applicant, UmuravaProfile } from "@/types";

interface ApplicantsState {
  byJobId: Record<string, Applicant[]>;
  status: "idle" | "loading" | "error";
  error: string | null;
  addStatus: "idle" | "loading" | "error";
  addError: string | null;
}

const initialState: ApplicantsState = {
  byJobId: {},
  status: "idle",
  error: null,
  addStatus: "idle",
  addError: null,
};

export const fetchApplicants = createAsyncThunk<
  { jobId: string; applicants: Applicant[] },
  string,
  { rejectValue: string }
>("applicants/fetch", async (jobId, { rejectWithValue }) => {
  try {
    const applicants = await listApplicants(jobId);
    return { jobId, applicants };
  } catch (err) {
    return rejectWithValue(
      err instanceof ApiError ? err.message : "Could not load applicants."
    );
  }
});

export const addApplicantsThunk = createAsyncThunk<
  { jobId: string; applicants: Applicant[] },
  { jobId: string; profiles: UmuravaProfile[] },
  { rejectValue: string }
>("applicants/add", async ({ jobId, profiles }, { rejectWithValue }) => {
  try {
    const { applicants } = await addApplicants(jobId, profiles);
    return { jobId, applicants };
  } catch (err) {
    return rejectWithValue(
      err instanceof ApiError ? err.message : "Could not add applicants."
    );
  }
});

const applicantsSlice = createSlice({
  name: "applicants",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchApplicants.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchApplicants.fulfilled, (s, a) => {
      s.status = "idle";
      s.byJobId[a.payload.jobId] = a.payload.applicants;
    });
    b.addCase(fetchApplicants.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload ?? "Could not load applicants.";
    });
    b.addCase(addApplicantsThunk.pending, (s) => {
      s.addStatus = "loading";
      s.addError = null;
    });
    b.addCase(addApplicantsThunk.fulfilled, (s, a) => {
      s.addStatus = "idle";
      const existing = s.byJobId[a.payload.jobId] ?? [];
      s.byJobId[a.payload.jobId] = [...a.payload.applicants, ...existing];
    });
    b.addCase(addApplicantsThunk.rejected, (s, a) => {
      s.addStatus = "error";
      s.addError = a.payload ?? "Could not add applicants.";
    });
  },
});

export default applicantsSlice.reducer;
