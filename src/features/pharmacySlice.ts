import { apiSlice } from "./apiSlice";

const PHARMACY_URL = "/api/pharmacy";

export const pharmacyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchMedications: builder.query({
      query: ({ page, limit, search, status }) =>
        `${PHARMACY_URL}/medications?page=${page}&limit=${limit}&search=${search || ''}&status=${status || ''}`,
    }),
    createMedication: builder.mutation({
      query: (data) => ({
        url: `${PHARMACY_URL}/medications`,
        method: "POST",
        body: data,
      }),
    }),
    updateMedication: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PHARMACY_URL}/medications/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteMedication: builder.mutation({
      query: (id) => ({
        url: `${PHARMACY_URL}/medications/${id}`,
        method: "DELETE",
      }),
    }),
    restockMedication: builder.mutation({
      query: (data) => ({
        url: `${PHARMACY_URL}/restock`,
        method: "POST",
        body: data,
      }),
    }),
    fetchPrescriptions: builder.query({
      query: ({ page, limit, status }) =>
        `${PHARMACY_URL}/prescriptions?page=${page}&limit=${limit}&status=${status || ''}`,
    }),
    dispensePrescription: builder.mutation({
      query: (data) => ({
        url: `${PHARMACY_URL}/dispense`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useFetchMedicationsQuery,
  useCreateMedicationMutation,
  useUpdateMedicationMutation,
  useDeleteMedicationMutation,
  useRestockMedicationMutation,
  useFetchPrescriptionsQuery,
  useDispensePrescriptionMutation,
} = pharmacyApiSlice;
