import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { COUNTRY_API} from "../../Api";


const countryMasterApi = createApi({
  reducerPath: "countryMaster",
  baseQuery: baseQuery,
  tagTypes: ["Countries"],
  endpoints: (builder) => ({
    getCountries: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: COUNTRY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: COUNTRY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Countries"],
    }),
    getCountryById: builder.query({
      query: (id) => {
        return {
          url: `${COUNTRY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Countries"],
    }),
    addCountry: builder.mutation({
      query: (payload) => ({
        url: COUNTRY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Countries"],
    }),
    updateCountry: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${COUNTRY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Countries"],
    }),
    deleteCountry: builder.mutation({
      query: (id) => ({
        url: `${COUNTRY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Countries"],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetCountryByIdQuery,
  useAddCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} = countryMasterApi;

export default countryMasterApi;
