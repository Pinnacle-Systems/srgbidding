import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { CITY_API} from "../../Api";


const cityMasterApi = createApi({
  reducerPath: "cityMaster",
  baseQuery: baseQuery,
  tagTypes: ["City"],
  endpoints: (builder) => ({
    getCity: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: CITY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: CITY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["City"],
    }),
    getCityById: builder.query({
      query: (id) => {
        return {
          url: `${CITY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["City"],
    }),
    addCity: builder.mutation({
      query: (payload) => ({
        url: CITY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["City"],
    }),
    updateCity: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${CITY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["City"],
    }),
    deleteCity: builder.mutation({
      query: (id) => ({
        url: `${CITY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["City"],
    }),
  }),
});

export const {
  useGetCityQuery,
  useGetCityByIdQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = cityMasterApi;

export default cityMasterApi;
