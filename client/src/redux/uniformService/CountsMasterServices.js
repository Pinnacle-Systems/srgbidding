import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COUNTS_API } from "../../Api";
import baseQuery from "../services/baseQuery";


const CountsMasterApi = createApi({
  reducerPath: "countsMaster",
  baseQuery: baseQuery,
  tagTypes: ["CountsMaster"],
  endpoints: (builder) => ({
    getCountsMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: COUNTS_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: COUNTS_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["CountsMaster"],
    }),
    getCountsMasterById: builder.query({
      query: (id) => {
        return {
          url: `${COUNTS_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["CountsMaster"],
    }),
    addCountsMaster: builder.mutation({
      query: (payload) => ({
        url: COUNTS_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["CountsMaster"],
    }),
    updateCountsMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${COUNTS_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["CountsMaster"],
    }),
    deleteCountsMaster: builder.mutation({
      query: (id) => ({
        url: `${COUNTS_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CountsMaster"],
    }),
  }),
});

export const {
  useGetCountsMasterQuery,
  useGetCountsMasterByIdQuery,
  useAddCountsMasterMutation,
  useUpdateCountsMasterMutation,
  useDeleteCountsMasterMutation,
} = CountsMasterApi;

export default CountsMasterApi;
