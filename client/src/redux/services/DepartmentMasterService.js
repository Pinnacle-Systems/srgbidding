import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { DEPARTMENT_API} from "../../Api";


const departmentMasterApi = createApi({
  reducerPath: "departmentMaster",
  baseQuery: baseQuery,
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    getDepartment: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: DEPARTMENT_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: DEPARTMENT_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Department"],
    }),
    getDepartmentById: builder.query({
      query: (id) => {
        return {
          url: `${DEPARTMENT_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Department"],
    }),
    addDepartment: builder.mutation({
      query: (payload) => ({
        url: DEPARTMENT_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Department"],
    }),
    updateDepartment: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${DEPARTMENT_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Department"],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `${DEPARTMENT_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetDepartmentQuery,
  useGetDepartmentByIdQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentMasterApi;

export default departmentMasterApi;
