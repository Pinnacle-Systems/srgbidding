import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { EMPLOYEE_API} from "../../Api";


const employeeMasterApi = createApi({
  reducerPath: "employeeMaster",
  baseQuery: baseQuery,
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    getEmployee: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: EMPLOYEE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: EMPLOYEE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["Employee"],
    }),
    getEmployeeById: builder.query({
      query: (id) => {
        return {
          url: `${EMPLOYEE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["Employee"],
    }),
    addEmployee: builder.mutation({
      query: (payload) => ({
        url: EMPLOYEE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Employee"],
    }),
    updateEmployee: builder.mutation({
      query: ({id, body}) => {
        return {
          url: `${EMPLOYEE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Employee"],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `${EMPLOYEE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetEmployeeQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeMasterApi;

export default employeeMasterApi;
