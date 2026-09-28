import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { GENERAL_INDENT_API } from "../../Api";


const GeneralIndentApi = createApi({
  reducerPath: "GeneralIndent",
  baseQuery: baseQuery,
  tagTypes: ["GeneralIndent"],
  endpoints: (builder) => ({
    getGeneralIndent: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: GENERAL_INDENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: GENERAL_INDENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["GeneralIndent"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${GENERAL_INDENT_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getGeneralIndentById: builder.query({
      query: (id) => {
        return {
          url: `${GENERAL_INDENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["GeneralIndent"],
    }),
    getGeneralIndentForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${GENERAL_INDENT_API}/GeneralIndentForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["GeneralIndent"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${GENERAL_INDENT_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["GeneralIndent"],
    }),
    addGeneralIndent: builder.mutation({
      query: (payload) => ({
        url: GENERAL_INDENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
    updateGeneralIndent: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${GENERAL_INDENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["GeneralIndent"],
    }),
    deleteGeneralIndent: builder.mutation({
      query: (id) => ({
        url: `${GENERAL_INDENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
    submitIndent: builder.mutation({
      query: (id) => ({
        url: `${GENERAL_INDENT_API}/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
    approveIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${GENERAL_INDENT_API}/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
    rejectIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${GENERAL_INDENT_API}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
    returnIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${GENERAL_INDENT_API}/${id}/return`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
    cancelIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${GENERAL_INDENT_API}/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GeneralIndent"],
    }),
  }),
});

export const {
  useGetGeneralIndentQuery,
  useGetGeneralIndentByIdQuery,
  useLazyGetGeneralIndentByIdQuery,
  useAddGeneralIndentMutation,
  useUpdateGeneralIndentMutation,
  useDeleteGeneralIndentMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetGeneralIndentForBillByIdQuery,
  useSubmitIndentMutation,
  useApproveIndentMutation,
  useRejectIndentMutation,
  useReturnIndentMutation,
  useCancelIndentMutation,
} = GeneralIndentApi;

export default GeneralIndentApi;
