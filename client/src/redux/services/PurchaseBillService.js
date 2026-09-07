import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { PURCHASE_BILL_API} from "../../Api";


const purchaseBillApi = createApi({
  reducerPath: "purchaseBill",
  baseQuery: baseQuery,
  tagTypes: ["PurchaseBill"],
  endpoints: (builder) => ({
    getPurchaseBill: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: PURCHASE_BILL_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: PURCHASE_BILL_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["PurchaseBill"],
    }),
    getPurchaseBillById: builder.query({
      query: (id) => {
        return {
          url: `${PURCHASE_BILL_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["PurchaseBill"],
    }),
    addPurchaseBill: builder.mutation({
      query: (payload) => ({
        url: PURCHASE_BILL_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["PurchaseBill"],
    }),
    updatePurchaseBill: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${PURCHASE_BILL_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PurchaseBill"],
    }),
    deletePurchaseBill: builder.mutation({
      query: (id) => ({
        url: `${PURCHASE_BILL_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseBill"],
    }),
  }),
});

export const {
  useGetPurchaseBillQuery,
  useGetPurchaseBillByIdQuery,
  useAddPurchaseBillMutation,
  useUpdatePurchaseBillMutation,
  useDeletePurchaseBillMutation,
} = purchaseBillApi;

export default purchaseBillApi;
