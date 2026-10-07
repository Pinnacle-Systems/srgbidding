import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../services/baseQuery";
import { BIDDING_API } from "../../Api";

const BiddingApi = createApi({
  reducerPath: "Bidding",
  baseQuery: baseQuery,
  tagTypes: ["Bidding"],
  endpoints: (builder) => ({
    getBids: builder.query({
      query: (params) => ({
        url: BIDDING_API,
        method: "GET",
        params,
      }),
      providesTags: ["Bidding"],
    }),
    getBidById: builder.query({
      query: (id) => `${BIDDING_API}/${id}`,
      providesTags: ["Bidding"],
    }),
    createBid: builder.mutation({
      query: (payload) => ({
        url: BIDDING_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Bidding"],
    }),
    updateBid: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `${BIDDING_API}/${id}`,
        method: "PUT",
        body: payload,
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
