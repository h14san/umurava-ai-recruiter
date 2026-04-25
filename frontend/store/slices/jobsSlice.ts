import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { listJobs, createJob as createJobApi, getJob, deleteJob as deleteJobApi, ApiError } from "@/lib/api";
import type { CreateJobInput, Job } from "@/types";

interface JobsState {
  list: Job[];
  current: Job | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  createStatus: "idle" | "loading" | "error";
  createError: string | null;
}

const initialState: JobsState = {
  list: [],
  current: null,
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
};

export const fetchJobs = createAsyncThunk<Job[], void, { rejectValue: string }>(
  "jobs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await listJobs();
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : "Could not load jobs.");
    }
  }
);

export const fetchJob = createAsyncThunk<Job, string, { rejectValue: string }>(
  "jobs/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await getJob(id);
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : "Could not load job.");
    }
  }
);

export const createJob = createAsyncThunk<Job, CreateJobInput, { rejectValue: string }>(
  "jobs/create",
  async (input, { rejectWithValue }) => {
    try {
      return await createJobApi(input);
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : "Could not create job.");
    }
  }
);

export const deleteJob = createAsyncThunk<string, string, { rejectValue: string }>(
  "jobs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteJobApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : "Could not delete job.");
    }
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchJobs.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchJobs.fulfilled, (s, a) => {
      s.status = "idle";
      s.list = a.payload;
    });
    b.addCase(fetchJobs.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload ?? "Could not load jobs.";
    });

    b.addCase(fetchJob.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchJob.fulfilled, (s, a) => {
      s.status = "idle";
      s.current = a.payload;
    });
    b.addCase(fetchJob.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload ?? "Could not load job.";
    });

    b.addCase(createJob.pending, (s) => {
      s.createStatus = "loading";
      s.createError = null;
    });
    b.addCase(createJob.fulfilled, (s, a) => {
      s.createStatus = "idle";
      s.list = [a.payload, ...s.list];
      s.current = a.payload;
    });
    b.addCase(createJob.rejected, (s, a) => {
      s.createStatus = "error";
      s.createError = a.payload ?? "Could not create job.";
    });

    b.addCase(deleteJob.fulfilled, (s, a) => {
      s.list = s.list.filter((job) => job._id !== a.payload);
      if (s.current?._id === a.payload) s.current = null;
    });
  },
});

export const { clearCurrent } = jobsSlice.actions;
export default jobsSlice.reducer;