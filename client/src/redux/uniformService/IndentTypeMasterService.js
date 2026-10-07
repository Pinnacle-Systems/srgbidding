import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "../services/baseQuery";
import { INDENT_TYPE_MASTER_API } from "../../Api";

const IndentTypeMasterApi = createApi({
  reducerPath: "IndentTypeMaster",
  baseQuery: baseQuery,
  tagTypes: ["IndentTypeMaster"],
  endpoints: (builder) => ({
    getIndentTypeMasters: builder.query({
      query: (params) => ({
        url: INDENT_TYPE_MASTER_API,
        method: "GET",
        params,
      }),
      providesTags: ["IndentTypeMaster"],
    }),
    getIndentTypeMasterByName: builder.query({
      query: (name) => `${INDENT_TYPE_MASTER_API}/${name}`,
      providesTags: ["IndentTypeMaster"],
    }),
    saveIndentTypeMaster: builder.mutation({
      query: ({ name, fieldSchema }) => ({
        url: `${INDENT_TYPE_MASTER_API}/${name}`,
        method: "POST",
        body: { fieldSchema },
      }),
      invalidatesTags: ["IndentTypeMaster"],
    }),
  }),
});

export const {
  useGetIndentTypeMastersQuery,
  useGetIndentTypeMasterByNameQuery,
  useSaveIndentTypeMasterMutation,
} = IndentTypeMasterApi;

export default IndentTypeMasterApi;
