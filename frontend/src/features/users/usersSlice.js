import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (
    { page = 1, limit = 10, search = "", status = "" } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get("/users", { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const createUser = createAsyncThunk(
  "users/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users", payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create user",
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${id}`, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update user",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.page = action.payload.page || 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
        state.total -= 1;
      });
  },
});

export default usersSlice.reducer;
