import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { TAX_TERM_API} from "../../Api";


const TaxTermMasterApi = createApi({
  reducerPath: "taxTermMaster",
  baseQuery: baseQuery,
  tagTypes: ["TaxTermMaster"],
  endpoints: (builder) => ({
    getTaxTermMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: TAX_TERM_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: TAX_TERM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["TaxTermMaster"],
    }),
    getTaxTermMasterById: builder.query({
      query: (id) => {
        return {
          url: `${TAX_TERM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["TaxTermMaster"],
    }),
    addTaxTermMaster: builder.mutation({
      query: (payload) => ({
        url: TAX_TERM_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["TaxTermMaster"],
    }),
    updateTaxTermMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${TAX_TERM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["TaxTermMaster"],
    }),
    deleteTaxTermMaster: builder.mutation({
      query: (id) => ({
        url: `${TAX_TERM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TaxTermMaster"],
    }),
  }),
});

export const {
  useGetTaxTermMasterQuery,
  useGetTaxTermMasterByIdQuery,
  useLazyGetTaxTermMasterByIdQuery,
  useAddTaxTermMasterMutation,
  useUpdateTaxTermMasterMutation,
  useDeleteTaxTermMasterMutation,
} = TaxTermMasterApi;

export default TaxTermMasterApi;
