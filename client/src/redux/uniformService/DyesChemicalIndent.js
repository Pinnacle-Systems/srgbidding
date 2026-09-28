import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { DYESCHEMICAL_INDENT_API } from "../../Api";


const DyesChemicalIndentApi = createApi({
  reducerPath: "DyesChemicalIndent",
  baseQuery: baseQuery,
  tagTypes: ["DyesChemicalIndent"],
  endpoints: (builder) => ({
    getDyesChemicalIndent: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: DYESCHEMICAL_INDENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: DYESCHEMICAL_INDENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["DyesChemicalIndent"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${DYESCHEMICAL_INDENT_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getDyesChemicalIndentById: builder.query({
      query: (id) => {
        return {
          url: `${DYESCHEMICAL_INDENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["DyesChemicalIndent"],
    }),
    getDyesChemicalIndentForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${DYESCHEMICAL_INDENT_API}/DyesChemicalIndentForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["DyesChemicalIndent"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${DYESCHEMICAL_INDENT_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["DyesChemicalIndent"],
    }),
    addDyesChemicalIndent: builder.mutation({
      query: (payload) => ({
        url: DYESCHEMICAL_INDENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    updateDyesChemicalIndent: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${DYESCHEMICAL_INDENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    deleteDyesChemicalIndent: builder.mutation({
      query: (id) => ({
        url: `${DYESCHEMICAL_INDENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    submitIndent: builder.mutation({
      query: (id) => ({
        url: `${DYESCHEMICAL_INDENT_API}/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    approveIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${DYESCHEMICAL_INDENT_API}/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    rejectIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${DYESCHEMICAL_INDENT_API}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    returnIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${DYESCHEMICAL_INDENT_API}/${id}/return`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
    cancelIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${DYESCHEMICAL_INDENT_API}/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DyesChemicalIndent"],
    }),
  }),
});

export const {
  useGetDyesChemicalIndentQuery,
  useGetDyesChemicalIndentByIdQuery,
  useLazyGetDyesChemicalIndentByIdQuery,
  useAddDyesChemicalIndentMutation,
  useUpdateDyesChemicalIndentMutation,
  useDeleteDyesChemicalIndentMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetDyesChemicalIndentForBillByIdQuery,
  useSubmitIndentMutation,
  useApproveIndentMutation,
  useRejectIndentMutation,
  useReturnIndentMutation,
  useCancelIndentMutation,
} = DyesChemicalIndentApi;

export default DyesChemicalIndentApi;
