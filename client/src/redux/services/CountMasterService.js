import { createApi } from "@reduxjs/toolkit/query/react"
import baseQuery from "./baseQuery";
import { COUNTS_API } from "../../Api";

const CountMasterApi = createApi({
    reducerPath: "countMaster",
    baseQuery: baseQuery,
    tagTypes: ["CountMaster"],
    endpoints: (builder) => ({
        getCountMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: COUNTS_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: COUNTS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["CountMaster"],
        }),
        getCountMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${COUNTS_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["CountMaster"],
        }),
        addCountMaster: builder.mutation({
            query: (payload) => ({
                url: COUNTS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["CountMaster"],
        }),
        updateCountMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${COUNTS_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["CountMaster"],
        }),
        deleteCountMaster: builder.mutation({
            query: (id) => ({
                url: `${COUNTS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["CountMaster"],
        }),
    }),
});

export const {
    useGetCountMasterQuery,
    useGetCountMasterByIdQuery,
    useLazyGetCountMasterByIdQuery,
    useAddCountMasterMutation,
    useUpdateCountMasterMutation,
    useDeleteCountMasterMutation,
} = CountMasterApi;

export default CountMasterApi;
