import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { INTERNAL_INDENT_API } from "../../Api";


const InternalIndentIssueApi = createApi({
  reducerPath: "InternalIndentIssue",
  baseQuery: baseQuery,
  tagTypes: ["InternalIndentIssue"],
  endpoints: (builder) => ({
    getInternalIndentIssue: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: INTERNAL_INDENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: INTERNAL_INDENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["InternalIndentIssue"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${INTERNAL_INDENT_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getInternalIndentIssueById: builder.query({
      query: (id) => {
        return {
          url: `${INTERNAL_INDENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["InternalIndentIssue"],
    }),
    getInternalIndentIssueForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${INTERNAL_INDENT_API}/InternalIndentIssueForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["InternalIndentIssue"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${INTERNAL_INDENT_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["InternalIndentIssue"],
    }),
    addInternalIndentIssue: builder.mutation({
      query: (payload) => ({
        url: INTERNAL_INDENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["InternalIndentIssue"],
    }),
    updateInternalIndentIssue: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${INTERNAL_INDENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["InternalIndentIssue"],
    }),
    deleteInternalIndentIssue: builder.mutation({
      query: (id) => ({
        url: `${INTERNAL_INDENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InternalIndentIssue"],
    }),
  }),
});

export const {
  useGetInternalIndentIssueQuery,
  useGetInternalIndentIssueByIdQuery,
  useLazyGetInternalIndentIssueByIdQuery,
  useAddInternalIndentIssueMutation,
  useUpdateInternalIndentIssueMutation,
  useDeleteInternalIndentIssueMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetInternalIndentIssueForBillByIdQuery,
} = InternalIndentIssueApi;

export default InternalIndentIssueApi;
