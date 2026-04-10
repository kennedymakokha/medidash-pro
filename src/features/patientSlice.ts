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
            query: ({ page, limit, billing, search, status, track }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}&track=${track}&billing=${billing}`
        }),
        FetchVisitsByPatient: builder.query({
            query: (patientId) => `/api/visits?patientId=${patientId}`
        }),
         fetchpatientByID: builder.query({
            query: (id) => `${USER_URL}/${id}`
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
    useFetchpatientByIDQuery,
    useFetchVisitsByPatientQuery

} = patientApiSlice