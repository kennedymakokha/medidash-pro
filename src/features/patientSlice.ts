import { apiSlice } from "./apiSlice";
const USER_URL = "/api/patients";

export const patientApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createpatient: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchpatients: builder.query({
            query: ({ page, limit, search,status,track }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}&track=${track}`
        }),
        fetchpatientsoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),


    })
})

export const {
    useCreatepatientMutation,
    useFetchpatientsQuery,
    useFetchpatientsoverviewsQuery,

} = patientApiSlice