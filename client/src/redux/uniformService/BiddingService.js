import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../services/baseQuery";
import { BIDDING_API } from "../../Api";

const BiddingApi = createApi({
  reducerPath: "Bidding",
  baseQuery: baseQuery,
  tagTypes: ["Bidding"],
  endpoints: (builder) => ({
    getBids: builder.query({
      query: (arg) => ({
        url: BIDDING_API,
        method: "GET",
        params: arg?.params !== undefined ? arg.params : arg,
      }),
      providesTags: ["Bidding"],
    }),
    getBidById: builder.query({
      query: (arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        const params = typeof arg === "object" ? (arg.params || arg) : undefined;
        let queryParams = params;
        if (queryParams && queryParams.id) {
          const { id: _, ...rest } = queryParams;
          queryParams = rest;
        }
        return {
          url: `${BIDDING_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params: queryParams,
        };
      },
      providesTags: ["City"],
    }),
    createBid: builder.mutation({
      query: (payload) => ({
        url: BIDDING_API,
        method: "POST",
        body: payload instanceof FormData ? payload : (payload.formData || payload),
      }),
      invalidatesTags: ["Bidding"],
    }),
    updateBid: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `${BIDDING_API}/${id}`,
        method: "PUT",
        body: payload instanceof FormData ? payload : (payload.formData || payload),
      }),
      invalidatesTags: ["Bidding"],
    }),
    deleteBid: builder.mutation({
      query: (id) => ({
        url: `${BIDDING_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bidding"],
    }),
  }),
});

export const {
  useGetBidsQuery,
  useGetBidByIdQuery,
  useCreateBidMutation,
  useUpdateBidMutation,
  useDeleteBidMutation,
} = BiddingApi;

export default BiddingApi;
