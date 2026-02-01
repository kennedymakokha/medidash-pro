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
        updatepatient: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/${data._id}`,
                method: "PUT",
                body: data
            })
        }),
        deletepatient: builder.mutation({
            query: (id) => ({
                url: `${USER_URL}/${id}`,
                method: "DELETE",
            })
        })

    })
})

export const {
    useCreatepatientMutation,
    useDeletepatientMutation,
    useFetchpatientsQuery,
    useUpdatepatientMutation
} = patientApiSlice