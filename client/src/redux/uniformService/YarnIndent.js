import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { YARN_INDENT_API } from "../../Api";


const YarnIndentApi = createApi({
  reducerPath: "YarnIndent",
  baseQuery: baseQuery,
  tagTypes: ["YarnIndent"],
  endpoints: (builder) => ({
    getYarnIndent: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: YARN_INDENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: YARN_INDENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["YarnIndent"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${YARN_INDENT_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getYarnIndentById: builder.query({
      query: (id) => {
        return {
          url: `${YARN_INDENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["YarnIndent"],
    }),
    getYarnIndentForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${YARN_INDENT_API}/YarnIndentForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["YarnIndent"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${YARN_INDENT_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["YarnIndent"],
    }),
    addYarnIndent: builder.mutation({
      query: (payload) => ({
        url: YARN_INDENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["YarnIndent"],
    }),
    updateYarnIndent: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${YARN_INDENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["YarnIndent"],
    }),
    deleteYarnIndent: builder.mutation({
      query: (id) => ({
        url: `${YARN_INDENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["YarnIndent"],
    }),
    submitIndent: builder.mutation({
      query: (id) => ({
        url: `${YARN_INDENT_API}/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: ["YarnIndent"],
    }),
    approveIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${YARN_INDENT_API}/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["YarnIndent"],
    }),
    rejectIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${YARN_INDENT_API}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["YarnIndent"],
    }),
    returnIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${YARN_INDENT_API}/${id}/return`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["YarnIndent"],
    }),
    cancelIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${YARN_INDENT_API}/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["YarnIndent"],
    }),
  }),
});

export const {
  useGetYarnIndentQuery,
  useGetYarnIndentByIdQuery,
  useLazyGetYarnIndentByIdQuery,
  useAddYarnIndentMutation,
  useUpdateYarnIndentMutation,
  useDeleteYarnIndentMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetYarnIndentForBillByIdQuery,
  useSubmitIndentMutation,
  useApproveIndentMutation,
  useRejectIndentMutation,
  useReturnIndentMutation,
  useCancelIndentMutation,
} = YarnIndentApi;

export default YarnIndentApi;
