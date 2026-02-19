import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const refreshThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      const { data } = await api.post("/auth/refresh", { refreshToken });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Refresh failed");
    }
  },
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.log(err)
  }
});

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/profile");
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

const initialState = {
  user: JSON.parse(localStorage.getItem("cms_user") || "null"),
  accessToken: localStorage.getItem("cms_access_token") || null,
  refreshToken: localStorage.getItem("cms_refresh_token") || null,
  loading: false,
  registerLoading: false,
  error: null,
  registerError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("cms_refresh_token", action.payload.refreshToken);
      }
      localStorage.setItem("cms_access_token", action.payload.accessToken);
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("cms_access_token");
      localStorage.removeItem("cms_refresh_token");
      localStorage.removeItem("cms_user");
    },
    clearErrors(state) {
      state.error = null;
      state.registerError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("cms_access_token", action.payload.accessToken);
        localStorage.setItem("cms_refresh_token", action.payload.refreshToken);
        localStorage.setItem("cms_user", JSON.stringify(action.payload.user));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("cms_access_token", action.payload.accessToken);
      })
      .addCase(refreshThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        localStorage.clear();
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        localStorage.removeItem("cms_access_token");
        localStorage.removeItem("cms_refresh_token");
        localStorage.removeItem("cms_user");
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("cms_user", JSON.stringify(action.payload));
      });
  },
});

export const { setTokens, clearAuth, clearErrors } = authSlice.actions;
export default authSlice.reducer;
