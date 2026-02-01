import { apiSlice } from "./apiSlice";
const USER_URL = "/api/departments";

export const departmentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createdepartment: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: "POST",
                body: data
            })
        }),

        fetchdepartments: builder.query({
            query: ({ page, limit, search }) => `${USER_URL}?page=${page}&limit=${limit}&search=${search}`
        }),


    })
})

export const {
    useCreatedepartmentMutation,
    useFetchdepartmentsQuery

} = departmentApiSlice