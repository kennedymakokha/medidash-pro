import { apiSlice } from "./apiSlice";
const USER_URL = "/api/patients-care";

export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTask: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchtasks: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
        }),
        fetchtasksoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),


    })
})

export const {
    useCreateTaskMutation,
    useFetchtasksQuery,
    useFetchtasksoverviewsQuery,

} = taskApiSlice