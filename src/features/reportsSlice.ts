import { apiSlice } from "./apiSlice";
const VISITS_URL = "/api/visits";

export const reportsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchReportsData: builder.query({
      query: ({ page, limit, search }) =>
        `${VISITS_URL}?page=${page}&limit=${limit}&search=${search}`,
    }),
  }),
});

export const { useFetchReportsDataQuery } = reportsApiSlice;
