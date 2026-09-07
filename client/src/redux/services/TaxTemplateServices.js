import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { TAX_TEMPLATE_API } from "../../Api";


const TaxTemplateApi = createApi({
  reducerPath: "taxTemplate",
  baseQuery: baseQuery,
  tagTypes: ["TaxTemplate"],
  endpoints: (builder) => ({
    getTaxTemplate: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: TAX_TEMPLATE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params,
          };
        }
        return {
          url: TAX_TEMPLATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["TaxTemplate"],
    }),
    getTaxTemplateById: builder.query({
      query: (id) => {
        return {
          url: `${TAX_TEMPLATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["TaxTemplate"],
    }),
    addTaxTemplate: builder.mutation({
      query: (payload) => ({
        url: TAX_TEMPLATE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["TaxTemplate"],
    }),
    updateTaxTemplate: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `${TAX_TEMPLATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["TaxTemplate"],
    }),
    deleteTaxTemplate: builder.mutation({
      query: (id) => ({
        url: `${TAX_TEMPLATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TaxTemplate"],
    }),
  }),
});

export const {
  useGetTaxTemplateQuery,
  useGetTaxTemplateByIdQuery,
  useLazyGetTaxTemplateByIdQuery,
  useAddTaxTemplateMutation,
  useUpdateTaxTemplateMutation,
  useDeleteTaxTemplateMutation,
} = TaxTemplateApi;

export default TaxTemplateApi;
