import { apiSlice } from "./apiSlice";
const USER_URL = "/api/procedures";

export const proceduresApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createprocedures: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchproceduress: builder.query({
            query: ({ page, limit, search,status }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}`
        }),
        fetchproceduressoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),


    })
})

export const {
    useCreateproceduresMutation,
    useFetchproceduressQuery,
    useFetchproceduressoverviewsQuery,

} = proceduresApiSlice