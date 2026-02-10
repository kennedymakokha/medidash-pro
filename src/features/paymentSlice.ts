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
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
        }),
      

    })
})

export const {
    useCreatepaymentMutation,
    useFetchpaymentsQuery,

} = paymentApiSlice