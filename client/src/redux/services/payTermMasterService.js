import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { PAY_TERM_API} from "../../Api";


const PaytermMasterApi = createApi({
  reducerPath: "paytermMaster",
  baseQuery: baseQuery,
  tagTypes: ["PaytermMaster"],
  endpoints: (builder) => ({
    getPaytermMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PAY_TERM_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PAY_TERM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["PaytermMaster"],
    }),
    getPaytermMasterById: builder.query({
      query: (id) => {
        return {
          url: `${PAY_TERM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PaytermMaster"],
    }),
    addPaytermMaster: builder.mutation({
      query: (payload) => ({
        url: PAY_TERM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PaytermMaster"],
    }),
    updatePaytermMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PAY_TERM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PaytermMaster"],
    }),
    deletePaytermMaster: builder.mutation({
      query: (id) => ({
        url: `${PAY_TERM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaytermMaster"],
    }),
  }),
});

export const {
  useGetPaytermMasterQuery,
  useGetPaytermMasterByIdQuery,
  useAddPaytermMasterMutation,
  useUpdatePaytermMasterMutation,
  useDeletePaytermMasterMutation,
} = PaytermMasterApi;

export default PaytermMasterApi;
