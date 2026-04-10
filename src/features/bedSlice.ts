import { apiSlice } from "./apiSlice";
const USER_URL = "/api/beds";

export const bedApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createbed: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchbeds: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
        }),
        fetchbedsoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),
        assignBed: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/assign`,
                method: "POST",
                body: data
            })
        }),
    })
})

export const {
    useCreatebedMutation,
    useFetchbedsQuery,
    useFetchbedsoverviewsQuery,
    useAssignBedMutation,
} = bedApiSlice