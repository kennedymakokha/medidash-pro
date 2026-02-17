import { apiSlice } from "./apiSlice";
const USER_URL = "/api/payments";

export const paymentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createpayment: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchpayments: builder.query({
            query: ({ page, limit, search,track }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}&track=${track}`
        }),

        fetchmonthlysum: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}/monthly-payments`
        }),
    })
})

export const {
    useCreatepaymentMutation,
    useFetchpaymentsQuery,
    useFetchmonthlysumQuery

} = paymentApiSlice