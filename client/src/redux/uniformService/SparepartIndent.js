import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { SPAREPART_INDENT_API } from "../../Api";


const SparepartIndentApi = createApi({
  reducerPath: "SparepartIndent",
  baseQuery: baseQuery,
  tagTypes: ["SparepartIndent"],
  endpoints: (builder) => ({
    getSparepartIndent: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: SPAREPART_INDENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: SPAREPART_INDENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SparepartIndent"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${SPAREPART_INDENT_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getSparepartIndentById: builder.query({
      query: (id) => {
        return {
          url: `${SPAREPART_INDENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["SparepartIndent"],
    }),
    getSparepartIndentForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${SPAREPART_INDENT_API}/SparepartIndentForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SparepartIndent"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${SPAREPART_INDENT_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["SparepartIndent"],
    }),
    addSparepartIndent: builder.mutation({
      query: (payload) => ({
        url: SPAREPART_INDENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
    updateSparepartIndent: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${SPAREPART_INDENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["SparepartIndent"],
    }),
    deleteSparepartIndent: builder.mutation({
      query: (id) => ({
        url: `${SPAREPART_INDENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
    submitIndent: builder.mutation({
      query: (id) => ({
        url: `${SPAREPART_INDENT_API}/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
    approveIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${SPAREPART_INDENT_API}/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
    rejectIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${SPAREPART_INDENT_API}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
    returnIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${SPAREPART_INDENT_API}/${id}/return`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
    cancelIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${SPAREPART_INDENT_API}/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SparepartIndent"],
    }),
  }),
});

export const {
  useGetSparepartIndentQuery,
  useGetSparepartIndentByIdQuery,
  useLazyGetSparepartIndentByIdQuery,
  useAddSparepartIndentMutation,
  useUpdateSparepartIndentMutation,
  useDeleteSparepartIndentMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetSparepartIndentForBillByIdQuery,
  useSubmitIndentMutation,
  useApproveIndentMutation,
  useRejectIndentMutation,
  useReturnIndentMutation,
  useCancelIndentMutation,
} = SparepartIndentApi;

export default SparepartIndentApi;
