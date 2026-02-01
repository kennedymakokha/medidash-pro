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
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
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