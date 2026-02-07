import { apiSlice } from "./apiSlice";
const USER_URL = "/api/wards";

export const wardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createward: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchwards: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
        }),
        fetchwardsoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),


    })
})

export const {
    useCreatewardMutation,
    useFetchwardsQuery,
    useFetchwardsoverviewsQuery,

} = wardApiSlice