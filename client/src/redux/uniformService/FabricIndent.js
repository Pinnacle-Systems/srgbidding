import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { FABRIC_INDENT_API } from "../../Api";


const FabricIndentApi = createApi({
  reducerPath: "FabricIndent",
  baseQuery: baseQuery,
  tagTypes: ["FabricIndent"],
  endpoints: (builder) => ({
    getFabricIndent: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: FABRIC_INDENT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: FABRIC_INDENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["FabricIndent"],
    }),
    getPurchaseDetail: builder.query({
      query: ({ params }) => {
        return {
          url: `${FABRIC_INDENT_API}/purchaseDetail`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReturn"],
    }),
    getFabricIndentById: builder.query({
      query: (id) => {
        return {
          url: `${FABRIC_INDENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["FabricIndent"],
    }),
    getFabricIndentForBillById: builder.query({
      query: ({ params }) => {
        return {
          url: `${FABRIC_INDENT_API}/FabricIndentForBill`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["FabricIndent"],
    }),
    getPurInwardItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${FABRIC_INDENT_API}/purInwardItemDetails`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["FabricIndent"],
    }),
    addFabricIndent: builder.mutation({
      query: (payload) => ({
        url: FABRIC_INDENT_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["FabricIndent"],
    }),
    updateFabricIndent: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${FABRIC_INDENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["FabricIndent"],
    }),
    deleteFabricIndent: builder.mutation({
      query: (id) => ({
        url: `${FABRIC_INDENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FabricIndent"],
    }),
    submitIndent: builder.mutation({
      query: (id) => ({
        url: `${FABRIC_INDENT_API}/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: ["FabricIndent"],
    }),
    approveIndent: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload
        return {
          url: `${FABRIC_INDENT_API}/${id}/approve`,
          method: "POST",
          body,
        }

      },
      invalidatesTags: ["FabricIndent"],
    }),
    rejectIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${FABRIC_INDENT_API}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FabricIndent"],
    }),
    returnIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${FABRIC_INDENT_API}/${id}/return`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FabricIndent"],
    }),
    cancelIndent: builder.mutation({
      query: ({ id, body }) => ({
        url: `${FABRIC_INDENT_API}/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FabricIndent"],
    }),
  }),
});

export const {
  useGetFabricIndentQuery,
  useGetFabricIndentByIdQuery,
  useLazyGetFabricIndentByIdQuery,
  useAddFabricIndentMutation,
  useUpdateFabricIndentMutation,
  useDeleteFabricIndentMutation,
  useLazyGetPurchaseDetailQuery,
  useGetPurInwardItemsQuery,
  useGetFabricIndentForBillByIdQuery,
  useSubmitIndentMutation,
  useApproveIndentMutation,
  useRejectIndentMutation,
  useReturnIndentMutation,
  useCancelIndentMutation,
} = FabricIndentApi;

export default FabricIndentApi;
