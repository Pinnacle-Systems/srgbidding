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
      query: (arg) => {
        const name = typeof arg === "object" ? arg?.name : arg;
        const params = typeof arg === "object" ? arg?.params : undefined;
        return {
          url: `${INDENT_TYPE_MASTER_API}/${name}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          ...(params ? { params } : {}),
        };
      },
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
