import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { PURCHASE_REPORT_API } from "../../Api";


const purchaseReportApi = createApi({
  reducerPath: "purchaseReport",
  baseQuery: baseQuery,
  tagTypes: ["PurchaseReport"],
  endpoints: (builder) => ({
    // GET /purchase-report
    // params: { branchId, finYearId, startDate, endDate, supplierId, poType, inwardType }
    getPurchaseReport: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: PURCHASE_REPORT_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: PURCHASE_REPORT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["PurchaseReport"],
    }),

    // GET /purchase-report/:id — single PO with all child docs
    getPurchaseReportById: builder.query({
      query: (id) => ({
        url: `${PURCHASE_REPORT_API}/${id}`,
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["PurchaseReport"],
    }),
  }),
});

export const { useGetPurchaseReportQuery, useGetPurchaseReportByIdQuery } =
  purchaseReportApi;

export default purchaseReportApi;
