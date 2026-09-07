import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { ORDER_ENTRY_API } from "../../Api";


const OrderEntryApi = createApi({
  reducerPath: "orderEntry",
  baseQuery: baseQuery,
  tagTypes: ["orderEntry"],
  endpoints: (builder) => ({
    getOrderEntry: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: ORDER_ENTRY_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: ORDER_ENTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["orderEntry"],
    }),
    getRefList: builder.query({
      query: ({ params }) => {
        return {
          url: ORDER_ENTRY_API + "/refList",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["orderEntry"],
    }),
    getOrderItemsList: builder.query({
      query: ({ params }) => {
        return {
          url: ORDER_ENTRY_API + "/orderitemsList",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["orderEntry"],
    }),
    getOrderEntryById: builder.query({
      query: (id) => {
        return {
          url: `${ORDER_ENTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["orderEntry"],
    }),
    addOrderEntry: builder.mutation({
      query: (payload) => ({
        url: ORDER_ENTRY_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["orderEntry"],
    }),
    updateOrderEntry: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${ORDER_ENTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["orderEntry"],
    }),
    deleteOrderEntry: builder.mutation({
      query: (id) => ({
        url: `${ORDER_ENTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orderEntry"],
    }),
  }),
});

export const {
  useGetOrderEntryQuery,
  useGetOrderEntryByIdQuery,
  useGetRefListQuery,
  useGetOrderItemsListQuery,
  useLazyGetOrderEntryByIdQuery,
  useAddOrderEntryMutation,
  useUpdateOrderEntryMutation,
  useDeleteOrderEntryMutation,
} = OrderEntryApi;

export default OrderEntryApi;
