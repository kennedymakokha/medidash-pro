import { apiSlice } from "./apiSlice";
const USER_URL = "/api/lab-tests";

export const labApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createlab: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchlabs: builder.query({
            query: ({ page, limit, search,status }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}`
        }),
        fetchlabsoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),


    })
})

export const {
    useCreatelabMutation,
    useFetchlabsQuery,
    useFetchlabsoverviewsQuery,

} = labApiSlice