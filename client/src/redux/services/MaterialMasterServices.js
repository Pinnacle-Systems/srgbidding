import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { MATERIAL_MASTER_API } from "../../Api";


const MaterialMasterApi = createApi({
  reducerPath: "MaterialMaster",
  baseQuery: baseQuery,
  tagTypes: ["MaterialMaster"],
  endpoints: (builder) => ({
    getMaterialMaster: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: MATERIAL_MASTER_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: MATERIAL_MASTER_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["MaterialMaster"],
    }),
    getMaterialMasterById: builder.query({
      query: (id) => {
        return {
          url: `${MATERIAL_MASTER_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MaterialMaster"],
    }),
    addMaterialMaster: builder.mutation({
      query: (payload) => ({
        url: MATERIAL_MASTER_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["MaterialMaster"],
    }),
    updateMaterialMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${MATERIAL_MASTER_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["MaterialMaster"],
    }),
    deleteMaterialMaster: builder.mutation({
      query: (id) => ({
        url: `${MATERIAL_MASTER_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MaterialMaster"],
    }),
  }),
});

export const {
  useGetMaterialMasterQuery,
  useGetMaterialMasterByIdQuery,
  useLazyGetMaterialMasterByIdQuery,
  useAddMaterialMasterMutation,
  useUpdateMaterialMasterMutation,
  useDeleteMaterialMasterMutation,
} = MaterialMasterApi;

export default MaterialMasterApi;
