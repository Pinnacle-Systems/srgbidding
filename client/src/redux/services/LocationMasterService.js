import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { LOCATION_API} from "../../Api";


const LocationMasterApi = createApi({
  reducerPath: "locationMaster",
  baseQuery: baseQuery,
  tagTypes: ["LocationMaster"],
  endpoints: (builder) => ({
    getLocationMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: LOCATION_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: LOCATION_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["LocationMaster"],
    }),
    getLocationMasterById: builder.query({
      query: (id) => {
        return {
          url: `${LOCATION_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["LocationMaster"],
    }),
    addLocationMaster: builder.mutation({
      query: (payload) => ({
        url: LOCATION_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["LocationMaster"],
    }),
    updateLocationMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${LOCATION_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["LocationMaster"],
    }),
    deleteLocationMaster: builder.mutation({
      query: (id) => ({
        url: `${LOCATION_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LocationMaster"],
    }),
  }),
});

export const {
  useGetLocationMasterQuery,
  useGetLocationMasterByIdQuery,
  useLazyGetLocationMasterByIdQuery,
  useAddLocationMasterMutation,
  useUpdateLocationMasterMutation,
  useDeleteLocationMasterMutation,
} = LocationMasterApi;

export default LocationMasterApi;
