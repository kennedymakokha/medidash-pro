import { apiSlice } from "./apiSlice";
const USER_URL = "/api/visits";

export const patientApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createvisit: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchvisits: builder.query({
            query: ({ page, limit, search,track }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}&track=${track}`
        }),
        fetchvisitlaborders: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}/lab-orders?page=${page}&limit=${limit}&search=${search}`
        }),


    })
})

export const {
    useCreatevisitMutation,
    useFetchvisitsQuery,
    useFetchvisitlabordersQuery


} = patientApiSlice