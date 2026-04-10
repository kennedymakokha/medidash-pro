import { apiSlice } from "./apiSlice";
const USER_URL = "/api/appointments";

export const AppointmentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createAppointment: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchAppointments: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
        }),
        fetchAppointmentsoverviews: builder.query({
            query: () => `${USER_URL}/overview`
        }),


    })
})

export const {
    useCreateAppointmentMutation,
    useFetchAppointmentsQuery,
    useFetchAppointmentsoverviewsQuery,

} = AppointmentApiSlice