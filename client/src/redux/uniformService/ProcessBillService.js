import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { PROCESS_BILL_API } from "../../Api";


const ProcessBillApi = createApi({
  reducerPath: "processBill",
  baseQuery: baseQuery,
  tagTypes: ["processBill"],
  endpoints: (builder) => ({
    getProcessBill: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PROCESS_BILL_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PROCESS_BILL_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["processBill"],
    }),
    getProcessBillById: builder.query({
      query: (id) => {
        return {
          url: `${PROCESS_BILL_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["processBill"],
    }),
    addProcessBill: builder.mutation({
      query: (payload) => ({
        url: PROCESS_BILL_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["processBill"],
    }),
    updateProcessBill: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PROCESS_BILL_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["processBill"],
    }),
    deleteProcessBill: builder.mutation({
      query: (id) => ({
        url: `${PROCESS_BILL_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["processBill"],
    }),
  }),
});

export const {
  useGetProcessBillQuery,
  useGetProcessBillByIdQuery,
  useLazyGetProcessBillByIdQuery,
  useAddProcessBillMutation,
  useUpdateProcessBillMutation,
  useDeleteProcessBillMutation,
} = ProcessBillApi;

export default ProcessBillApi;
