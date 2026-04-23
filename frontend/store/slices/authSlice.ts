import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { loginApi, ApiError } from "@/lib/api";
import { AUTH_STORAGE_KEY } from "@/constants";
import type { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "error";
  error: string | null;
}

function loadInitial(): Pick<AuthState, "token" | "user"> {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as { token?: string; user?: User };
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

const initialState: AuthState = {
  ...loadInitial(),
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    return await loginApi(email, password);
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : "Login failed. Please try again.";
    return rejectWithValue(msg);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        document.cookie = "umurava_authed=; Max-Age=0; path=/";
      }
    },
    hydrate(state) {
      const loaded = loadInitial();
      state.token = loaded.token;
      state.user = loaded.user;
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(
      login.fulfilled,
      (s, a: PayloadAction<{ token: string; user: User }>) => {
        s.status = "idle";
        s.token = a.payload.token;
        s.user = a.payload.user;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(a.payload));
          document.cookie = `umurava_authed=1; path=/; max-age=${60 * 60 * 24 * 7}`;
        }
      }
    );
    b.addCase(login.rejected, (s, a) => {
      s.status = "error";
      s.error = a.payload ?? "Login failed.";
    });
  },
});

export const { logout, hydrate } = authSlice.actions;
export default authSlice.reducer;
